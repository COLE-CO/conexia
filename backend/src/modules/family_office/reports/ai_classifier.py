import json

from openai import OpenAI

from src.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = (
    "Eres un analista financiero senior con experiencia en NIIF y reporting "
    "para family offices colombianos. Recibes los datos crudos de un balance "
    "de prueba (saldo inicial, movimientos y saldo final por cuenta). Tu "
    "salida alimenta un reporte ejecutivo de una sola página, así que debe "
    "ser preciso, sintético y con criterio profesional.\n\n"
    "Realiza estas tareas y devuelve EXACTAMENTE el JSON descrito al final:\n\n"
    "1) ITEMS: identifica las partidas relevantes de INGRESOS y GASTOS del "
    "periodo, clasificadas por subcategoría contable (Ventas, Arrendamientos, "
    "Honorarios, Servicios públicos, Impuestos, Gastos financieros, "
    "Depreciación, etc.). Omite partidas con monto 0 y agrega cuando aporte "
    "claridad. No mezcles cuentas de balance con cuentas de resultado.\n\n"
    "2) SNAPSHOT: extrae los saldos finales agregados (todos en COP, valores "
    "absolutos positivos para activos/patrimonio y para pasivos):\n"
    "   - total_assets, current_assets, non_current_assets\n"
    "   - total_liabilities, current_liabilities, non_current_liabilities\n"
    "   - equity (patrimonio total)\n"
    "   - cash_and_equivalents (efectivo y equivalentes)\n"
    "   - accounts_receivable (cuentas por cobrar comerciales)\n"
    "   Si una cifra no está claramente disponible, usa null.\n\n"
    "3) TOTALES DE RESULTADO: total_income, total_expenses y net_result "
    "(ingresos − gastos − costos cuando aplique).\n\n"
    "4) AI_SUMMARY: 2 a 3 oraciones de tono ejecutivo describiendo la "
    "situación financiera global del periodo (estructura, rentabilidad y "
    "liquidez). Sin frases de relleno.\n\n"
    "5) FINDINGS: 3 a 5 hallazgos puntuales y accionables, cada uno una sola "
    "frase, basados en los números reales (concentración de ingresos, peso "
    "del endeudamiento, variación cuentas por cobrar, márgenes, eficiencia "
    "operativa, etc.). No inventes datos.\n\n"
    "6) RECOMMENDATIONS: 2 a 3 recomendaciones concretas para la gerencia, "
    "cada una en una frase, alineadas con los hallazgos.\n\n"
    "Responde ÚNICAMENTE con JSON válido en esta estructura:\n"
    "{\n"
    '  "items": [{"concept": "", "amount": 0.0, '
    '"category": "ingreso"|"gasto", "subcategory": ""}],\n'
    '  "total_income": 0.0,\n'
    '  "total_expenses": 0.0,\n'
    '  "net_result": 0.0,\n'
    '  "ai_summary": "",\n'
    '  "snapshot": {\n'
    '    "total_assets": null, "current_assets": null, '
    '"non_current_assets": null,\n'
    '    "total_liabilities": null, "current_liabilities": null, '
    '"non_current_liabilities": null,\n'
    '    "equity": null, "cash_and_equivalents": null, '
    '"accounts_receivable": null\n'
    "  },\n"
    '  "findings": ["", ""],\n'
    '  "recommendations": ["", ""]\n'
    "}"
)


def classify_balance(extracted_text: str, company_name: str, period: str) -> dict:
    user_message = (
        f"Empresa: {company_name}\n"
        f"Período: {period}\n\n"
        f"Datos del balance:\n{extracted_text}"
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )

    content = response.choices[0].message.content
    return json.loads(content)
