#!/usr/bin/env python3
"""Compare an AI-generated original file with a student-edited final file."""

from __future__ import annotations

import argparse
import difflib
from dataclasses import dataclass
from pathlib import Path


TEXT_EXTENSIONS = {
    ".css",
    ".csv",
    ".html",
    ".js",
    ".json",
    ".md",
    ".py",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
}


@dataclass
class ChangeBlock:
    kind: str
    original_start: int
    final_start: int
    original_text: list[str]
    final_text: list[str]


def read_text(path: Path) -> str:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        raise SystemExit(
            f"Unsupported extension for direct text comparison: {path.suffix or '<none>'}. "
            "Extract the file to text/Markdown first."
        )
    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-16")


def change_kind(tag: str) -> str:
    return {
        "replace": "Changed",
        "delete": "Removed",
        "insert": "Added",
    }.get(tag, tag)


def summarize_blocks(original_lines: list[str], final_lines: list[str]) -> list[ChangeBlock]:
    matcher = difflib.SequenceMatcher(a=original_lines, b=final_lines, autojunk=False)
    blocks: list[ChangeBlock] = []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        blocks.append(
            ChangeBlock(
                kind=change_kind(tag),
                original_start=i1 + 1,
                final_start=j1 + 1,
                original_text=original_lines[i1:i2],
                final_text=final_lines[j1:j2],
            )
        )
    return blocks


def md_escape_cell(text: str, limit: int = 220) -> str:
    text = " ".join(line.strip() for line in text.splitlines() if line.strip())
    text = text.replace("|", "\\|")
    if len(text) > limit:
        return text[: limit - 3].rstrip() + "..."
    return text or "-"


def fenced(text: str) -> str:
    if not text:
        return "_None_"
    return "\n".join(line.rstrip("\n") for line in text.splitlines())


def default_output_path(original: Path, final: Path) -> Path:
    stem = f"{original.stem}_vs_{final.stem}_comparison.md"
    return final.parent / "ai-final-comparisons" / stem


def write_report(
    output: Path,
    original: Path,
    final: Path,
    original_text: str,
    final_text: str,
    context_lines: int,
) -> None:
    original_lines = original_text.splitlines()
    final_lines = final_text.splitlines()
    blocks = summarize_blocks(original_lines, final_lines)
    diff = list(
        difflib.unified_diff(
            original_lines,
            final_lines,
            fromfile=str(original),
            tofile=str(final),
            lineterm="",
            n=context_lines,
        )
    )

    added = sum(len(block.final_text) for block in blocks if block.kind == "Added")
    removed = sum(len(block.original_text) for block in blocks if block.kind == "Removed")
    changed = sum(1 for block in blocks if block.kind == "Changed")

    lines = [
        "# AI Original vs Final File Comparison",
        "",
        f"- AI original: `{original}`",
        f"- Final file: `{final}`",
        f"- Change blocks: `{len(blocks)}`",
        f"- Changed blocks: `{changed}`",
        f"- Added lines: `{added}`",
        f"- Removed lines: `{removed}`",
        "",
        "## Difference Summary",
        "",
        "| No. | Type | AI Original Location | Final Location | AI Original | Final Version | Reason / Audit Note |",
        "| :-- | :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    if not blocks:
        lines.append("| 1 | No change | - | - | - | - | Final file is identical to the AI original. |")
    else:
        for index, block in enumerate(blocks, start=1):
            original_preview = md_escape_cell("\n".join(block.original_text))
            final_preview = md_escape_cell("\n".join(block.final_text))
            lines.append(
                f"| {index} | {block.kind} | line {block.original_start} | line {block.final_start} | "
                f"{original_preview} | {final_preview} | Explain using assignment requirements, course material, or student review. |"
            )

    lines.extend(
        [
            "",
            "## Explanation Checklist",
            "",
            "- Correctness: note changes that fix wrong facts, expected results, test data, or domain partitions.",
            "- Completeness: note additions of missing equivalence classes, boundary values, negative cases, or evidence.",
            "- Formatting: note changes needed for the required submission/report structure.",
            "- Evidence: note added citations, screenshots, issue links, or traceability.",
            "- Scope: note removed hallucinated, duplicate, irrelevant, or unsupported content.",
            "",
            "## Unified Diff",
            "",
            "```diff",
            *diff,
            "```",
            "",
        ]
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ai-original", required=True, help="Path to the AI-generated original file.")
    parser.add_argument("--final", required=True, help="Path to the final student-edited file.")
    parser.add_argument("--output", help="Markdown report path. Defaults beside the final file.")
    parser.add_argument("--context-lines", type=int, default=3, help="Unified diff context lines.")
    args = parser.parse_args()

    original = Path(args.ai_original).expanduser().resolve()
    final = Path(args.final).expanduser().resolve()
    if not original.exists():
        raise SystemExit(f"AI original file not found: {original}")
    if not final.exists():
        raise SystemExit(f"Final file not found: {final}")

    original_text = read_text(original)
    final_text = read_text(final)
    output = Path(args.output).expanduser().resolve() if args.output else default_output_path(original, final)
    write_report(output, original, final, original_text, final_text, args.context_lines)
    print(f"Wrote comparison report: {output}")


if __name__ == "__main__":
    main()
