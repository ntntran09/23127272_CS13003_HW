from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
FONT_DIR = Path(r"C:\Windows\Fonts")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "arialbd.ttf")))
    pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")


def inline_markup(value: str) -> str:
    placeholders: list[str] = []

    def preserve_code(match: re.Match[str]) -> str:
        placeholders.append(
            f'<font name="Courier" color="#7F1D1D">{html.escape(match.group(1))}</font>'
        )
        return f"@@CODE{len(placeholders) - 1}@@"

    value = re.sub(r"`([^`]+)`", preserve_code, value)
    value = html.escape(value, quote=False)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", value)
    value = re.sub(r"\[([^]]+)]\(([^)]+)\)", r"\1 (\2)", value)
    value = value.replace("&lt;br&gt;", "<br/>").replace("&lt;br/&gt;", "<br/>")
    for index, replacement in enumerate(placeholders):
        value = value.replace(f"@@CODE{index}@@", replacement)
    return value


def styles():
    base = getSampleStyleSheet()
    base.add(ParagraphStyle(
        name="BodyArial",
        parent=base["BodyText"],
        fontName="Arial",
        fontSize=9.2,
        leading=12.2,
        spaceAfter=4,
        textColor=colors.HexColor("#1F2937"),
    ))
    base.add(ParagraphStyle(
        name="TitleArial",
        parent=base["Title"],
        fontName="Arial-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#17324D"),
        spaceAfter=14,
    ))
    for level, size in [(1, 15), (2, 12.5), (3, 10.5)]:
        base.add(ParagraphStyle(
            name=f"HeadingArial{level}",
            parent=base[f"Heading{min(level, 3)}"],
            fontName="Arial-Bold",
            fontSize=size,
            leading=size + 3,
            textColor=colors.HexColor("#0F4C75"),
            spaceBefore=9,
            spaceAfter=5,
            keepWithNext=True,
        ))
    base.add(ParagraphStyle(
        name="BulletArial",
        parent=base["BodyArial"],
        leftIndent=13,
        firstLineIndent=-8,
        bulletIndent=4,
    ))
    base.add(ParagraphStyle(
        name="TableArial",
        parent=base["BodyArial"],
        fontSize=7.2,
        leading=9,
        spaceAfter=0,
    ))
    return base


def parse_table(lines: list[str], style_sheet, available_width: float) -> Table:
    raw_rows = []
    for line in lines:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
            continue
        raw_rows.append(cells)

    column_count = max(len(row) for row in raw_rows)
    rows = []
    for row in raw_rows:
        padded = row + [""] * (column_count - len(row))
        rows.append([Paragraph(inline_markup(cell), style_sheet["TableArial"]) for cell in padded])

    if column_count == 2:
        widths = [available_width * 0.31, available_width * 0.69]
    elif column_count == 5:
        widths = [available_width * ratio for ratio in (0.22, 0.21, 0.09, 0.24, 0.24)]
    else:
        widths = [available_width / column_count] * column_count

    table = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#DCEAF7")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#17324D")),
        ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#9CA3AF")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def markdown_story(source: Path, style_sheet, available_width: float):
    lines = source.read_text(encoding="utf-8").splitlines()
    story = []
    paragraph: list[str] = []
    index = 0

    def flush_paragraph() -> None:
        if paragraph:
            story.append(Paragraph(inline_markup(" ".join(paragraph)), style_sheet["BodyArial"]))
            paragraph.clear()

    while index < len(lines):
        line = lines[index].rstrip()
        if not line:
            flush_paragraph()
            story.append(Spacer(1, 2.5 * mm))
            index += 1
            continue

        if line.startswith("```"):
            flush_paragraph()
            code = []
            index += 1
            while index < len(lines) and not lines[index].startswith("```"):
                code.append(lines[index])
                index += 1
            story.append(Preformatted(
                "\n".join(code),
                ParagraphStyle(
                    "Code",
                    fontName="Courier",
                    fontSize=7.4,
                    leading=9.2,
                    leftIndent=6,
                    rightIndent=6,
                    backColor=colors.HexColor("#F3F4F6"),
                    borderPadding=6,
                    spaceBefore=4,
                    spaceAfter=6,
                ),
            ))
            index += 1
            continue

        if line.startswith("|"):
            flush_paragraph()
            table_lines = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                table_lines.append(lines[index])
                index += 1
            story.append(parse_table(table_lines, style_sheet, available_width))
            story.append(Spacer(1, 3 * mm))
            continue

        heading = re.match(r"^(#{1,4})\s+(.*)$", line)
        if heading:
            flush_paragraph()
            level = len(heading.group(1))
            title = heading.group(2)
            if level == 1 and not story:
                story.append(Paragraph(inline_markup(title), style_sheet["TitleArial"]))
            else:
                story.append(Paragraph(
                    inline_markup(title),
                    style_sheet[f"HeadingArial{min(level, 3)}"],
                ))
            index += 1
            continue

        if re.match(r"^[-*]\s+", line):
            flush_paragraph()
            text = re.sub(r"^[-*]\s+", "", line)
            story.append(Paragraph(
                inline_markup(text),
                style_sheet["BulletArial"],
                bulletText="•",
            ))
            index += 1
            continue

        if re.match(r"^\d+\.\s+", line):
            flush_paragraph()
            match = re.match(r"^(\d+)\.\s+(.*)$", line)
            story.append(Paragraph(
                inline_markup(match.group(2)),
                style_sheet["BulletArial"],
                bulletText=f"{match.group(1)}.",
            ))
            index += 1
            continue

        paragraph.append(line.strip())
        index += 1

    flush_paragraph()
    return story


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas.line(doc.leftMargin, 13 * mm, doc.pagesize[0] - doc.rightMargin, 13 * mm)
    canvas.setFont("Arial", 7.5)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(doc.leftMargin, 8 * mm, "HW04-AI - Automation Testing - 23127272")
    canvas.drawRightString(doc.pagesize[0] - doc.rightMargin, 8 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build(source: Path, output_name: str, landscape_page: bool = False) -> Path:
    page_size = landscape(A4) if landscape_page else A4
    output = OUTPUT / output_name
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=page_size,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=18 * mm,
        title=source.stem,
        author="NGUYEN THIEN NHA TRAN - 23127272",
    )
    style_sheet = styles()
    available_width = page_size[0] - doc.leftMargin - doc.rightMargin
    doc.build(
        markdown_story(source, style_sheet, available_width),
        onFirstPage=footer,
        onLaterPages=footer,
    )
    return output


if __name__ == "__main__":
    register_fonts()
    outputs = [
        build(ROOT / "main-report.md", "23127272_HW04_Main_Report.pdf"),
        build(
            ROOT / "AI docs" / "AI-Audit-Report-DRAFT.md",
            "23127272_HW04_AI_Audit_Report_DRAFT.pdf",
            landscape_page=True,
        ),
        build(
            ROOT / "AI docs" / "AI-Critique-DRAFT.md",
            "23127272_HW04_AI_Critique_DRAFT.pdf",
        ),
    ]
    for output in outputs:
        print(output)
