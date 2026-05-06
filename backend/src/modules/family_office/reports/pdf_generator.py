import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
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
AMBER_ACCENT = colors.HexColor("#D97706")
LIGHT_BG = colors.HexColor("#F4F6F8")
BORDER = colors.HexColor("#E2E8F0")
MUTED_TEXT = colors.HexColor("#64748B")
WHITE = colors.white


def _build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReportTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            textColor=PRIMARY_COLOR,
            spaceAfter=2,
            alignment=0,
        ),
        "subtitle": ParagraphStyle(
            "ReportSubtitle",
            parent=base["Normal"],
            fontSize=9,
            textColor=MUTED_TEXT,
            spaceAfter=12,
        ),
        "section": ParagraphStyle(
            "SectionHeader",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=PRIMARY_COLOR,
            spaceBefore=14,
            spaceAfter=6,
        ),
        "summary": ParagraphStyle(
            "Summary",
            parent=base["Normal"],
            fontSize=9.5,
            textColor=colors.HexColor("#1F2937"),
            leading=13,
            spaceAfter=4,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontSize=9,
            textColor=colors.HexColor("#1F2937"),
            leading=12,
            leftIndent=10,
            bulletIndent=0,
            spaceAfter=2,
        ),
        "card_label": ParagraphStyle(
            "CardLabel",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            textColor=MUTED_TEXT,
            alignment=0,
            spaceAfter=2,
        ),
        "card_value": ParagraphStyle(
            "CardValue",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=PRIMARY_COLOR,
            alignment=0,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontSize=7.5,
            textColor=colors.HexColor("#94A3B8"),
            alignment=1,
        ),
    }


def _format_currency(value: float | None) -> str:
    if value is None:
        return "—"
    sign = "-" if value < 0 else ""
    return f"{sign}$ {abs(value):,.0f}"


def _format_ratio(value: float | None, *, suffix: str = "", decimals: int = 2) -> str:
    if value is None:
        return "—"
    return f"{value:.{decimals}f}{suffix}"


def _format_percent(value: float | None) -> str:
    if value is None:
        return "—"
    return f"{value * 100:.1f}%"


def _build_kpi_card(label: str, value: str, accent=PRIMARY_COLOR, styles=None):
    """Una mini tabla 1x2 con label arriba y valor en negrita debajo."""
    label_p = Paragraph(label.upper(), styles["card_label"])
    value_style = ParagraphStyle(
        "CardValueAccent",
        parent=styles["card_value"],
        textColor=accent,
    )
    value_p = Paragraph(value, value_style)
    card = Table([[label_p], [value_p]], colWidths=[1.55 * inch])
    card.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 0),
                ("TOPPADDING", (0, 1), (-1, 1), 0),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ]
        )
    )
    return card


def _build_snapshot_row(snapshot: schemas.FinancialSnapshot, net_result: float, styles):
    cards = [
        _build_kpi_card(
            "Activos totales",
            _format_currency(snapshot.total_assets),
            PRIMARY_COLOR,
            styles,
        ),
        _build_kpi_card(
            "Pasivos totales",
            _format_currency(snapshot.total_liabilities),
            RED_ACCENT,
            styles,
        ),
        _build_kpi_card(
            "Patrimonio",
            _format_currency(snapshot.equity),
            SECONDARY_COLOR,
            styles,
        ),
        _build_kpi_card(
            "Resultado del periodo",
            _format_currency(net_result),
            GREEN_ACCENT if net_result >= 0 else RED_ACCENT,
            styles,
        ),
    ]
    grid = Table([cards], colWidths=[1.6 * inch] * 4)
    grid.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return grid


