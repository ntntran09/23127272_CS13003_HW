#!/usr/bin/env python3
"""Build the HW06 main and standalone AI-audit PDFs from reviewed Markdown."""

from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, PageBreak, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"


def inline_markup(text: str) -> str:
    value = html.escape(text.strip())
    value = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", value)
    return value


def markdown_story(paths: list[Path], page_size=A4):
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleBlue", parent=styles["Title"], textColor=colors.HexColor("#17365D"), fontSize=20, leading=24, spaceAfter=14))
    styles.add(ParagraphStyle(name="H1Blue", parent=styles["Heading1"], textColor=colors.HexColor("#17365D"), fontSize=15, leading=19, spaceBefore=10, spaceAfter=7))
    styles.add(ParagraphStyle(name="H2Blue", parent=styles["Heading2"], textColor=colors.HexColor("#2F5597"), fontSize=12, leading=15, spaceBefore=8, spaceAfter=5))
    styles.add(ParagraphStyle(name="BodyCompact", parent=styles["BodyText"], fontSize=9, leading=12, spaceAfter=5))
    styles.add(ParagraphStyle(name="BulletCompact", parent=styles["BodyText"], fontSize=9, leading=12, leftIndent=12, firstLineIndent=-7, bulletIndent=4, spaceAfter=3))
    styles.add(ParagraphStyle(name="Cell", parent=styles["BodyText"], fontSize=6.6, leading=8.2))
    story = []
    for path_index, path in enumerate(paths):
        if path_index:
            story.append(PageBreak())
        lines = path.read_text(encoding="utf-8").splitlines()
        i = 0
        first_heading = True
        while i < len(lines):
            line = lines[i].rstrip()
            if not line:
                story.append(Spacer(1, 2.5 * mm))
                i += 1
                continue
            if line.startswith("| ") and i + 1 < len(lines) and re.match(r"^\|[ :\-\|]+\|$", lines[i + 1]):
                rows = []
                while i < len(lines) and lines[i].startswith("|"):
                    cells = [cell.strip() for cell in lines[i].strip().strip("|").split("|")]
                    if not all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
                        rows.append([Paragraph(inline_markup(cell), styles["Cell"]) for cell in cells])
                    i += 1
                available = page_size[0] - 30 * mm
                table = Table(rows, colWidths=[available / len(rows[0])] * len(rows[0]), repeatRows=1, hAlign="LEFT")
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17365D")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EAF0F8")]),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#9FBAD0")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]))
                story += [table, Spacer(1, 3 * mm)]
                continue
            if line.startswith("# "):
                story.append(Paragraph(inline_markup(line[2:]), styles["TitleBlue"] if first_heading else styles["H1Blue"]))
                first_heading = False
            elif line.startswith("## "):
                story.append(Paragraph(inline_markup(line[3:]), styles["H1Blue"]))
            elif line.startswith("### "):
                story.append(Paragraph(inline_markup(line[4:]), styles["H2Blue"]))
            elif line.startswith("- "):
                story.append(Paragraph("• " + inline_markup(line[2:]), styles["BulletCompact"]))
            elif line.startswith("```"):
                code = []
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    code.append(lines[i])
                    i += 1
                story.append(Paragraph("<font name='Courier'>" + html.escape("\n".join(code)).replace("\n", "<br/>") + "</font>", styles["BodyCompact"]))
            else:
                story.append(Paragraph(inline_markup(line), styles["BodyCompact"]))
            i += 1
    return story


def page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#9FBAD0"))
    canvas.line(doc.leftMargin, 14 * mm, doc.pagesize[0] - doc.rightMargin, 14 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#5B6573"))
    canvas.drawString(doc.leftMargin, 9 * mm, "23127272 - HW06-AI API Testing")
    canvas.drawRightString(doc.pagesize[0] - doc.rightMargin, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build(output: Path, sources: list[Path], page_size=A4):
    doc = BaseDocTemplate(str(output), pagesize=page_size, leftMargin=15 * mm, rightMargin=15 * mm, topMargin=15 * mm, bottomMargin=20 * mm, title=output.stem, author="NGUYEN THIEN NHA TRAN")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="body")
    doc.addPageTemplates([PageTemplate(id="standard", frames=[frame], onPage=page)])
    doc.build(markdown_story(sources, page_size))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    build(OUT / "23127272_HW06_Main_Report.pdf", [ROOT / "main-report.md", ROOT / "AI docs" / "AI_critique.md", ROOT / "AI docs" / "AI-Audit-Report.md"], A4)
    build(OUT / "23127272_HW06_AI_Audit.pdf", [ROOT / "AI docs" / "AI-Audit-Report.md"], landscape(A4))
    print(OUT / "23127272_HW06_Main_Report.pdf")
    print(OUT / "23127272_HW06_AI_Audit.pdf")


if __name__ == "__main__":
    main()
