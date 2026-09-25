# Manual Técnico y Guía de Operación: Plataforma Analítica PESV & Asistencia Técnica ANSV

**Plataforma Integral de Cálculo Normativo de Indicadores PESV con Incertidumbre, Auditoría de Clasificación Empresarial, Análisis de Infracciones de Tránsito y Sistema de Alertas Tempranas para la Asistencia Técnica de la ANSV.**

* **Marco Normativo:** Resolución Mintransporte / ANSV (Metodología de Diseño, Implementación y Verificación del PESV) · Ley 1503 de 2011 · Decreto Ley 2106 de 2019 · Ley 2050 de 2020 · Ley 769 de 2002 (Código Nacional de Tránsito).
* **Entidades Verificadoras y de Apoyo:** Agencia Nacional de Seguridad Vial (ANSV), Ministerio de Transporte, Ministerio de Trabajo, Superintendencia de Transporte y Organismos de Tránsito Territoriales.

---

## Índice General

1. [Propósito y Alcance del Sistema](#1-propósito-y-alcance-del-sistema)
2. [Dónde se Hace Cada Análisis (Arquitectura del Código y Mapeo de Vistas)](#2-dónde-se-hace-cada-análisis-arquitectura-del-código-y-mapeo-de-vistas)
3. [Dónde y Cómo Pasar los Datos a la Aplicación](#3-dónde-y-cómo-pasar-los-datos-a-la-aplicación)
4. [Cómo se Hace Cada Análisis (Metodología Técnica y Algoritmos)](#4-cómo-se-hace-cada-análisis-metodología-técnica-y-algoritmos)
   - [4.1 Pipeline ETL: Limpieza, Duplicados, Triangulación de Nombres y Cruce Outer-Merge](#41-pipeline-etl-limpieza-duplicados-triangulación-de-nombres-y-cruce-outer-merge)
   - [4.2 Modelo Matemático de Incertidumbre ($\bar{X} \pm \delta x$)](#42-modelo-matemático-de-incertidumbre-barx-pm-delta-x)
   - [4.3 Verificación de Clasificación de Empresas (Nivel Legal vs. Autodeclarado)](#43-verificación-de-clasificación-de-empresas-nivel-legal-vs-autodeclarado)
   - [4.4 Verificación de Entrega de Indicadores y Pasos según Nivel (Básico, Estándar, Avanzado)](#44-verificación-de-entrega-de-indicadores-y-pasos-según-nivel-básico-estándar-avanzado)
   - [4.5 Las Fórmulas de los 13 Indicadores del PESV (Paso 20 de la Metodología)](#45-las-fórmulas-de-los-13-indicadores-del-pesv-paso-20-de-la-metodología)
   - [4.6 Análisis y Correlación de Infracciones de Tránsito](#46-análisis-y-correlación-de-infracciones-de-tránsito)
   - [4.7 Generación Automática de Alertas y Órdenes de Asistencia Técnica ANSV](#47-generación-automática-de-alertas-y-órdenes-de-asistencia-técnica-ansv)
   - [4.8 Distribución Territorial y Geoespacial de Colombia](#48-distribución-territorial-y-geoespacial-de-colombia)
5. [Cómo Funciona la Aplicación (Guía de Navegación Paso a Paso)](#5-cómo-funciona-la-aplicación-guía-de-navegación-paso-a-paso)
6. [Generación y Descarga de Reportes (PDF y Excel Multi-Pestaña)](#6-generación-y-descarga-de-reportes-pdf-y-excel-multi-pestaña)
7. [Puesta en Marcha en Entorno Local (Instalación y Despliegue)](#7-puesta-en-marcha-en-entorno-local-instalación-y-despliegue)

---

## 1. Propósito y Alcance del Sistema

Bajo el Decreto Ley 2106 de 2019 y la Ley 2050 de 2020, se eliminó la emisión de avales previos para los Planes Estratégicos de Seguridad Vial (PESV) y se instituyó el **mecanismo de autogestión, registro y verificación posterior**.

Esta plataforma informática fue diseñada para resolver los cuellos de botella del procesamiento masivo de datos del PESV en Colombia:
1. **Heterogeneidad y duplicidad en los reportes:** Empresas que envían el formulario varias veces con pequeñas variantes en su razón social o información incompleta.
2. **Subdeclaración y evasión de requisitos:** Empresas que se autodeclaran en nivel *Básico* para omitir pasos exigentes (auditorías, investigaciones con Pirámide de Hyden, tecnología de telemetría de velocidad), cuando por tamaño de flota o número de conductores les corresponde legalmente el nivel *Estándar* o *Avanzado*.
3. **Cálculos manuales erróneos:** Discrepancias entre lo reportado por la empresa y el valor matemático real de los 13 indicadores de gestión.
4. **Falta de cuantificación de la incertidumbre:** En censos donde existen duplicados o dispersión de datos, reportar un único número es metodológicamente deficiente. La aplicación calcula explícitamente el intervalo de confianza e incertidumbre ($\bar{X} \pm \delta x$).
5. **Falta de focalización en la Asistencia Técnica de la ANSV:** El sistema traduce automáticamente las anomalías e infracciones en órdenes de trabajo concretas para que los funcionarios de la ANSV intervengan a las empresas antes de que ocurran fatalidades.

---

## 2. Dónde se Hace Cada Análisis (Arquitectura del Código y Mapeo de Vistas)

El código fuente está estructurado de manera modular entre motores de cálculo lógico (TypeScript puro en `src/utils/`) y componentes reactivos de visualización (`src/components/`).

| Análisis / Módulo | Archivo Lógico (Motor) | Vista de Interfaz (Componente React) | ¿Qué hace exactamente? |
| :--- | :--- | :--- | :--- |
| **Limpieza ETL y Duplicados** | `src/utils/etlPipeline.ts` | `src/components/EtlConsolidatorView.tsx` | Ejecuta en memoria la limpieza de duplicados, normalización con scoring de nombres, colapso 1:1, cálculo de $\Delta X$ y cruce de las partes 1, 2 y 3. |
| **Carga de Archivos Excel** | `src/utils/excelImporter.ts` | `src/components/DataImportModal.tsx` | Lee archivos `.xlsx`, `.xls` o `.csv` desde el computador, procesa las hojas y las mapea al censo estructurado. |
| **Cálculo de los 13 Indicadores PESV** | `src/utils/pesvCalculations.ts` (`calcularTodosIndicadores`) | `src/components/IndicatorsView.tsx` | Implementa las 13 fórmulas normativas del Paso 20 (TSV, $SV, RSVI, CM, %EJL, GVE, ELVL, IDP, CPMVh, CPFSV, NCAC) y verifica si la empresa calculó bien. |
| **Modelo de Incertidumbre ($\delta x$)** | `src/utils/pesvCalculations.ts` (`calcularMetricaConIncertidumbre`) | `src/components/DashboardOverview.tsx` e `IndicatorsView.tsx` | Modela la incertidumbre poblacional e individual ($\bar{X} \pm \delta x$) por duplicación y dispersión de datos. |
| **Auditoría de Clasificación de Empresas** | `src/utils/pesvCalculations.ts` (`calcularNivelPESV`) | `src/components/ClassificationAuditView.tsx` | Evalúa independientemente flota y conductores según Misionalidad 1 o 2. Genera matriz de discrepancias (Básico vs. Estándar vs. Avanzado). |
| **Verificación de Entrega según Nivel** | `src/utils/pesvCalculations.ts` (`verificarIndicadoresEntregados`) | `src/components/ClassificationAuditView.tsx` | Compara los pasos e indicadores entregados frente a los 18, 22 o 24 exigibles por ley. |
| **Análisis de Infracciones de Tránsito** | `src/types/pesv.ts` (`InfraccionesTransito`) | `src/components/InfractionsAnalysisView.tsx` | Agrupa comparendos A1-H11 del Código Nacional de Tránsito, calcula tasas de exceso y correlación con siniestros viales. |
| **Alertas y Asistencia Técnica ANSV** | `src/utils/pesvCalculations.ts` (`generarAlertasANSV`) | `src/components/TechnicalAssistanceView.tsx` | Evalúa 6 disparadores de riesgo (velocidad, fatiga, mantenimiento, capacitación, siniestralidad, discrepancias) y emite planes de asistencia técnica. |
| **Distribución Territorial** | `src/utils/colombiaGeo.ts` | `src/components/GeoDistributionView.tsx` | Mapeo interactivo sobre mapa vectorial de Colombia con coordenadas oficiales WGS84, burbujas por municipio y ranking departamental. |
| **Reportes y Exportación** | `src/utils/excelExporter.ts` | `src/components/ReportsView.tsx` | Genera libros `.xlsx` multi-pestaña (formato ANSV) y dictámenes técnicos imprimibles en formato PDF con firma institucional. |
| **Ficha Técnica de Empresa** | `src/types/pesv.ts` (`EmpresaPESV`) | `src/components/CompanyDetailModal.tsx` | Ventana modal de detalle que muestra la auditoría integral de una empresa específica. |
| **Consulta Metodológica** | Documentación interna | `src/components/MethodologyModal.tsx` | Resumen normativo de la resolución accesible desde la barra superior. |

---

## 3. Dónde y Cómo Pasar los Datos a la Aplicación

La aplicación ofrece **dos puntos de entrada principales** para cargar nueva información:

### Opción A: Botón Superior "Cargar Datos (Excel)"
Disponible permanentemente en la barra superior (icono verde con hoja de cálculo). Al hacer clic se despliega el modal interactivo con dos pestañas:
1. **Pestaña "Excel Completo"**: Para cuando ya tienes la base consolidada final (archivo `.xlsx` o `.csv` con todas las columnas unificadas). Arrastra el archivo o haz clic en examinar. El sistema detectará las cabeceras automáticamente.
2. **Pestaña "Tres Excel Separados (Partes 1, 2 y 3)"**: Si tienes los tres archivos descargados de los formularios de Google Forms o Microsoft Forms (`Parte1_consolidado.xlsx`, `Parte2_consolidado.xlsx`, `Parte3_consolidado.xlsx`), cárgalos en los tres casilleros respectivos. El sistema ejecutará el proceso de consolidación.

### Opción B: Pestaña Especializada "ETL & Consolidación"
Ubicada en la barra de navegación principal (icono de engranaje y base de datos). 
- Es el entorno ideal para auditar el proceso de limpieza paso a paso.
- Te muestra la advertencia inicial obligatoria de limpieza de duplicados.
- Permite procesar los archivos de prueba o subir los tres archivos reales.
- Ejecuta los 6 pasos del algoritmo en tiempo real, te muestra cuántos duplicados encontró, qué acción sugiere (`Conservar` vs. `Eliminar`), calcula el $\Delta X$ global y clasifica los registros en:
  - **Categoría A (Formulario Completo - 3 partes)**: La base para los análisis del dashboard.
  - **Categorías B y C (Formulario Incompleto - 1 o 2 partes)**: Registros parciales.
- Incluye el botón **"Cargar Datos Consolidados al Dashboard Analítico"**, que transfiere inmediatamente los resultados de la limpieza al estado general de la aplicación.

---

## 4. Cómo se Hace Cada Análisis (Metodología Técnica y Algoritmos)

### 4.1 Pipeline ETL: Limpieza, Duplicados, Triangulación de Nombres y Cruce Outer-Merge
*Ubicación del código:* `src/utils/etlPipeline.ts` y `src/components/EtlConsolidatorView.tsx`

El pipeline traduce de forma exacta el código Python de ingeniería de datos provisto:

1. **Estabilización del Año del Reporte de Autogestión:**
   ```typescript
   // Se remueve " (opcional)", se eliminan espacios en blanco y se convierte a entero
   const anioLimpio = String(row['Año del reporte de autogestión'])
     .replace(' (opcional)', '')
     .trim();
   const anioInt = parseInt(anioLimpio, 10) || 2024;
   ```

2. **Triangulación y Normalización de Razones Sociales (Votación + Función de Puntaje S.A.S.):**
   Una misma empresa puede haber escrito *"TRANSPORTE RAPIDO SAS"*, *"Transporte Rápido S.A.S."* o incluso haber digitado solo su NIT en la casilla del nombre.
   Para resolverlo, se agrupan todos los nombres asociados al mismo NIT en las tres partes y se evalúan mediante la función de scoring:
   ```typescript
   let puntaje = nombre.length;
   // Si el nombre es únicamente numérico (error de tipeo del NIT en nombre):
   if (/^\d+$/.test(nombre.replace(/[\s\.\-]/g, ''))) {
     puntaje -= 500;
   }
   // Si contiene abreviatura societaria formal con puntos:
   if (/\b(S\.A\.S\.|S\.A\.|LTDA\.|S\.C\.A\.|INC\.)\b/i.test(nombre)) {
     puntaje += 100;
   } else if (/\b(SAS|SA|LTDA|SCA)\b/i.test(nombre)) {
     puntaje += 50;
   }
   ```
   Se selecciona el nombre con mayor número de repeticiones (votos) entre los formularios. En caso de empate, gana el de mayor puntaje. Este nombre limpio se propaga como el nombre maestro oficial.

3. **Estandarización del Tipo de Documento y Correo Electrónico:**
   - Si la razón social contiene `"persona natural"`, el tipo de documento se estandariza automáticamente como `C.C.`.
   - Se unifican mediante conteo de votos variantes como `C.C`, `CC`, `NIT.`, `Nit`, `NIT`.
   - Los correos electrónicos se limpian a minúsculas, eliminando espacios y deduplicando cadenas separadas por coma o punto y coma.

4. **Revisión Inteligente de Duplicados (Evaluación de Celdas Vacías):**
   Las filas que comparten las llaves clave (`Año`, `Razón Social`, `Tipo Doc`, `Número Doc`, `Correo`) se analizan calculando `Total_Vacios` (número de columnas sin información):
   - Si una fila tiene menos vacíos que otra: la más completa se etiqueta como `Conservar (Más Completo)` y la otra como `Eliminar (Incompleto)`.
   - Si tienen la misma cantidad de vacíos y datos idénticos: una se marca como `Conservar (Original)` y las copias como `Eliminar (Mismos datos en ambos)`.
   - Si tienen la misma cantidad de vacíos pero datos conflictivos: se marcan como `Revisar (Mismos vacíos, datos diferentes)` para que el usuario audite la discrepancia.

5. **Colapso 1:1 y Cálculo de Incertidumbre Global Fija ($\Delta X$):**
   Para las empresas que enviaron múltiples veces una misma parte, sus columnas numéricas se colapsan tomando el promedio individual:
   $$\bar{f}_{empresa} = \frac{\sum f_i}{n_i}$$
   Para cada variable numérica, se identifica el valor máximo reportado por cada empresa y se suma en toda la población (`suma_global_max`). El $\Delta X$ global fijo se calcula dividiendo esta suma sobre el total de empresas únicas $T$:
   $$Delta\_X = \frac{\sum_{j=1}^{T} \max(f_{ij})}{T}$$
   Este delta se asigna como columna fija en la base consolidada (`Delta_<nombre_columna>`).

6. **Cruce Total (Outer Merge) y Categorización en A, B y C:**
   Se incorporan banderas de presencia (`Flag_P1`, `Flag_P2`, `Flag_P3`) y se realiza el cruce exterior (outer join). Según la suma de banderas:
   - **Categoría A ($3$ partes):** Formulario Completo. Pasa inmediatamente a la base analítica.
   - **Categoría B ($2$ partes):** Formulario Parcial. Se exporta al archivo de seguimiento para requerir la parte faltante.
   - **Categoría C ($1$ parte):** Formulario Incompleto. Se genera alerta de omisión.

---

### 4.2 Modelo Matemático de Incertidumbre ($\bar{X} \pm \delta x$)
*Ubicación del código:* `src/utils/pesvCalculations.ts` (`calcularMetricaConIncertidumbre`)

En lugar de reportar valores puntuales estáticos, cada indicador en la plataforma se expresa como:
$$\text{Resultado} = \bar{X} \pm \delta x$$

Donde:
- $T$: Total de empresas analizadas.
- $F$: Número de empresas que presentaron duplicidad o variación en sus reportes.
- $U = T - F$: Número de empresas con reporte único y consistente.
- $\bar{F}_j$: Media de los reportes de la empresa duplicada $j$.
- $\delta x$ (Incertidumbre del indicador):
  $$\delta x = \frac{\sum_{j=1}^{F} \max(f_{j,i}) \times \frac{F}{T} + \sigma_{muestral}}{\sqrt{T}}$$

Esto garantiza que si los datos provienen de formularios con alta variabilidad o baja calidad de digitación, la incertidumbre $\delta x$ aumente, alertando a la ANSV que el valor requiere verificación en campo.

---

### 4.3 Verificación de Clasificación de Empresas (Nivel Legal vs. Autodeclarado)
*Ubicación del código:* `src/utils/pesvCalculations.ts` (`calcularNivelPESV`)

La Resolución Mintransporte / ANSV define los niveles de diseño e implementación del PESV evaluando dos variables independientes:
1. **Flota de vehículos:** Total de vehículos automotores y no automotores puestos al servicio de la organización (propios, arrendados, contratados o en leasing).
2. **Censo de conductores:** Total de personas que conducen vehículos para cumplir las funciones de la empresa (conductores de planta, contratistas, fuerza de ventas, técnicos de campo, directivos que conducen). Se excluyen expresamente los peatones y acompañantes.

El nivel final legal obligatorio es el **más alto** que resulte de comparar ambos criterios:
$$\text{Nivel Legal} = \max(\text{Nivel}(\text{Flota}), \; \text{Nivel}(\text{Conductores}))$$

#### Tabla de Decisión Normativa:

| Misionalidad de la Organización | Nivel Legal Obligatorio | Rango de Flota de Vehículos | Rango de Conductores | Pasos del PESV Exigibles |
| :--- | :--- | :--- | :--- | :--- |
| **Misionalidad 1** (Empresas de Transporte Terrestre Automotor de pasajeros, carga, especial o mixto) | **Básico** | De 11 a 19 vehículos | De 2 a 19 conductores | 18 pasos |
| | **Estándar** | De 20 a 50 vehículos | De 20 a 50 conductores | 22 pasos |
| | **Avanzado** | Más de 50 vehículos | Más de 50 conductores | 24 pasos completos |
| | *No Obligado* | Menos de 11 vehículos | Menos de 2 conductores | N/A |
| **Misionalidad 2** (Empresas cuya actividad principal es diferente al transporte: comercio, industria, salud, alimentos, construcción, etc.) | **Básico** | De 11 a 49 vehículos | De 2 a 49 conductores | 18 pasos |
| | **Estándar** | De 50 a 100 vehículos | De 50 a 100 conductores | 22 pasos |
| | **Avanzado** | Más de 100 vehículos | Más de 100 conductores | 24 pasos completos |
| | *No Obligado* | Menos de 11 vehículos | Menos de 2 conductores | N/A |

#### Auditoría de Discrepancias:
La aplicación compara:
- `Nivel_Reportado` (lo que la empresa marcó en el formulario).
- `Nivel_Calculado` (el nivel que dicta la fórmula legal con los datos de flota y conductores).

Si `Nivel_Calculado > Nivel_Reportado`, se genera una **Alerta Crítica de Subdeclaración**. La aplicación lista de inmediato los pasos normativos que la empresa intentó evadir y la clasifica con prioridad alta de asistencia técnica y fiscalización.

---

### 4.4 Verificación de Entrega de Indicadores y Pasos según Nivel (Básico, Estándar, Avanzado)
*Ubicación del código:* `src/utils/pesvCalculations.ts` (`verificarIndicadoresEntregados`)

La resolución no exige los mismos requisitos a todos los niveles:

* **Nivel Básico (18 pasos):**
  - *Pasos que NO le aplican:*
    - Paso 2: Comité de Seguridad Vial (CSV) formal.
    - Paso 11: Responsabilidad y comportamiento seguro.
    - Paso 13: Investigación interna de siniestros viales con metodología formal.
    - Paso 18: Gestión del cambio y gestión de contratistas.
    - Paso 19: Archivo y retención documental especializada.
    - Paso 21: Registro y análisis estadístico según la Pirámide de Hyden.
  - *Indicadores no exigibles:* Indicador 2 (Costos de siniestros), Indicador 7 (Cobertura programa de velocidad), Indicador 8 (Excesos de velocidad por telemetría/GPS).
* **Nivel Estándar (22 pasos):**
  - *Pasos que NO le aplican:* Paso 11 y Paso 21.
  - *Indicador no exigible:* Indicador 8 (Excesos medidos por GPS).
  - *Indicadores obligatorios adicionales frente a Básico:* Indicador 2 ($SV) e Indicador 7 (GVE).
* **Nivel Avanzado (24 pasos):**
  - *Debe implementar la totalidad de los 24 pasos.*
  - Debe reportar obligatoriamente la totalidad de los 13 indicadores, incluyendo el **Indicador 8 (ELVL)** con mediciones de dispositivos tecnológicos a bordo (GPS, tacógrafo, OBD) y el **Paso 21** con clasificación de siniestros por nivel de pérdida (muertos, graves, leves, choques simples y cuasicolisiones).

La aplicación audita cada empresa, revisa qué indicadores reportó y emite el dictamen:
- `Completo`: Entregó todos los indicadores exigidos para su nivel real.
- `Incompleto`: Faltan indicadores obligatorios de su nivel.
- `Sobrecumplimiento`: Entregó indicadores de un nivel superior al suyo (ej. un Básico que reporta telemetría de velocidad).

---

### 4.5 Las Fórmulas de los 13 Indicadores del PESV (Paso 20 de la Metodología)
*Ubicación del código:* `src/utils/pesvCalculations.ts` e `src/components/IndicatorsView.tsx`

La plataforma implementa las fórmulas oficiales de la **Tabla 10 (Paso 20)** de la Metodología:

#### Indicador 1: Tasa de Siniestros Viales ($TSV$)
* **Fórmula:**
  $$TSV(n) = \frac{SV(tn) \times 1.000.000}{km(t)}$$
* **Variables:**
  - $SV(tn)$: Número de siniestros viales ocurridos en el periodo $t$ para el nivel de pérdida $n$ (fatal, grave, leve o solo daños).
  - $km(t)$: Total de kilómetros recorridos por la flota en el periodo $t$.
* **Meta legal recomendada:** $< 2.0$ siniestros por millón de km.
* **Periodicidad:** Trimestral. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 2: Costos de Siniestros Viales ($\$SV$)
* **Fórmula:**
  $$\$SV(n) = CDSV(tn) + CISV(tn)$$
* **Variables:**
  - $CDSV$: Costos directos (reparación de vehículos, deducibles de pólizas, atención médica inmediata).
  - $CISV$: Costos indirectos (lucro cesante, tiempos muertos de la flota, horas de reemplazo de personal, trámites periciales).
* **Periodicidad:** Semestral. Aplica a: Estándar y Avanzado.

#### Indicador 3: Impacto de Gestión de Riesgos Viales ($RSVI$ / $GRV$)
* **Fórmula:**
  $$RSVI = RI(fa) - RI(ia) \quad \Big| \quad GRV = RVA(fa) - RVA(ia)$$
* **Variables:**
  - $RI(fa)$ e $RI(ia)$: Riesgos viales identificados en fecha actual vs. fecha inicial.
  - $RVA$: Riesgos con valoración alta o crítica mitigados en la matriz de peligros.
* **Periodicidad:** Anual. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 4: Cumplimiento de Metas del PESV ($CM$)
* **Fórmula:**
  $$CM = \frac{MA(t)}{TM(t)} \times 100$$
* **Variables:**
  - $MA(t)$: Metas alcanzadas o cumplidas satisfactoriamente en el periodo $t$.
  - $TM(t)$: Total de metas trazadas en la planificación estratégica del PESV.
* **Meta esperada:** $\ge 85\%$.
* **Periodicidad:** Semestral. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 5: Cumplimiento del Plan Anual de Trabajo ($CPlan$)
* **Fórmula:**
  $$CPlan = \frac{AEPlan(t)}{APPlan(t)} \times 100$$
* **Variables:**
  - $AEPlan(t)$: Actividades del PESV ejecutadas efectivamente en el año.
  - $APPlan(t)$: Actividades programadas en el cronograma anual aprobado.
* **Meta esperada:** $\ge 90\%$.
* **Periodicidad:** Trimestral. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 6: Exceso de Jornadas Laborales de Conductores ($\%EJL$)
* **Fórmula:**
  $$\%EJL = \frac{\#EJD}{\#SDT} \times 100$$
* **Variables:**
  - $\#EJD$: Número de jornadas laborales en las que un conductor superó el límite legal de conducción diaria (más de 8-10 horas de conducción o sin pausas activas cada 2 horas).
  - $\#SDT$: Sumatoria de todos los días u turnos trabajados por los conductores de la organización.
* **Meta esperada:** $\le 5\%$ (idealmente $0\%$).
* **Periodicidad:** Mensual. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 7: Cobertura del Programa de Gestión de Velocidad ($GVE$)
* **Fórmula:**
  $$GVE = \frac{\#VIP}{\#VDL} \times 100$$
* **Variables:**
  - $\#VIP$: Número de vehículos vinculados o inspeccionados bajo el programa de control de velocidad segura.
  - $\#VDL$: Total de vehículos de la organización que realizan desplazamientos laborales.
* **Periodicidad:** Semestral. Aplica a: Estándar y Avanzado.

#### Indicador 8: Excesos al Límite de Velocidad Laboral ($ELVL$)
* **Fórmula:**
  $$ELVL = \frac{\#DLEV}{\#TDL} \times 100$$
* **Variables:**
  - $\#DLEV$: Número de días o recorridos en los que se registraron excesos de velocidad por encima de los límites de la empresa o la vía mediante dispositivos de telemetría / GPS.
  - $\#TDL$: Total de recorridos o días monitoreados con dispositivos telemáticos.
* **Meta esperada:** $\le 2\%$.
* **Periodicidad:** Mensual. Aplica obligatoriamente a: Avanzado.

#### Indicador 9: Inspecciones Diarias Preoperacionales ($IDP$)
* **Fórmula:**
  $$IDP = \frac{\#VID}{\#TV} \times 100$$
* **Variables:**
  - $\#VID$: Número de vehículos con lista de chequeo preoperacional diaria debidamente diligenciada y validada antes del primer encendido.
  - $\#TV$: Total de vehículos programados para operar en la jornada.
* **Meta esperada:** $\ge 95\%$.
* **Periodicidad:** Mensual. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 10: Cumplimiento del Plan de Mantenimiento Preventivo ($CPMVh$)
* **Fórmula:**
  $$CPMVh = \frac{MEVh(t)}{MPVh(t)} \times 100$$
* **Variables:**
  - $MEVh(t)$: Mantenimientos preventivos ejecutados a tiempo según el kilometraje o tiempo programado por el fabricante.
  - $MPVh(t)$: Mantenimientos preventivos programados en la matriz de la flota.
* **Meta esperada:** $\ge 90\%$.
* **Periodicidad:** Trimestral. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 11: Cumplimiento del Plan de Formación en Seguridad Vial ($CPFSV\text{ Cumplimiento}$)
* **Fórmula:**
  $$CPFSV = \frac{CESV(t)}{CPSV(t)} \times 100$$
* **Variables:**
  - $CESV(t)$: Sesiones o cursos de formación en seguridad vial ejecutados en el periodo.
  - $CPSV(t)$: Sesiones programadas en el plan anual de capacitación.
* **Meta esperada:** $\ge 85\%$.
* **Periodicidad:** Semestral. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 12: Cobertura del Plan de Formación en Seguridad Vial ($CPFSV\text{ Cobertura}$)
* **Fórmula:**
  $$CPFSV\_Cob = \frac{CFSV(t)}{CT(t)} \times 100$$
* **Variables:**
  - $CFSV(t)$: Número de conductores efectivamente capacitados y evaluados.
  - $CT(t)$: Total de conductores de la organización obligados a capacitarse.
* **Meta esperada:** $\ge 90\%$.
* **Periodicidad:** Semestral. Aplica a: Básico, Estándar y Avanzado.

#### Indicador 13: Cierre de No Conformidades de Auditoría ($NCAC$)
* **Fórmula:**
  $$NCAC = \frac{\#NCG}{\#NCI} \times 100$$
* **Variables:**
  - $\#NCG$: No conformidades gestionadas y cerradas con plan de acción verificado.
  - $\#NCI$: Total de no conformidades identificadas en las auditorías internas o revisiones por la alta dirección.
* **Meta esperada:** $\ge 80\%$.
* **Periodicidad:** Anual. Aplica a: Básico, Estándar y Avanzado.

---

### 4.6 Análisis y Correlación de Infracciones de Tránsito
*Ubicación del código:* `src/components/InfractionsAnalysisView.tsx`

La plataforma incluye la matriz de comparendos de tránsito tipificados en el **Código Nacional de Tránsito Terrestre (Ley 769 de 2002)**:

- **Grupo A (A1 a A12):** No transitar por la derecha, no usar casco en motocicleta, circular sin prendas reflectivas.
- **Grupo B (B1 a B23):** Conducir sin portar la licencia de conducción, placas ilegibles o adulteradas, no usar cinturón de seguridad.
- **Grupo C (C1 a C40):** 
  - `C29`: Conducir a velocidad superior a la máxima permitida (factor de mayor letalidad vial).
  - `C14`: Transitar por sitios prohibidos o en horas no permitidas (pico y placa o zonas residenciales restringidas).
  - `C02`: Estacionar en sitios prohibidos.
  - `C38`: No realizar la revisión técnico-mecánica y de emisiones contaminantes.
- **Grupo D (D1 a D17):**
  - `D01`: Guiar un vehículo sin haber obtenido la licencia de conducción.
  - `D02`: Conducir con la licencia suspendida o cancelada.
  - `D04`: No portar o no tener vigente el Seguro Obligatorio de Accidentes de Tránsito (SOAT).
- **Grupo E (E1 a E9):**
  - `E03`: Conducir bajo el influjo del alcohol o sustancias psicoactivas.
- **Grupo H (H1 a H11):**
  - `H04`: Conducir durante más de 8 horas consecutivas o violar las normas sobre tiempos de reposo y relevo de conductores de servicio público.

El sistema correlaciona la cantidad de comparendos C29 y H04 con la Tasa de Siniestralidad ($TSV$), evidenciando qué empresas tienen una cultura de riesgo no mitigada.

---

### 4.7 Generación Automática de Alertas y Órdenes de Asistencia Técnica ANSV
*Ubicación del código:* `src/utils/pesvCalculations.ts` (`generarAlertasANSV`) y `src/components/TechnicalAssistanceView.tsx`

El motor de reglas analiza simultáneamente la clasificación, los 13 indicadores y las infracciones para encender alertas clasificadas en 6 ejes temáticos:

| Eje Temático de Asistencia Técnica | Disparador de Alerta (Trigger) | Severidad | Pasos PESV Involucrados | Recomendación de Intervención de la ANSV |
| :--- | :--- | :--- | :--- | :--- |
| **1. Gestión de Velocidad Segura** | Comparendos C29 $> 0$, Indicador $ELVL > 5\%$ o siniestros por velocidad. | **Crítica** | Paso 8.1 (Velocidad segura) y Paso 15 (Planificación de viajes). | Acompañamiento en la adopción de sensores GPS / tacógrafos y definición de velocidades operacionales seguras por debajo de los límites de diseño vial. |
| **2. Prevención de Fatiga y Jornadas** | Indicador $\%EJL > 10\%$ o comparendos H04 registrados. | **Alta** | Paso 8.2 (Programa de prevención de fatiga) y Paso 15. | Capacitación en regulación de turnos, descansos biológicos, pausas activas obligatorias y relevos en rutas de larga distancia. |
| **3. Calificación y Diagnóstico PESV** | Discrepancia entre Nivel Reportado vs. Nivel Calculado (Subdeclaración). | **Alta** | Pasos omitidos (Paso 2, 11, 13, 18, 19, 21). | Asistencia técnica jurídica para reestructurar el PESV de la empresa al nivel legal que le corresponde y subsanar vacíos documentales. |
| **4. Inspección y Mantenimiento de Flota** | Indicador $CPMVh < 70\%$, $IDP < 80\%$ o comparendos C38/D04. | **Media** | Pasos 16 (Mantenimiento) y 17 (Inspección preoperacional). | Implementación de listas de chequeo digitales y auditoría a los talleres mecánicos contratados. |
| **5. Formación y Competencias Viales** | Indicador $CPFSV < 75\%$ o comparendos D01/D02 (licencias). | **Media** | Pasos 9, 10 y 11 (Planes de formación y comportamiento). | Estructuración de la malla curricular obligatoria de seguridad vial y verificación estricta de idoneidad y licencias en el RUNT. |
| **6. Investigación de Siniestros** | $TSV > 3.0$ siniestros/millón km o fatalidades registradas. | **Crítica** | Paso 13 (Investigación) y Paso 21 (Pirámide de Hyden). | Taller en sitio sobre árbol de causas, análisis de cuasicolisiones y planes de acción correctiva para evitar reincidencia. |

Al hacer clic en **"Generar Misión Técnica"** en cualquiera de las empresas alertadas, el sistema genera la Orden de Trabajo Oficial de la ANSV con fecha, funcionario asignado y pasos a intervenir.

---

### 4.8 Distribución Territorial y Geoespacial de Colombia
*Ubicación del código:* `src/utils/colombiaGeo.ts` y `src/components/GeoDistributionView.tsx`

La plataforma proyecta las coordenadas geográficas de los 32 departamentos y municipios capitales de Colombia utilizando una proyección cartográfica proporcional EPSG:4326 (WGS84):
- **Burbujas escaladas:** El diámetro y color de cada burbuja en el mapa de Colombia varía dinámicamente según la cantidad de empresas censadas y su nivel promedio de siniestralidad.
- **Ranking Departamental:** Lista interactiva ordenada por total de vehículos y conductores por departamento, permitiendo a los directores regionales de la ANSV focalizar las brigadas de fiscalización.

---

## 5. Cómo Funciona la Aplicación (Guía de Navegación Paso a Paso)

### Flujo de Navegación entre Pestañas:

```
[ Barra Superior: Cargar Datos / Exportar Excel / Metodología ]
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
[ 1. Dashboard ]   [ 2. 13 Indicadores ]   [ 3. Auditoría ]
 • KPIs c/ Incertid. • Fórmulas Paso 20      • Matriz Discrep.
 • Resumen Niveles   • Rangos y Metas        • Pasos Faltantes
 • Sectores CIIU     • Tabla por Empresa     • Nivel Calculado
       │                   │                   │
       ▼                   ▼                   ▼
[ 4. Infracciones ] [ 5. Asistencia ANSV ] [ 6. Mapa Geo ]
 • Comparendos A-H   • Ejes Temáticos        • Mapa Colombia
 • Velocidad (C29)   • Alertas Prioritarias  • Ranking Deptos
 • Fatiga (H04)      • Orden de Misión       • Densidad Flota
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
              [ 7. ETL & Consolidación ]
               • Limpieza Duplicados
               • Triangulación Nombres
               • Deltas de Incertidumbre
               • Categorías A, B y C
                           │
                           ▼
              [ 8. Reportes PDF y Excel ]
               • Descarga Libro Multi-Pestaña
               • Dictamen Técnico Imprimible
```

1. **Dashboard General:** Vista de bienvenida para la alta dirección de la ANSV con 4 tarjetas KPI que incluyen el intervalo de incertidumbre ($\bar{X} \pm \delta x$), gráfico comparativo entre niveles de empresas y desglose por sector económico (transporte, hidrocarburos, alimentos, construcción, salud).
2. **13 Indicadores & Incertidumbre:** Catálogo interactivo de los 13 indicadores del Paso 20. Al hacer clic en cualquiera (ej. *Tasa de Siniestros Viales* o *Inspecciones Diarias Preoperacionales*), el tablero actualiza la fórmula formal, las condiciones de periodicidad, la gráfica de cumplimiento y la tabla empresa por empresa.
3. **Verificación de Clasificación:** La consola de auditoría legal. Aquí se evidencia qué empresas mintieron o se equivocaron en su autodeclaración (ej. marcaron Básico teniendo flota de Avanzado). Permite filtrar con un clic *"Ver solo empresas con discrepancia"*.
4. **Análisis de Infracciones:** Tablero de control de comparendos de tránsito de la flota. Identifica empresas con reincidencia en velocidad (C29) y sobrejornada laboral (H04).
5. **Asistencia Técnica ANSV:** El centro de operaciones de la ANSV. Organiza las empresas en cola de atención prioritaria según la gravedad de sus alertas.
6. **Distribución Territorial:** Mapa interactivo de Colombia para análisis espacial de la cobertura del PESV.
7. **Consolidador ETL Formularios:** El módulo de ingeniería de datos para procesar archivos brutos de formularios, limpiar duplicados y generar las bases finales.
8. **Reportes PDF & Excel:** Generador oficial de documentos descargables y certificaciones técnicas.

---

## 6. Generación y Descarga de Reportes (PDF y Excel Multi-Pestaña)

*Ubicación del código:* `src/utils/excelExporter.ts` y `src/components/ReportsView.tsx`

### 1. Libro Completo de Microsoft Excel (`.xlsx`)
La plataforma utiliza la librería `xlsx` (SheetJS) para generar un libro estructurado que incluye cuatro hojas de cálculo independientes:
- **Hoja 1: `Censo_Empresas_PESV`:** Razón social normalizada, NIT, departamento, municipio, sector económico, flota de vehículos, conductores, nivel reportado, nivel calculado legal y estado de discrepancia.
- **Hoja 2: `Indicadores_e_Incertidumbre`:** Los 13 indicadores calculados para cada empresa, junto con las columnas `Delta_X` de incertidumbre de cada variable.
- **Hoja 3: `Infracciones_Transito`:** Desglose detallado de comparendos por tipo (C29, C14, C38, D04, H04, etc.) y total de infracciones acumuladas.
- **Hoja 4: `Alertas_Asistencia_Tecnica`:** Listado de todas las alertas vigentes, severidad (Crítica, Alta, Media), pasos normativos afectados y recomendaciones técnicas expedidas.

### 2. Dictamen Técnico Oficial en PDF (Imprimible)
Diseñado con formato de documento ministerial oficial:
- Encabezados institucionales del **Ministerio de Transporte** y la **Agencia Nacional de Seguridad Vial**.
- Identificación formal de la entidad evaluadora y fecha de emisión.
- Resumen ejecutivo de la auditoría del censo de autogestión.
- Tabla de dictámenes de discrepancia legal de clasificación.
- Hoja de ruta de **Asistencia Técnica Prioritaria** y requerimientos perentorios a las organizaciones subdeclaradas.
- Zona de firmas autorizadas de la Dirección Técnica de la ANSV.
- Compatible con el botón de impresión del navegador o *"Guardar como PDF"*.

---

## 7. Puesta en Marcha en Entorno Local (Instalación y Despliegue)

### Requisitos Previos:
- Node.js versión 18.0 o superior instalado.
- Gestor de paquetes `npm` o `bun`.

### Instrucciones de Ejecución:

```bash
# 1. Clonar o acceder al directorio del proyecto
cd <directorio_del_proyecto>

# 2. Instalar dependencias requeridas
npm install

# 3. Iniciar el servidor de desarrollo local en Vite (Puerto 3000)
npm run dev

# 4. Validar tipos de TypeScript y sintaxis de componentes
npm run lint

# 5. Compilar el paquete de producción optimizado
npm run build
```

El servidor local estará disponible de forma inmediata en `http://localhost:3000`.

---

*Desarrollado como solución técnica y analítica de soporte a la gestión del Plan Estratégico de Seguridad Vial (PESV) en el marco de la política de Visión Cero en Colombia con ayuda de Google Studio AI.*
