import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from . import schemas

PRIMARY_COLOR = colors.HexColor("#0A1628")
SECONDARY_COLOR = colors.HexColor("#0966C3")
GREEN_ACCENT = colors.HexColor("#16A34A")
RED_ACCENT = colors.HexColor("#DC2626")
LIGHT_BG = colors.HexColor("#F0F4F8")
WHITE = colors.white


def _build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReportTitle",
            parent=base["Title"],
            fontSize=22,
            textColor=PRIMARY_COLOR,
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "ReportSubtitle",
            parent=base["Normal"],
            fontSize=11,
            textColor=colors.HexColor("#647477"),
            spaceAfter=16,
        ),
        "section": ParagraphStyle(
            "SectionHeader",
            parent=base["Heading2"],
            fontSize=13,
            textColor=PRIMARY_COLOR,
            spaceBefore=20,
            spaceAfter=8,
        ),
        "summary": ParagraphStyle(
            "Summary",
            parent=base["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#374151"),
            leading=15,
            spaceAfter=16,
            leftIndent=10,
            rightIndent=10,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontSize=8,
            textColor=colors.HexColor("#9CA3AF"),
            alignment=1,
        ),
    }


def _format_currency(value: float) -> str:
    sign = "-" if value < 0 else ""
    return f"{sign}$ {abs(value):,.0f}"


def _build_items_table(items: list[schemas.LineItem], accent_color):
    header = ["Concepto", "Subcategoría", "Monto"]
    data = [header]

    for item in items:
        data.append([item.concept, item.subcategory, _format_currency(item.amount)])

    subtotal = sum(i.amount for i in items)
    data.append(["", "Subtotal", _format_currency(subtotal)])

    col_widths = [2.5 * inch, 2.2 * inch, 1.8 * inch]
    table = Table(data, colWidths=col_widths)

    style_commands = [
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), accent_color),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        # Body
        ("FONTNAME", (0, 1), (-1, -2), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -2), 9),
        ("TOPPADDING", (0, 1), (-1, -2), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -2), 5),
        # Alternating rows
        *[
            ("BACKGROUND", (0, i), (-1, i), LIGHT_BG)
            for i in range(1, len(data) - 1)
            if i % 2 == 0
        ],
        # Subtotal row
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E5E7EB")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 10),
        ("TOPPADDING", (0, -1), (-1, -1), 8),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 8),
        # Alignment
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
        # Grid
        ("LINEBELOW", (0, 0), (-1, 0), 1, accent_color),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#D1D5DB")),
        ("LINEBELOW", (0, -1), (-1, -1), 1, accent_color),
    ]

    table.setStyle(TableStyle(style_commands))
    return table


def _build_totals_table(total_income: float, total_expenses: float, net_result: float):
    net_color = GREEN_ACCENT if net_result >= 0 else RED_ACCENT

    data = [
        ["Total Ingresos", _format_currency(total_income)],
        ["Total Gastos", _format_currency(total_expenses)],
        ["Resultado Neto", _format_currency(net_result)],
    ]

    table = Table(data, colWidths=[4.7 * inch, 1.8 * inch])
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                # Income row
                ("TEXTCOLOR", (-1, 0), (-1, 0), GREEN_ACCENT),
                # Expense row
                ("TEXTCOLOR", (-1, 1), (-1, 1), RED_ACCENT),
                # Net row
                ("BACKGROUND", (0, 2), (-1, 2), PRIMARY_COLOR),
                ("TEXTCOLOR", (0, 2), (-1, 2), WHITE),
                ("TEXTCOLOR", (-1, 2), (-1, 2), net_color if net_result < 0 else WHITE),
                ("LINEABOVE", (0, 2), (-1, 2), 2, PRIMARY_COLOR),
            ]
        )
    )
    return table


def generate_report_pdf(data: schemas.GeneratePDFRequest) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.8 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    styles = _build_styles()
    elements: list = []

    # Header
    elements.append(Paragraph(data.company_name, styles["title"]))

    subtitle_parts = [data.period]
    if data.company_nit:
        subtitle_parts.append(f"NIT: {data.company_nit}")
    elements.append(Paragraph(" · ".join(subtitle_parts), styles["subtitle"]))

    # AI Summary
    elements.append(Paragraph("Resumen del Análisis", styles["section"]))
    elements.append(Paragraph(data.ai_summary, styles["summary"]))

    # Income table
    income_items = [i for i in data.items if i.category == "ingreso"]
    if income_items:
        elements.append(Paragraph("Ingresos", styles["section"]))
        elements.append(_build_items_table(income_items, GREEN_ACCENT))

    # Expenses table
    expense_items = [i for i in data.items if i.category == "gasto"]
    if expense_items:
        elements.append(Paragraph("Gastos", styles["section"]))
        elements.append(_build_items_table(expense_items, RED_ACCENT))

    # Totals
    elements.append(Spacer(1, 20))
    elements.append(
        _build_totals_table(data.total_income, data.total_expenses, data.net_result)
    )

    # Footer
    elements.append(Spacer(1, 30))
    now = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")
    elements.append(
        Paragraph(f"Reporte generado por Conexia · {now}", styles["footer"])
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer
