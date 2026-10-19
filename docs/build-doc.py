"""Build the Earthen client walkthrough as a Word file.

Run from the repo root: python3 docs/build-doc.py
"""

import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Mm, Pt, RGBColor, Twips

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "earthen-client-functionality.md"
OUT = HERE / "Earthen-how-the-website-works.docx"

INK = RGBColor(0x1C, 0x1A, 0x17)
MUTED = RGBColor(0x6B, 0x65, 0x60)
OLIVE = RGBColor(0x6E, 0x76, 0x58)
OLIVE_DEEP = RGBColor(0x4F, 0x56, 0x38)
CREAM = "F7F4EE"
PAPER = "FBF9F5"
LINE = "E4DDD2"
WHITE = "FFFFFF"


def set_run_font(run, name):
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), name)


def shade_cell(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:shd")):
        tcPr.remove(old)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)


def border_cell(cell, color=LINE):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:tcBorders")):
        tcPr.remove(old)
    borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), "4")
        node.set(qn("w:space"), "0")
        node.set(qn("w:color"), color)
        borders.append(node)
    tcPr.append(borders)


def set_cell_margins(cell, dx=80, dy=40):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:tcMar")):
        tcPr.remove(old)
    mar = OxmlElement("w:tcMar")
    for edge, value in (("top", dy), ("left", dx), ("bottom", dy), ("right", dx)):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")
        mar.append(node)
    tcPr.append(mar)


def keep_row(row):
    trPr = row._tr.get_or_add_trPr()
    if trPr.find(qn("w:cantSplit")) is None:
        trPr.append(OxmlElement("w:cantSplit"))


def paragraph_border(paragraph, color="6E7658"):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "12")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    pBdr.append(bottom)
    pPr.append(pBdr)


def add_page_field(paragraph):
    run = paragraph.add_run()
    set_run_font(run, "Calibri")
    run.font.size = Pt(9)
    run.font.color.rgb = MUTED
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.append(begin)
    run._r.append(instr)
    run._r.append(end)


def write_runs(paragraph, text, size, color, font="Calibri", bold=False):
    for part in re.split(r"(\*\*[^*]+\*\*)", text):
        if not part:
            continue
        is_bold = bold or (part.startswith("**") and part.endswith("**"))
        value = part[2:-2] if part.startswith("**") and part.endswith("**") else part
        run = paragraph.add_run(value)
        run.bold = is_bold
        run.italic = False
        run.font.size = Pt(size)
        run.font.color.rgb = color
        set_run_font(run, font)


def style_base(style, font, size, color, before=0, after=8, bold=False):
    style.font.name = font
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.italic = False
    style.font.color.rgb = color
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), font)
    fmt = style.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing = 1.12
    fmt.line_spacing_rule = WD_LINE_SPACING.MULTIPLE


def configure(doc):
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.left_margin = Cm(1.9)
    section.right_margin = Cm(1.9)
    section.top_margin = Cm(1.7)
    section.bottom_margin = Cm(1.6)
    section.header_distance = Cm(0.6)
    section.footer_distance = Cm(0.5)

    normal = doc.styles["Normal"]
    style_base(normal, "Calibri", 11, INK, after=8)
    normal.paragraph_format.widow_control = True

    for name, font, size, color, before, after in (
        ("Heading 1", "Georgia", 18, OLIVE_DEEP, 18, 6),
        ("Heading 2", "Georgia", 14, INK, 14, 4),
        ("Heading 3", "Georgia", 12, INK, 12, 2),
    ):
        style = doc.styles[name]
        style_base(style, font, size, color, before, after, bold=True)
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.widow_control = True

    header = section.header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    hp.paragraph_format.space_after = Pt(2)
    run = hp.add_run("EARTHEN")
    run.bold = True
    run.font.size = Pt(9)
    run.font.color.rgb = OLIVE
    set_run_font(run, "Calibri")
    rPr = run._r.get_or_add_rPr()
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:val"), "280")
    rPr.append(spacing)
    paragraph_border(hp, "E4DDD2")

    footer = section.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    fp.paragraph_format.space_before = Pt(2)
    label = fp.add_run("How the website works   ")
    label.font.size = Pt(9)
    label.font.color.rgb = MUTED
    set_run_font(label, "Calibri")
    add_page_field(fp)

    core = doc.core_properties
    core.title = "Earthen — how the website works"
    core.subject = "Client walkthrough of the shop and the studio"
    core.author = "Earthen"
    core.category = "Client walkthrough"


def add_body(doc, text, size=11, after=8, before=0, color=INK):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = 1.12
    write_runs(paragraph, text, size, color)
    return paragraph


def add_item(doc, text, level=0, numbered=None):
    paragraph = doc.add_paragraph()
    fmt = paragraph.paragraph_format
    fmt.space_before = Pt(1)
    fmt.space_after = Pt(3)
    fmt.line_spacing = 1.08
    indent = 0.75 + level * 0.55
    fmt.left_indent = Cm(indent)
    fmt.first_line_indent = Cm(-0.4)
    marker = f"{numbered}.  " if numbered else "•  "
    run = paragraph.add_run(marker)
    run.bold = bool(numbered)
    run.font.size = Pt(11)
    run.font.color.rgb = OLIVE_DEEP if numbered else OLIVE
    set_run_font(run, "Calibri")
    write_runs(paragraph, text, 11, INK)
    return paragraph


def add_table(doc, rows):
    if len(rows[0]) > 6:
        header = [rows[0][0] or "Page"] + [row[0] for row in rows[1:]]
        body = []
        for col in range(1, len(rows[0])):
            body.append([rows[0][col]] + [row[col] if col < len(row) else "" for row in rows[1:]])
        rows = [header] + body

    table = doc.add_table(rows=len(rows), cols=len(rows[0]))
    table.autofit = True
    table.allow_autofit = True
    usable = 17010  # A4 content width in twips at 1.9 cm margins
    widths = even_widths(len(rows[0]), usable)
    for r_index, row in enumerate(rows):
        keep_row(table.rows[r_index])
        for c_index, value in enumerate(row):
            cell = table.cell(r_index, c_index)
            cell.width = Twips(widths[c_index])
            text = value.strip() or "—"
            fill = "4F5638" if r_index == 0 else (PAPER if r_index % 2 else CREAM)
            shade_cell(cell, fill)
            border_cell(cell, "D9D1C4" if r_index else "4F5638")
            set_cell_margins(cell, 70, 36)
            cell.vertical_alignment = 1
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.space_before = Pt(0)
            paragraph.paragraph_format.space_after = Pt(0)
            paragraph.paragraph_format.line_spacing = 1.05
            color = RGBColor(0xFB, 0xF9, 0xF5) if r_index == 0 else INK
            bold = r_index == 0 or c_index == 0 or text == "Yes"
            if text == "—" and r_index:
                color = MUTED
            write_runs(paragraph, text, 10, color, bold=bold)
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(2)
    spacer.paragraph_format.space_after = Pt(4)
    return table


def even_widths(count, total):
    if count == 3:
        parts = [0.22, 0.24, 0.54]
        return [int(total * part) for part in parts]
    if count == 4:
        parts = [0.28, 0.2, 0.28, 0.24]
        return [int(total * part) for part in parts]
    share = total // count
    return [share] * count


def parse_table(lines, start):
    rows = []
    index = start
    while index < len(lines) and lines[index].strip().startswith("|"):
        raw = lines[index].strip().strip("|")
        cells = [cell.strip() for cell in raw.split("|")]
        if not all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
            rows.append(cells)
        index += 1
    return rows, index


def build():
    lines = SOURCE.read_text().splitlines()
    doc = Document()
    configure(doc)

    index = 0
    title_done = False
    while index < len(lines):
        line = lines[index].rstrip()
        stripped = line.strip()

        if not stripped or stripped == "---":
            index += 1
            continue

        if stripped.startswith("|"):
            rows, index = parse_table(lines, index)
            add_table(doc, rows)
            continue

        if stripped.startswith("# "):
            paragraph = doc.add_paragraph()
            paragraph.paragraph_format.space_before = Pt(0)
            paragraph.paragraph_format.space_after = Pt(2)
            kicker = paragraph.add_run("CLIENT WALKTHROUGH")
            kicker.bold = True
            kicker.font.size = Pt(10)
            kicker.font.color.rgb = OLIVE
            set_run_font(kicker, "Calibri")
            rPr = kicker._r.get_or_add_rPr()
            spacing = OxmlElement("w:spacing")
            spacing.set(qn("w:val"), "220")
            rPr.append(spacing)

            title = doc.add_paragraph()
            title.paragraph_format.space_before = Pt(2)
            title.paragraph_format.space_after = Pt(8)
            title.paragraph_format.line_spacing = 1.05
            write_runs(title, stripped[2:], 26, INK, font="Georgia", bold=True)
            paragraph_border(title, "6E7658")
            title_done = True
            index += 1
            continue

        if stripped.startswith("## "):
            doc.add_heading(stripped[3:], level=1)
            index += 1
            continue

        if stripped.startswith("### "):
            doc.add_heading(stripped[4:], level=2)
            index += 1
            continue

        if re.fullmatch(r"\*\*[^*]+\*\*", stripped):
            doc.add_heading(stripped[2:-2], level=3)
            index += 1
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if numbered:
            add_item(doc, numbered.group(2), numbered=int(numbered.group(1)))
            index += 1
            continue

        bullet = re.match(r"^(\s*)[-*]\s+(.*)$", line)
        if bullet:
            level = 1 if len(bullet.group(1)) >= 2 else 0
            add_item(doc, bullet.group(2), level=level)
            index += 1
            continue

        size = 12 if not title_done or index < 8 else 11
        color = INK
        add_body(doc, stripped, size=size, color=color)
        index += 1

    doc.save(OUT)
    return OUT


if __name__ == "__main__":
    print(build())
