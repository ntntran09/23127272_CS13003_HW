#!/usr/bin/env python3
"""Export a Codex session into audit-friendly Markdown and JSON."""

from __future__ import annotations

import argparse
import json
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any


def text_from_content(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                if isinstance(item.get("text"), str):
                    parts.append(item["text"])
                elif isinstance(item.get("input_text"), str):
                    parts.append(item["input_text"])
                elif isinstance(item.get("output_text"), str):
                    parts.append(item["output_text"])
            elif isinstance(item, str):
                parts.append(item)
        return "\n".join(part for part in parts if part).strip()
    return ""


def event_text(payload: dict[str, Any]) -> tuple[str | None, str, str]:
    if payload.get("type") != "message":
        return None, "", ""
    role = payload.get("role")
    if role not in {"user", "assistant"}:
        return None, "", ""
    return role, text_from_content(payload.get("content")), str(payload.get("phase") or "")


def normalize_text(role: str, text: str) -> str:
    if role == "user" and "## My request for Codex:" in text:
        text = text.split("## My request for Codex:", 1)[1]
    return text.strip()


def is_audit_noise(text: str) -> bool:
    stripped = text.strip()
    noise_prefixes = (
        "<environment_context>",
        "<collaboration_mode>",
        "<skills_instructions>",
    )
    return any(stripped.startswith(prefix) for prefix in noise_prefixes)


def find_sessions(codex_home: Path) -> list[Path]:
    sessions_dir = codex_home / "sessions"
    if not sessions_dir.exists():
        return []
    return sorted(
        sessions_dir.rglob("*.jsonl"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )


def select_session(args: argparse.Namespace) -> Path:
    if args.session and args.session != "latest":
        path = Path(args.session).expanduser()
        if not path.exists():
            raise SystemExit(f"Session file not found: {path}")
        return path

    codex_home = Path(args.codex_home or os.environ.get("CODEX_HOME") or Path.home() / ".codex")
    sessions = find_sessions(codex_home)
    if args.workspace:
        workspace = str(Path(args.workspace).resolve()).lower()
        matching: list[Path] = []
        for session in sessions:
            meta = read_session_meta(session)
            cwd = str(meta.get("cwd", "")).lower()
            if cwd and cwd == workspace:
                matching.append(session)
        sessions = matching or sessions

    if not sessions:
        raise SystemExit(f"No Codex session logs found under {codex_home / 'sessions'}")
    return sessions[0]


def read_session_meta(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                event = json.loads(line)
                if event.get("type") == "session_meta":
                    return event.get("payload", {})
    except (OSError, json.JSONDecodeError):
        return {}
    return {}


def read_messages(path: Path) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get("type") != "response_item":
                continue
            role, text, phase = event_text(event.get("payload", {}))
            if role and text:
                text = normalize_text(role, text)
            if not role or not text or is_audit_noise(text):
                continue
            messages.append(
                {
                    "role": role,
                    "phase": phase,
                    "text": text,
                    "timestamp": event.get("timestamp", ""),
                }
            )
    return messages


def group_interactions(messages: list[dict[str, str]], max_interactions: int | None) -> list[dict[str, str]]:
    interactions: list[dict[str, str]] = []
    current: dict[str, Any] | None = None

    for message in messages:
        if message["role"] == "user":
            if current:
                interactions.append(finalize(current))
            current = {
                "prompt": message["text"],
                "time": message["timestamp"],
                "outputs": [],
                "final_outputs": [],
            }
        elif message["role"] == "assistant" and current:
            current["outputs"].append(message["text"])
            if message.get("phase") == "final":
                current["final_outputs"].append(message["text"])

    if current:
        interactions.append(finalize(current))

    interactions = [item for item in interactions if item["prompt"] or item["output"]]
    if max_interactions:
        interactions = interactions[-max_interactions:]
    return interactions


def finalize(current: dict[str, Any]) -> dict[str, str]:
    final_outputs = current.get("final_outputs", [])
    all_outputs = current.get("outputs", [])
    output = final_outputs[-1] if final_outputs else (all_outputs[-1] if all_outputs else "")
    return {
        "tool": "Codex",
        "time": current.get("time", ""),
        "prompt": current.get("prompt", "").strip(),
        "output": output.strip(),
        "output_scope": "final_only" if final_outputs else "last_assistant_message",
    }


def clip(text: str, limit: int) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 20].rstrip() + "\n\n[Truncated in transcript export]"


def write_markdown(path: Path, session: Path, interactions: list[dict[str, str]]) -> None:
    lines = [
        "# Codex Chat Log",
        "",
        f"- Source session: `{session}`",
        f"- Exported at: `{datetime.now().isoformat(timespec='seconds')}`",
        f"- Interactions: `{len(interactions)}`",
        "",
    ]
    for index, item in enumerate(interactions, start=1):
        lines.extend(
            [
                f"## Interaction {index}",
                "",
                f"**Tool:** {item['tool']}",
                "",
                f"**Time:** {item['time'] or 'Unknown'}",
                "",
                "**Prompt:**",
                "",
                "```text",
                clip(item["prompt"], 12000),
                "```",
                "",
                "**AI Output (final answer only):**",
                "",
                "```text",
                clip(item["output"] or "No assistant output captured.", 20000),
                "```",
                "",
            ]
        )
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audit-folder", required=True, help="Folder where exported logs should be saved.")
    parser.add_argument("--workspace", help="Prefer the latest session whose metadata cwd matches this workspace.")
    parser.add_argument("--session", default="latest", help="Session JSONL path, or 'latest'.")
    parser.add_argument("--codex-home", help="Codex home directory. Defaults to CODEX_HOME or ~/.codex.")
    parser.add_argument("--max-interactions", type=int, help="Keep only the most recent N interactions.")
    args = parser.parse_args()

    audit_folder = Path(args.audit_folder).expanduser().resolve()
    audit_folder.mkdir(parents=True, exist_ok=True)
    output_dir = audit_folder / "codex-chat-logs"
    output_dir.mkdir(parents=True, exist_ok=True)

    session = select_session(args).resolve()
    raw_copy = output_dir / session.name
    shutil.copy2(session, raw_copy)

    messages = read_messages(session)
    interactions = group_interactions(messages, args.max_interactions)
    for index, item in enumerate(interactions, start=1):
        item["source"] = f"codex-chat-logs/codex-chat-log.md#interaction-{index}"
        item["verdict"] = ""
        item["reasoning"] = ""
        item["student_fix"] = ""

    markdown_path = output_dir / "codex-chat-log.md"
    json_path = output_dir / "ai-audit-interactions.json"
    write_markdown(markdown_path, session, interactions)
    json_path.write_text(json.dumps(interactions, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Copied raw session: {raw_copy}")
    print(f"Wrote Markdown transcript: {markdown_path}")
    print(f"Wrote audit JSON: {json_path}")
    print(f"Interactions exported: {len(interactions)}")


if __name__ == "__main__":
    main()
