"""Email reminder HTML template."""

# ruff: noqa: E501

from datetime import date
from decimal import Decimal
from html import escape


def _format_amount(amount: Decimal | str | None) -> str:
    if amount is None:
        return ""

    amount_text = str(amount).strip()
    if not amount_text:
        return ""

    return escape(amount_text)


def build_reminder_template(
    company_name: str,
    deadline_name: str,
    description: str,
    due_date: date,
    amount: Decimal | str | None,
) -> str:
    due_date_text = due_date.strftime("%d/%m/%Y")
    amount_text = _format_amount(amount)

    amount_block = ""
    if amount_text:
        amount_block = f"""
              <p style=\"margin:0 0 12px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:700;\">
                Monto
              </p>
              <p style=\"margin:0 0 20px;font-size:15px;line-height:1.6;color:#0f172a;\">
                {amount_text}
              </p>
        """

    return f"""
    <!DOCTYPE html>
    <html lang=\"es\">
      <head>
        <meta charset=\"UTF-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
        <title>Recordatorio de vencimiento</title>
      </head>
      <body style=\"margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;\">
        <div style=\"max-width:640px;margin:0 auto;padding:32px 16px;\">
          <div style=\"background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(15,23,42,0.06);\">
            <div style=\"display:inline-block;padding:8px 14px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;\">
              Recordatorio automático
            </div>

            <h1 style=\"margin:20px 0 12px;font-size:24px;line-height:1.2;color:#0f172a;\">
              Vencimiento próximo
            </h1>

            <p style=\"margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;\">
              Te informamos que un vencimiento se encuentra próximo a su fecha límite. Por favor, revisa la información y toma las acciones necesarias a tiempo.
            </p>

            <div style=\"border:1px solid #e2e8f0;border-radius:16px;padding:20px;background:#f8fafc;\">
              <p style=\"margin:0 0 12px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:700;\">
                Empresa
              </p>
              <p style=\"margin:0 0 20px;font-size:16px;font-weight:700;color:#0f172a;\">
                {escape(company_name)}
              </p>

              <p style=\"margin:0 0 12px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:700;\">
                Vencimiento
              </p>
              <p style=\"margin:0 0 20px;font-size:15px;line-height:1.6;color:#0f172a;\">
                {escape(deadline_name)}
              </p>

              <p style=\"margin:0 0 12px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:700;\">
                Descripción
              </p>
              <p style=\"margin:0 0 20px;font-size:15px;line-height:1.6;color:#0f172a;\">
                {escape(description)}
              </p>

              <table role=\"presentation\" style=\"width:100%;border-collapse:collapse;\">
                <tr>
                  <td style=\"padding:0 0 14px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:700;\">
                    Fecha de vencimiento
                  </td>
                  <td style=\"padding:0 0 14px;font-size:15px;font-weight:700;color:#0f172a;text-align:right;\">
                    {due_date_text}
                  </td>
                </tr>
              </table>

              {amount_block}
            </div>

            <p style=\"margin:24px 0 0;font-size:14px;line-height:1.6;color:#475569;\">
              Este mensaje fue generado automáticamente por Conexia.
            </p>
          </div>
        </div>
      </body>
    </html>
    """