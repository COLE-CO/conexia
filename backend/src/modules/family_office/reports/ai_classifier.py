import json

from openai import OpenAI

from src.core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = (
    "Eres un asistente contable colombiano experto. "
    "Recibes datos crudos extraídos de un balance financiero "
    "de una empresa. Tu tarea es:\n\n"
    "1. Identificar cada partida que represente un INGRESO "
    "o un GASTO.\n"
    "2. Clasificar cada partida en una subcategoría contable "
    '(ej: "Ventas nacionales", "Nómina y prestaciones", '
    '"Servicios públicos", "Arriendos", "Impuestos", '
    '"Honorarios", "Depreciación", etc.).\n'
    "3. Calcular los totales de ingresos, gastos y resultado "
    "neto.\n"
    "4. Escribir un resumen profesional de 2-3 oraciones "
    "analizando la situación financiera.\n\n"
    "Responde ÚNICAMENTE en JSON con esta estructura exacta:\n"
    "{\n"
    '  "items": [\n'
    '    {"concept": "...", "amount": 0.0, '
    '"category": "ingreso"|"gasto", "subcategory": "..."}\n'
    "  ],\n"
    '  "total_income": 0.0,\n'
    '  "total_expenses": 0.0,\n'
    '  "net_result": 0.0,\n'
    '  "ai_summary": "..."\n'
    "}\n\n"
    "Todos los valores monetarios en pesos colombianos. "
    "Si un valor no se puede clasificar claramente, "
    "usa tu mejor criterio profesional. "
    "No incluyas partidas con monto 0."
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