def _build_ratios_table(ratios: schemas.FinancialRatios):
    rows = [
        ["Indicador", "Valor", "Lectura"],
        [
            "Razón corriente",
            _format_ratio(ratios.current_ratio, decimals=2),
            _read_current_ratio(ratios.current_ratio),
        ],
        [
            "Endeudamiento",
            _format_percent(ratios.debt_ratio),
            _read_debt_ratio(ratios.debt_ratio),
        ],
        [
            "Patrimonio / Activos",
            _format_percent(ratios.equity_ratio),
            _read_equity_ratio(ratios.equity_ratio),
        ],
        [
            "Margen neto",
            _format_percent(ratios.net_margin),
            _read_margin(ratios.net_margin),
        ],
        [
            "Capital de trabajo",
            _format_currency(ratios.working_capital),
            _read_working_capital(ratios.working_capital),
        ],
    ]

    table = Table(rows, colWidths=[2.0 * inch, 1.4 * inch, 3.1 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("TEXTCOLOR", (2, 1), (2, -1), MUTED_TEXT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID", (0, 1), (-1, -1), 0.25, BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def _read_current_ratio(value: float | None) -> str:
    if value is None:
        return "—"
    if value >= 2.0:
        return "Liquidez holgada"
    if value >= 1.2:
        return "Liquidez adecuada"
    if value >= 1.0:
        return "Liquidez ajustada"
    return "Riesgo de liquidez"


def _read_debt_ratio(value: float | None) -> str:
    if value is None:
        return "—"
    if value < 0.30:
        return "Endeudamiento bajo"
    if value < 0.60:
        return "Endeudamiento moderado"
    return "Endeudamiento alto"


def _read_equity_ratio(value: float | None) -> str:
    if value is None:
        return "—"
    if value >= 0.60:
        return "Estructura sólida"
    if value >= 0.40:
        return "Estructura equilibrada"
    return "Estructura apalancada"


def _read_margin(value: float | None) -> str:
    if value is None:
        return "—"
    if value < 0:
        return "Resultado negativo"
    if value >= 0.20:
        return "Rentabilidad alta"
    if value >= 0.05:
        return "Rentabilidad razonable"
    return "Rentabilidad baja"


def _read_working_capital(value: float | None) -> str:
    if value is None:
        return "—"
    return "Suficiente" if value >= 0 else "Negativo"


def _build_items_table(items: list[schemas.LineItem], accent_color):
    header = ["Concepto", "Subcategoría", "Monto"]
    data = [header]

    for item in items:
        data.append([item.concept, item.subcategory, _format_currency(item.amount)])

    subtotal = sum(i.amount for i in items)
    data.append(["", "Subtotal", _format_currency(subtotal)])

    col_widths = [2.7 * inch, 2.0 * inch, 1.8 * inch]
    table = Table(data, colWidths=col_widths)

    style_commands = [
        ("BACKGROUND", (0, 0), (-1, 0), accent_color),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("FONTNAME", (0, 1), (-1, -2), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -2), 8.5),
        ("TOPPADDING", (0, 1), (-1, -2), 4),
        ("BOTTOMPADDING", (0, 1), (-1, -2), 4),
        *[
            ("BACKGROUND", (0, i), (-1, i), LIGHT_BG)
            for i in range(1, len(data) - 1)
            if i % 2 == 0
        ],
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#E5E7EB")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 9),
        ("TOPPADDING", (0, -1), (-1, -1), 6),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
        ("ALIGN", (-1, 0), (-1, -1), "RIGHT"),
        ("LINEBELOW", (0, 0), (-1, 0), 1, accent_color),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.HexColor("#D1D5DB")),
        ("LINEBELOW", (0, -1), (-1, -1), 1, accent_color),
    ]

    table.setStyle(TableStyle(style_commands))
    return table


def _build_results_strip(
    total_income: float, total_expenses: float, net_result: float
):
    net_color = GREEN_ACCENT if net_result >= 0 else RED_ACCENT
    rows = [
        [
            "INGRESOS",
            _format_currency(total_income),
            "GASTOS",
            _format_currency(total_expenses),
            "RESULTADO",
            _format_currency(net_result),
        ]
    ]
    table = Table(
        rows,
        colWidths=[
            0.85 * inch,
            1.25 * inch,
            0.85 * inch,
            1.25 * inch,
            0.95 * inch,
            1.35 * inch,
        ],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PRIMARY_COLOR),
                ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
                ("FONTSIZE", (0, 0), (0, -1), 8),
                ("FONTSIZE", (2, 0), (2, -1), 8),
                ("FONTSIZE", (4, 0), (4, -1), 8),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (1, 0), (1, -1), 11),
                ("FONTSIZE", (3, 0), (3, -1), 11),
                ("FONTSIZE", (5, 0), (5, -1), 12),
                ("TEXTCOLOR", (1, 0), (1, 0), GREEN_ACCENT),
                ("TEXTCOLOR", (3, 0), (3, 0), RED_ACCENT),
                ("TEXTCOLOR", (5, 0), (5, 0), net_color),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return table


