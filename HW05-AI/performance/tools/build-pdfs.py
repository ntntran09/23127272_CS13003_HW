#!/usr/bin/env python3
"""Render the two submission Markdown reports to readable A4 PDFs."""

from __future__ import annotations

import html
import re
from pathlib import Path

import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf"
TMP = ROOT / "tmp" / "pdfs"


def register_fonts() -> None:
    windows = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Body", str(windows / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("BodyBold", str(windows / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("Mono", str(windows / "consola.ttf")))
    pdfmetrics.registerFontFamily("Body", normal="Body", bold="BodyBold")


def inline(text: str) -> str:
    value = text.strip().replace("<br>", "__LINE_BREAK__")
    value = html.escape(value).replace("__LINE_BREAK__", "<br/>")
    value = re.sub(r"`([^`]+)`", r'<font name="Mono" color="#7c2d12">\1</font>', value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\[([^]]+)\]\(([^)]+)\)", r'<link href="\2" color="#1d4ed8">\1</link>', value)
    value = re.sub(r"&lt;(https?://[^&]+)&gt;", r'<link href="\1" color="#1d4ed8">\1</link>', value)
    return value


def pipeline_image(path: Path) -> None:
    fig, ax = plt.subplots(figsize=(7.2, 8.2), dpi=170)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis("off")
    nodes = [
        (5, 13.2, "Commit / pull request", "#dbeafe"),
        (5, 12.0, "Performance-sensitive change?", "#fef3c7"),
        (5, 10.8, "Build + functional smoke", "#dbeafe"),
        (5, 9.6, "Smoke passes?", "#fef3c7"),
        (5, 8.4, "Seed fixed snapshot", "#dcfce7"),
        (5, 7.2, "Run short Scenario D Load", "#dcfce7"),
        (5, 6.0, "Recompute p95 / errors / RPS", "#dbeafe"),
        (5, 4.8, "p95 regression >15% or errors >1%?", "#fef3c7"),
        (2.4, 3.4, "Rerun once on clean worker", "#fee2e2"),
        (2.4, 2.0, "Repeatable: block merge\nand attach evidence", "#fecaca"),
        (7.6, 3.4, "Store baseline artifact", "#dcfce7"),
        (7.6, 2.0, "Nightly Stress / weekly Endurance", "#dbeafe"),
    ]
    for x, y, label, color in nodes:
        ax.text(x, y, label, ha="center", va="center", fontsize=8.2,
                bbox=dict(boxstyle="round,pad=0.45", facecolor=color, edgecolor="#334155", linewidth=1.0))
    for y1, y2 in [(12.9, 12.3), (11.7, 11.1), (10.5, 9.9), (9.3, 8.7), (8.1, 7.5), (6.9, 6.3), (5.7, 5.1)]:
        ax.annotate("", xy=(5, y2), xytext=(5, y1), arrowprops=dict(arrowstyle="->", color="#334155"))
    ax.annotate("yes", xy=(2.4, 3.75), xytext=(4.75, 4.55), fontsize=7,
                arrowprops=dict(arrowstyle="->", color="#b91c1c"))
    ax.annotate("no", xy=(7.6, 3.75), xytext=(5.25, 4.55), fontsize=7,
                arrowprops=dict(arrowstyle="->", color="#166534"))
    ax.annotate("", xy=(2.4, 2.4), xytext=(2.4, 3.0), arrowprops=dict(arrowstyle="->", color="#334155"))
    ax.annotate("", xy=(7.6, 2.4), xytext=(7.6, 3.0), arrowprops=dict(arrowstyle="->", color="#334155"))
    ax.text(0.4, 11.95, "Docs-only change: skip and record reason", fontsize=7, color="#475569")
    ax.text(0.4, 9.55, "Failure: fail fast", fontsize=7, color="#b91c1c")
    fig.tight_layout()
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("Title", parent=base["Title"], fontName="BodyBold", fontSize=20, leading=24, textColor=colors.HexColor("#0f172a"), spaceAfter=8 * mm),
        "h1": ParagraphStyle("H1", parent=base["Heading1"], fontName="BodyBold", fontSize=14, leading=18, textColor=colors.HexColor("#0f3d5e"), spaceBefore=5 * mm, spaceAfter=2.5 * mm),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName="BodyBold", fontSize=11.5, leading=15, textColor=colors.HexColor("#155e75"), spaceBefore=4 * mm, spaceAfter=2 * mm),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Body", fontSize=8.4, leading=11.5, textColor=colors.HexColor("#1e293b"), spaceAfter=2.2 * mm),
        "small": ParagraphStyle("Small", parent=base["BodyText"], fontName="Body", fontSize=7.1, leading=9.2, textColor=colors.HexColor("#1e293b")),
        "code": ParagraphStyle("Code", parent=base["Code"], fontName="Mono", fontSize=6.8, leading=8.8, backColor=colors.HexColor("#f1f5f9"), borderPadding=5),
    }


