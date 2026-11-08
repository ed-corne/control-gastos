# Requerimientos funcionales — App de Control de Gastos

Nov 7, 2026 · @Edwin

## 1. Introducción

La app sustituye la hoja de cálculo manual por un sistema web donde registrar un gasto tome menos de 10 segundos. Con esos registros se arman presupuestos, metas de ahorro y reportes. La prioridad es que sea fácil de usar todos los días, porque la hoja de cálculo se abandonó por lo pesado que era registrar.

**Stack:** Angular (frontend SPA), .NET 10 (API REST) y PostgreSQL (base de datos).

**Supuestos:**

- Es una app de un solo usuario y no tiene inicio de sesión. Si después se publica en internet, habrá que agregar autenticación.
- La moneda principal es el peso mexicano (MXN). Tener varias monedas queda como opcional.
- Se usa desde el navegador en computadora y celular (diseño responsivo). La app nativa queda fuera de alcance.
- No se conecta con bancos; los movimientos se registran a mano o se importan desde un archivo.

**Convención:** cada requerimiento lleva un ID `RF-<módulo>-<número>` y una prioridad: **Alta** (MVP), **Media** (fase 2) o **Baja** (fase 3).

## 2. Actores

| Actor | Descripción |
| --- | --- |
| Usuario | El dueño de la app. Administra sus cuentas, movimientos, presupuestos y metas. |
| Sistema | Procesos automáticos: generar movimientos recurrentes, calcular cuánto se ha usado de cada presupuesto y enviar alertas. |

## 3. Cuentas

Una cuenta es el lugar de donde sale o adonde entra el dinero: efectivo, débito, tarjeta de crédito o ahorro.

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-CTA-01 | El usuario puede crear una cuenta con nombre, tipo (efectivo, débito, crédito, ahorro, inversión), saldo inicial, color e ícono. | Alta |
| RF-CTA-02 | El usuario puede editar y archivar cuentas. Una cuenta archivada ya no aparece al registrar movimientos, pero conserva su historial. | Alta |
| RF-CTA-03 | El sistema calcula el saldo actual de cada cuenta como saldo inicial + ingresos − gastos ± transferencias. | Alta |
| RF-CTA-04 | El sistema muestra el saldo total, que suma todas las cuentas activas y resta lo que se debe en tarjetas de crédito. | Alta |
| RF-CTA-05 | En una tarjeta de crédito, el usuario puede registrar límite, día de corte y día de pago; el sistema muestra cuánto crédito queda disponible. | Media |
| RF-CTA-06 | El sistema no permite eliminar una cuenta que tiene movimientos; solo archivarla. | Alta |

## 4. Categorías

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-CAT-01 | Al registrarse, el usuario recibe categorías predeterminadas. Gastos: Comida, Transporte, Vivienda, Servicios, Salud, Entretenimiento, Ropa, Educación y Otros. Ingresos: Sueldo, Freelance y Otros. | Alta |
| RF-CAT-02 | El usuario puede crear, editar y archivar categorías con nombre, tipo (ingreso o gasto), color e ícono. | Alta |
| RF-CAT-03 | El usuario puede crear subcategorías de un solo nivel, por ejemplo Comida → Supermercado o Restaurantes. | Media |
| RF-CAT-04 | El sistema no permite eliminar una categoría con movimientos; ofrece archivarla o pasar sus movimientos a otra categoría. | Media |
| RF-CAT-05 | El usuario puede poner etiquetas libres a los movimientos (por ejemplo “vacaciones 2026”) para agruparlos sin importar su categoría. | Baja |

## 5. Movimientos

Este módulo decide si la app se usa o se abandona: registrar un gasto debe pedir el mínimo de pasos.

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-MOV-01 | El usuario puede registrar un gasto o ingreso con monto, tipo, categoría, cuenta y fecha. La descripción es opcional. | Alta |
| RF-MOV-02 | El formulario de registro rápido se abre con un botón flotante desde cualquier pantalla. Por defecto propone la fecha de hoy, la última cuenta usada y las categorías más frecuentes. | Alta |
| RF-MOV-03 | El usuario puede registrar una transferencia entre dos de sus cuentas (por ejemplo, el pago de la tarjeta). La transferencia mueve saldo pero no cuenta como ingreso ni gasto. | Alta |
| RF-MOV-04 | El usuario puede editar y eliminar movimientos. Antes de eliminar, el sistema pide confirmación. | Alta |
| RF-MOV-05 | El usuario puede ver la lista de movimientos agrupada por día, con paginación o *scroll* infinito. | Alta |
| RF-MOV-06 | El usuario puede filtrar la lista por rango de fechas, tipo, categoría, cuenta y rango de montos, y buscar por texto en la descripción. | Alta |
| RF-MOV-07 | El sistema valida que el monto sea mayor a 0, tenga hasta 2 decimales y que la fecha no sea posterior a hoy (salvo los movimientos programados). | Alta |
| RF-MOV-08 | El usuario puede definir un movimiento recurrente (diario, semanal, quincenal, mensual o anual) con fecha de inicio y, si quiere, de fin. Sirve para renta, suscripciones o sueldo. | Media |
| RF-MOV-09 | El sistema genera los movimientos recurrentes en su fecha, o los deja como “pendientes de confirmar”, según lo que el usuario configure. | Media |
| RF-MOV-10 | El usuario puede duplicar un movimiento existente para registrar uno parecido. | Media |
| RF-MOV-11 | El usuario puede adjuntar una foto del ticket a un movimiento (JPG, PNG o PDF de hasta 5 MB). | Baja |
| RF-MOV-12 | El usuario puede registrar un gasto a meses sin intereses; el sistema reparte el cargo en N mensualidades. | Baja |

## 6. Presupuestos

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-PRE-01 | El usuario puede asignar un monto mensual a una categoría de gasto, o un presupuesto global para todo el mes. | Alta |
| RF-PRE-02 | El sistema muestra cada presupuesto con lo asignado, lo gastado, lo que queda y el porcentaje usado, todo calculado con los movimientos del periodo. | Alta |
| RF-PRE-03 | El sistema marca cada presupuesto con un color según el porcentaje usado: verde por debajo del 75 %, amarillo entre 75 % y 100 %, y rojo por encima del 100 %. | Alta |
| RF-PRE-04 | El periodo del presupuesto empieza el día de inicio del mes financiero que el usuario configuró (RF-CFG-03). | Media |
| RF-PRE-05 | El usuario puede copiar los presupuestos del mes anterior al mes actual con un clic. | Media |
| RF-PRE-06 | El usuario puede decidir que lo que sobró de un presupuesto se sume al del mes siguiente. | Baja |
| RF-PRE-07 | El usuario puede ver el historial de presupuestos para comparar lo planeado con lo real mes por mes. | Media |

## 7. Metas de ahorro

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-MET-01 | El usuario puede crear una meta con nombre, monto objetivo, fecha límite (opcional), ícono y color. | Alta |
| RF-MET-02 | El usuario puede hacer aportaciones a una meta o retirar dinero de ella; cada operación queda registrada con fecha y monto. | Alta |
| RF-MET-03 | El sistema muestra el avance de cada meta: lo ahorrado, lo que falta y el porcentaje. | Alta |
| RF-MET-04 | Si la meta tiene fecha límite, el sistema calcula cuánto hay que ahorrar al mes para llegar a tiempo. | Media |
| RF-MET-05 | El usuario puede ligar una meta a una cuenta de ahorro, y entonces el avance es el saldo de esa cuenta. | Baja |
| RF-MET-06 | Cuando una meta llega al 100 %, el sistema la marca como cumplida y la mueve al historial. | Media |

## 8. Dashboard y reportes