def _build_bullet_list(items: list[str], styles, color=SECONDARY_COLOR):
    if not items:
        return Paragraph(
            "<i>Sin observaciones registradas.</i>", styles["bullet"]
        )
    elements = []
    for text in items:
        safe = text.replace("\n", " ").strip()
        if not safe:
            continue
        bullet_html = (
            f'<font color="{color.hexval()}"><b>•</b></font>&nbsp;&nbsp;{safe}'
        )
        elements.append(Paragraph(bullet_html, styles["bullet"]))
    return KeepTogether(elements)


def generate_report_pdf(data: schemas.GeneratePDFRequest) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
    )

    styles = _build_styles()
    elements: list = []

    # ─── Encabezado ──────────────────────────────────────────────────────
    elements.append(Paragraph(data.company_name, styles["title"]))

    subtitle_parts = [f"<b>Reporte financiero ejecutivo</b> · {data.period}"]
    if data.company_nit:
        subtitle_parts.append(f"NIT {data.company_nit}")
    subtitle_parts.append("Valores en pesos colombianos (COP)")
    elements.append(Paragraph(" · ".join(subtitle_parts), styles["subtitle"]))

    # ─── Snapshot financiero ─────────────────────────────────────────────
    if data.snapshot:
        elements.append(Paragraph("Snapshot financiero", styles["section"]))
        elements.append(_build_snapshot_row(data.snapshot, data.net_result, styles))

    # ─── Resumen ejecutivo ───────────────────────────────────────────────
    if data.ai_summary:
        elements.append(Paragraph("Resumen ejecutivo", styles["section"]))
        elements.append(Paragraph(data.ai_summary, styles["summary"]))

    # ─── Indicadores clave ───────────────────────────────────────────────
    if data.ratios:
        elements.append(Paragraph("Indicadores clave", styles["section"]))
        elements.append(_build_ratios_table(data.ratios))

    # ─── Resultado del periodo (banda) ───────────────────────────────────
    elements.append(Paragraph("Resultado del periodo", styles["section"]))
    elements.append(
        _build_results_strip(
            data.total_income, data.total_expenses, data.net_result
        )
    )

    # ─── Composición de ingresos ─────────────────────────────────────────
    income_items = [i for i in data.items if i.category == "ingreso"]
    if income_items:
        elements.append(Paragraph("Composición de ingresos", styles["section"]))
        elements.append(_build_items_table(income_items, GREEN_ACCENT))

    # ─── Composición de gastos ───────────────────────────────────────────
    expense_items = [i for i in data.items if i.category == "gasto"]
    if expense_items:
        elements.append(Paragraph("Composición de gastos", styles["section"]))
        elements.append(_build_items_table(expense_items, RED_ACCENT))

    # ─── Hallazgos ───────────────────────────────────────────────────────
    if data.findings:
        elements.append(Paragraph("Hallazgos clave", styles["section"]))
        elements.append(_build_bullet_list(data.findings, styles, AMBER_ACCENT))

    # ─── Recomendaciones ─────────────────────────────────────────────────
    if data.recommendations:
        elements.append(Paragraph("Recomendaciones", styles["section"]))
        elements.append(
            _build_bullet_list(data.recommendations, styles, SECONDARY_COLOR)
        )

    # ─── Footer ──────────────────────────────────────────────────────────
    elements.append(Spacer(1, 18))
    now = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")
    elements.append(
        Paragraph(
            f"Reporte generado por Conexia · {now} · "
            "Información para uso interno del Family Office.",
            styles["footer"],
        )
    )

    doc.build(elements)
    buffer.seek(0)
    return buffer