def table_flow(rows: list[list[str]], sty, available_width: float):
    if not rows:
        return None
    cols = max(len(r) for r in rows)
    norm = [r + [""] * (cols - len(r)) for r in rows]
    weights = []
    for c in range(cols):
        weights.append(max(15, min(42, max(len(re.sub(r"[*`]", "", r[c])) for r in norm))))
    if cols == 5 and "Verdict" in norm[0][2]:
        weights[2] = max(weights[2], 25)
    total = sum(weights)
    widths = [available_width * w / total for w in weights]
    data = [[Paragraph(inline(cell), sty["small"]) for cell in row] for row in norm]
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("FONTNAME", (0, 0), (-1, 0), "BodyBold"),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#94a3b8")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    return table


def markdown_story(md: Path, sty, width: float, flow_png: Path):
    lines = md.read_text(encoding="utf-8").splitlines()
    story = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("```"):
            lang = line[3:].strip()
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(lines[i]); i += 1
            if lang == "mermaid":
                story.extend([Image(str(flow_png), width=150 * mm, height=158 * mm), Spacer(1, 3 * mm)])
            else:
                story.extend([Preformatted("\n".join(code), sty["code"], maxLineLength=100), Spacer(1, 2 * mm)])
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), sty["title"]))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), sty["h1"]))
        elif line.startswith("### "):
            story.append(Paragraph(inline(line[4:]), sty["h2"]))
        elif line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|?\s*:?-+", lines[i + 1]):
            rows = []
            rows.append([c.strip() for c in line.strip().strip("|").split("|")])
            i += 2
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            i -= 1
            story.extend([table_flow(rows, sty, width), Spacer(1, 3 * mm)])
        elif re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                items.append(Paragraph("• " + inline(re.sub(r"^\s*[-*]\s+", "", lines[i])), sty["body"])); i += 1
            story.extend(items); i -= 1
        elif re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\.\s+", lines[i]):
                m = re.match(r"^\s*(\d+)\.\s+(.*)", lines[i])
                items.append(Paragraph(f"{m.group(1)}. {inline(m.group(2))}", sty["body"])); i += 1
            story.extend(items); i -= 1
        elif line.strip():
            paragraph = [line.strip()]
            while i + 1 < len(lines) and lines[i + 1].strip() and not re.match(r"^(#|```|\||\s*[-*]\s+|\s*\d+\.\s+)", lines[i + 1]):
                i += 1; paragraph.append(lines[i].strip())
            story.append(Paragraph(inline(" ".join(paragraph)), sty["body"]))
        i += 1
    return story


def build(source: Path, output: Path, title: str, flow_png: Path, landscape_page: bool = False) -> None:
    page_size = landscape(A4) if landscape_page else A4
    page_w, page_h = page_size
    left = right = 17 * mm
    top = 19 * mm
    bottom = 17 * mm
    width = page_w - left - right
    frame = Frame(left, bottom, width, page_h - top - bottom, id="normal")

    def decorate(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#cbd5e1"))
        canvas.line(left, 13 * mm, page_w - right, 13 * mm)
        canvas.setFont("Body", 7)
        canvas.setFillColor(colors.HexColor("#64748b"))
        canvas.drawString(left, 8.5 * mm, title)
        canvas.drawRightString(page_w - right, 8.5 * mm, f"Page {doc.page}")
        canvas.restoreState()

    doc = BaseDocTemplate(str(output), pagesize=page_size, leftMargin=left, rightMargin=right, topMargin=top, bottomMargin=bottom, title=title, author="NGUYEN THIEN NHA TRAN - 23127272")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=decorate)])
    doc.build(markdown_story(source, styles(), width, flow_png))


def main() -> None:
    register_fonts()
    OUT.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    flow_png = TMP / "continuous-performance-flow.png"
    pipeline_image(flow_png)
    build(ROOT / "main-report.md", OUT / "23127272_HW05_Performance_Report.pdf", "HW05 Performance Report - 23127272", flow_png)
    build(ROOT / "AI docs" / "AI-Audit-Report.md", OUT / "23127272_HW05_AI_Audit_Report.pdf", "HW05 AI Audit Report - 23127272", flow_png, landscape_page=True)
    build(ROOT / "AI docs" / "AI_critique.md", OUT / "23127272_HW05_AI_Critique.pdf", "HW05 AI Critique - 23127272", flow_png)
    print(OUT / "23127272_HW05_Performance_Report.pdf")
    print(OUT / "23127272_HW05_AI_Audit_Report.pdf")
    print(OUT / "23127272_HW05_AI_Critique.pdf")


if __name__ == "__main__":
    main()