El dashboard contesta en un vistazo las dos preguntas que dieron origen al proyecto: en qué se va el dinero y cuánto va a cada categoría.

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-DSH-01 | Al iniciar sesión, el usuario ve el dashboard del mes actual con saldo total, ingresos del mes, gastos del mes y balance (ingresos − gastos). | Alta |
| RF-DSH-02 | El dashboard muestra un gráfico de gastos por categoría (dona o barras) con montos y porcentajes. | Alta |
| RF-DSH-03 | El dashboard muestra los últimos 5 movimientos y los presupuestos que pasan del 75 %. | Alta |
| RF-DSH-04 | El usuario puede cambiar el periodo del dashboard: mes actual, mes anterior o un rango personalizado. | Media |
| RF-REP-01 | El usuario puede ver un reporte de ingresos contra gastos de los últimos 12 meses en un gráfico de barras. | Media |
| RF-REP-02 | El usuario puede ver cómo cambia el gasto de una categoría mes a mes en un gráfico de líneas. | Media |
| RF-REP-03 | El sistema compara el gasto del mes actual con el del mes anterior, por categoría y en porcentaje. | Media |
| RF-REP-04 | El usuario puede ver la evolución de su saldo total en el tiempo. | Baja |
| RF-REP-05 | El sistema muestra observaciones automáticas, por ejemplo: “Este mes gastaste 30 % más en Comida que tu promedio”. | Baja |

## 9. Notificaciones, importación/exportación y configuración

| ID | Requerimiento | Prioridad |
| --- | --- | --- |
| RF-NOT-01 | El sistema avisa dentro de la app cuando un presupuesto llega al 75 % y cuando lo rebasa. | Media |
| RF-NOT-02 | El sistema recuerda los pagos recurrentes 2 días antes y la fecha de pago de las tarjetas de crédito. | Media |
| RF-NOT-03 | Si el usuario lo activa, el sistema le recuerda cada día a cierta hora que registre sus gastos. Esto ayuda a no perder el hábito. | Media |
| RF-NOT-04 | El usuario puede elegir qué avisos le llegan por correo y cuáles solo dentro de la app. | Baja |
| RF-IMP-01 | El usuario puede exportar sus movimientos filtrados a CSV o Excel. | Media |
| RF-IMP-02 | El usuario puede importar movimientos desde un CSV o Excel (por ejemplo, la hoja de cálculo anterior). Antes de guardar, ve una vista previa y relaciona las columnas con los campos. | Media |
| RF-IMP-03 | Al importar, el sistema detecta posibles duplicados (misma fecha, monto y cuenta) y pide confirmación. | Baja |
| RF-CFG-01 | El usuario puede elegir tema claro u oscuro. | Baja |
| RF-CFG-02 | El usuario puede cambiar el formato de fecha y de moneda. | Baja |
| RF-CFG-03 | El usuario puede configurar su nombre, moneda principal, zona horaria y día de inicio del mes financiero (por ejemplo, el día de pago). | Media |

## 10. Priorización por fases

El MVP tiene 23 de los 55 requerimientos. Con eso ya se puede registrar, consultar y presupuestar, que es lo que hacía la hoja de cálculo pero con menos esfuerzo.

| Fase | Objetivo | Requerimientos | Incluye |
| --- | --- | --- | --- |
| 1. MVP | Sustituir la hoja de cálculo y crear el hábito de registrar | 23 (Alta) | Cuentas, categorías, registro rápido de movimientos y transferencias, presupuestos mensuales, metas básicas y dashboard del mes |
| 2. Seguimiento | Automatizar y dar más contexto | 21 (Media) | Movimientos recurrentes, subcategorías, reportes de 12 meses, alertas de presupuesto, recordatorio diario, importar y exportar CSV/Excel |
| 3. Extras | Pulir la experiencia | 11 (Baja) | Fotos de tickets, meses sin intereses, etiquetas, observaciones automáticas, avisos por correo, tema oscuro |

**Preguntas abiertas**

- Si más adelante la app se publica en internet o la usa otra persona, habrá que agregar autenticación, que por ahora quedó fuera del alcance.
- ¿Necesitas manejar varias monedas (por ejemplo, dólares)?
- ¿Quieres importar el historial de la hoja de cálculo anterior desde el MVP? En ese caso, RF-IMP-02 sube a prioridad Alta.
