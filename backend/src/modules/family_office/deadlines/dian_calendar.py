"""Tablas oficiales del Calendario Tributario DIAN 2026.

Fuente: D.U.R. 1625 de 2016, modificado por el Decreto 2229 de 2023.
Documento de referencia: CALENDARIO IMPTOS-2026 (CIJUF / Rodrigo Monsalve Tejada).

Las fechas de cada obligación dependen del último dígito (o dos últimos
dígitos) del NIT, sin considerar el dígito de verificación.

Para el MVP del bufete (todas Personas Jurídicas, ninguna Gran Contribuyente)
se cubren las siguientes obligaciones:

- Retención en la fuente (mensual)
- IVA bimestral (responsables con ingresos >= 92.000 UVT en 2025)
- IVA cuatrimestral (responsables con ingresos < 92.000 UVT en 2025)
- Anticipo bimestral Régimen Simple de Tributación
- Renta Personas Jurídicas (no Grandes Contribuyentes): dos cuotas
- Información Exógena Nacional - Personas Jurídicas (un único vencimiento)
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class DianDeadline:
    """Una obligación tributaria concreta con su fecha de vencimiento."""

    obligation_type: str
    due_date: date
    period_label: str
    description: str


# ---------------------------------------------------------------------------
# Retención en la fuente del impuesto de Renta, IVA y Timbre - mensual
# Art. 1.6.1.13.2.33. del DUR 1625/16
# Mapa: último_dígito -> [(periodo_obligación, fecha_vencimiento)] x 12
# ---------------------------------------------------------------------------

_RETENCION_PERIODOS = [
    "Enero 2026",
    "Febrero 2026",
    "Marzo 2026",
    "Abril 2026",
    "Mayo 2026",
    "Junio 2026",
    "Julio 2026",
    "Agosto 2026",
    "Septiembre 2026",
    "Octubre 2026",
    "Noviembre 2026",
    "Diciembre 2026",
]

# Cada lista interna: 12 días, uno por periodo. El vencimiento siempre cae en
# el mes siguiente al periodo (el de diciembre se paga en enero del año siguiente).
_RETENCION_DIAS = {
    1: [10, 10, 13, 12, 10, 9, 12, 9, 9, 11, 10, 13],
    2: [11, 11, 14, 13, 11, 10, 13, 10, 13, 12, 11, 14],
    3: [12, 12, 15, 14, 12, 13, 14, 11, 14, 13, 14, 15],
    4: [13, 13, 16, 15, 16, 14, 18, 14, 15, 17, 15, 18],
    5: [16, 16, 17, 19, 17, 15, 19, 15, 16, 18, 16, 19],
    6: [17, 17, 20, 20, 18, 16, 20, 16, 19, 19, 17, 20],
    7: [18, 18, 21, 21, 19, 17, 21, 17, 20, 20, 18, 21],
    8: [19, 19, 22, 22, 22, 21, 24, 18, 21, 23, 21, 22],
    9: [20, 20, 23, 25, 23, 22, 25, 21, 22, 24, 22, 25],
    0: [23, 24, 24, 26, 24, 23, 26, 22, 23, 25, 23, 26],
}

# Mes calendario donde efectivamente vence cada periodo del bloque anterior.
_RETENCION_MESES_VENCIMIENTO = [
    (2026, 2),
    (2026, 3),
    (2026, 4),
    (2026, 5),
    (2026, 6),
    (2026, 7),
    (2026, 8),
    (2026, 9),
    (2026, 10),
    (2026, 11),
    (2026, 12),
    (2027, 1),
]


def _retencion_fuente(ultimo_digito: int) -> list[DianDeadline]:
    dias = _RETENCION_DIAS[ultimo_digito]
    return [
        DianDeadline(
            obligation_type="retencion",
            due_date=date(year, month, dia),
            period_label=periodo,
            description=f"Retención en la fuente - {periodo}",
        )
        for periodo, (year, month), dia in zip(
            _RETENCION_PERIODOS, _RETENCION_MESES_VENCIMIENTO, dias, strict=True
        )
    ]


# ---------------------------------------------------------------------------
# IVA bimestral - Art. 1.6.1.13.2.30.
# Responsables con ingresos brutos 2025 >= 92.000 UVT
# ---------------------------------------------------------------------------

_IVA_BIMESTRAL_PERIODOS = [
    "Bimestre 1 (Ene-Feb) 2026",
    "Bimestre 2 (Mar-Abr) 2026",
    "Bimestre 3 (May-Jun) 2026",
    "Bimestre 4 (Jul-Ago) 2026",
    "Bimestre 5 (Sep-Oct) 2026",
    "Bimestre 6 (Nov-Dic) 2026",
]

_IVA_BIMESTRAL_MESES_VENCIMIENTO = [
    (2026, 3),
    (2026, 5),
    (2026, 7),
    (2026, 9),
    (2026, 11),
    (2027, 1),
]

_IVA_BIMESTRAL_DIAS = {
    1: [10, 12, 9, 9, 11, 13],
    2: [11, 13, 10, 10, 12, 14],
    3: [12, 14, 13, 11, 13, 15],
    4: [13, 15, 14, 14, 17, 18],
    5: [16, 19, 15, 15, 18, 19],
    6: [17, 20, 16, 16, 19, 20],
    7: [18, 21, 17, 17, 20, 21],
    8: [19, 22, 21, 18, 23, 22],
    9: [20, 25, 22, 21, 24, 25],
    0: [24, 26, 23, 22, 25, 26],
}


def _iva_bimestral(ultimo_digito: int) -> list[DianDeadline]:
    dias = _IVA_BIMESTRAL_DIAS[ultimo_digito]
    return [
        DianDeadline(
            obligation_type="iva_bimestral",
            due_date=date(year, month, dia),
            period_label=periodo,
            description=f"IVA bimestral - {periodo}",
        )
        for periodo, (year, month), dia in zip(
            _IVA_BIMESTRAL_PERIODOS,
            _IVA_BIMESTRAL_MESES_VENCIMIENTO,
            dias,
            strict=True,
        )
    ]


# ---------------------------------------------------------------------------
# IVA cuatrimestral - Art. 1.6.1.13.2.31.
# Responsables con ingresos brutos 2025 < 92.000 UVT
# ---------------------------------------------------------------------------

_IVA_CUATRIMESTRAL_PERIODOS = [
    "Cuatrimestre 1 (Ene-Abr) 2026",
    "Cuatrimestre 2 (May-Ago) 2026",
    "Cuatrimestre 3 (Sep-Dic) 2026",
]

_IVA_CUATRIMESTRAL_MESES_VENCIMIENTO = [(2026, 5), (2026, 9), (2027, 1)]

_IVA_CUATRIMESTRAL_DIAS = {
    1: [12, 9, 13],
    2: [13, 10, 14],
    3: [14, 11, 15],
    4: [15, 14, 18],
    5: [19, 15, 19],
    6: [20, 16, 20],
    7: [21, 17, 21],
    8: [22, 18, 22],
    9: [25, 21, 25],
    0: [26, 22, 26],
}


def _iva_cuatrimestral(ultimo_digito: int) -> list[DianDeadline]:
    dias = _IVA_CUATRIMESTRAL_DIAS[ultimo_digito]
    return [
        DianDeadline(
            obligation_type="iva_cuatrimestral",
            due_date=date(year, month, dia),
            period_label=periodo,
            description=f"IVA cuatrimestral - {periodo}",
        )
        for periodo, (year, month), dia in zip(
            _IVA_CUATRIMESTRAL_PERIODOS,
            _IVA_CUATRIMESTRAL_MESES_VENCIMIENTO,
            dias,
            strict=True,
        )
    ]


# ---------------------------------------------------------------------------
# Anticipo bimestral Régimen Simple de Tributación - Art. 1.6.1.13.2.52.
# ---------------------------------------------------------------------------

_RST_PERIODOS = [
    "Bimestre 1 (Ene-Feb) 2026",
    "Bimestre 2 (Mar-Abr) 2026",
    "Bimestre 3 (May-Jun) 2026",
    "Bimestre 4 (Jul-Ago) 2026",
    "Bimestre 5 (Sep-Oct) 2026",
    "Bimestre 6 (Nov-Dic) 2026",
]

_RST_MESES_VENCIMIENTO = [
    (2026, 5),
    (2026, 6),
    (2026, 7),
    (2026, 9),
    (2026, 11),
    (2027, 1),
]

_RST_DIAS = {
    1: [12, 10, 9, 9, 11, 13],
    2: [13, 11, 10, 10, 12, 14],
    3: [14, 12, 13, 11, 13, 15],
    4: [15, 16, 14, 14, 17, 18],
    5: [19, 17, 15, 15, 18, 19],
    6: [20, 18, 16, 16, 19, 20],
    7: [21, 19, 17, 17, 20, 21],
    8: [22, 22, 21, 18, 23, 22],
    9: [25, 23, 22, 21, 24, 25],
    0: [26, 24, 23, 22, 25, 26],
}


def _anticipo_rst(ultimo_digito: int) -> list[DianDeadline]:
    dias = _RST_DIAS[ultimo_digito]
    return [
        DianDeadline(
            obligation_type="anticipo_rst",
            due_date=date(year, month, dia),
            period_label=periodo,
            description=f"Anticipo RST - {periodo}",
        )
        for periodo, (year, month), dia in zip(
            _RST_PERIODOS, _RST_MESES_VENCIMIENTO, dias, strict=True
        )
    ]


# ---------------------------------------------------------------------------
# Renta Personas Jurídicas (no Grandes Contribuyentes) - Art. 1.6.1.13.2.12.
# ---------------------------------------------------------------------------

# Mapa último_dígito -> (día_mayo_cuota1, día_julio_cuota2)
_RENTA_PJ_DIAS = {
    1: (12, 9),
    2: (13, 10),
    3: (14, 13),
    4: (15, 14),
    5: (19, 15),
    6: (20, 16),
    7: (21, 17),
    8: (22, 21),
    9: (25, 22),
    0: (26, 23),
}


def _renta_pj(ultimo_digito: int) -> list[DianDeadline]:
    dia_cuota1, dia_cuota2 = _RENTA_PJ_DIAS[ultimo_digito]
    return [
        DianDeadline(
            obligation_type="renta_pj",
            due_date=date(2026, 5, dia_cuota1),
            period_label="Renta 2025 - Cuota 1",
            description="Declaración de renta y pago primera cuota - Año gravable 2025",
        ),
        DianDeadline(
            obligation_type="renta_pj",
            due_date=date(2026, 7, dia_cuota2),
            period_label="Renta 2025 - Cuota 2",
            description="Pago segunda cuota - Renta año gravable 2025",
        ),
    ]


# ---------------------------------------------------------------------------
# Información Exógena Nacional - Personas Jurídicas y Naturales (no GC).
# Resolución 000227 de septiembre 23 de 2025, artículo 1.3.9.1.3
# Tabla por dos últimos dígitos del NIT (en grupos de 5).
# ---------------------------------------------------------------------------

_EXOGENA_PJ_TABLA: list[tuple[int, int, date]] = [
    (1, 5, date(2026, 5, 14)),
    (6, 10, date(2026, 5, 15)),
    (11, 15, date(2026, 5, 19)),
    (16, 20, date(2026, 5, 20)),
    (21, 25, date(2026, 5, 21)),
    (26, 30, date(2026, 5, 22)),
    (31, 35, date(2026, 5, 25)),
    (36, 40, date(2026, 5, 26)),
    (41, 45, date(2026, 5, 27)),
    (46, 50, date(2026, 5, 28)),
    (51, 55, date(2026, 5, 29)),
    (56, 60, date(2026, 6, 1)),
    (61, 65, date(2026, 6, 2)),
    (66, 70, date(2026, 6, 3)),
    (71, 75, date(2026, 6, 4)),
    (76, 80, date(2026, 6, 5)),
    (81, 85, date(2026, 6, 9)),
    (86, 90, date(2026, 6, 10)),
    (91, 95, date(2026, 6, 11)),
    # 96-00 cubre 96, 97, 98, 99 y 00.
    (96, 100, date(2026, 6, 12)),
]


def _exogena_pj(dos_ultimos_digitos: int) -> list[DianDeadline]:
    target = 100 if dos_ultimos_digitos == 0 else dos_ultimos_digitos
    for low, high, due in _EXOGENA_PJ_TABLA:
        if low <= target <= high:
            return [
                DianDeadline(
                    obligation_type="exogena",
                    due_date=due,
                    period_label="Exógena 2025",
                    description="Información Exógena Nacional - Año gravable 2025",
                )
            ]
    return []


# ---------------------------------------------------------------------------
# Configuración por defecto del régimen tributario aplicado al generar.
# Mientras no se modele régimen por sociedad, se asume el perfil más común
# del bufete: PJ no-GC, IVA cuatrimestral, no RST.
# ---------------------------------------------------------------------------

_DEFAULT_OBLIGACIONES = (
    "retencion",
    "iva_cuatrimestral",
    "renta_pj",
    "exogena",
)


def _strip_nit(raw_nit: str) -> str:
    """Quita guiones, dígito de verificación y espacios. Devuelve dígitos planos."""
    digits = "".join(ch for ch in raw_nit if ch.isdigit() or ch == "-")
    if "-" in digits:
        digits = digits.split("-", 1)[0]
    return "".join(ch for ch in digits if ch.isdigit())


def _ultimo_digito(nit_clean: str) -> int:
    return int(nit_clean[-1])


def _dos_ultimos_digitos(nit_clean: str) -> int:
    return int(nit_clean[-2:]) if len(nit_clean) >= 2 else int(nit_clean[-1])


def generate_deadlines_for_nit(
    nit: str, obligaciones: tuple[str, ...] | None = None
) -> list[DianDeadline]:
    """Devuelve todas las obligaciones DIAN aplicables para el NIT dado.

    `obligaciones` permite restringir a un subconjunto. Por defecto usa el
    perfil del bufete: retención, IVA cuatrimestral, renta PJ y exógena.
    """
    nit_clean = _strip_nit(nit)
    if not nit_clean:
        return []

    activas = obligaciones or _DEFAULT_OBLIGACIONES
    ud = _ultimo_digito(nit_clean)
    dud = _dos_ultimos_digitos(nit_clean)

    builders = {
        "retencion": lambda: _retencion_fuente(ud),
        "iva_bimestral": lambda: _iva_bimestral(ud),
        "iva_cuatrimestral": lambda: _iva_cuatrimestral(ud),
        "anticipo_rst": lambda: _anticipo_rst(ud),
        "renta_pj": lambda: _renta_pj(ud),
        "exogena": lambda: _exogena_pj(dud),
    }

    out: list[DianDeadline] = []
    for nombre in activas:
        builder = builders.get(nombre)
        if builder:
            out.extend(builder())
    return out
