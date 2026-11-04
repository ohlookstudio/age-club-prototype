# AGE Club — Prototipo · V5.7

Material confidencial sujeto a NDA. Fase 01. Diseño visual aprobado (V5.4), ajustes funcionales del cliente (V5.5) ajustes visuales y de nomenclatura (V5.6) y botones sobre fotografía sin círculo ni flecha (V5.7, 4 nov 2026).

## Contenido

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | El prototipo: interfaz, sistema visual V5 y panel de demostración |
| `data.js` | Datos: 6 planes × 12 meses según «El recorrido del cliente», las 4 categorías, las promociones de «Exclusivo para socios» (`PROMOS`), las fotografías (`PHOTOS`), la duración de las citas (`DURATIONS`) y los avisos generales sin sesión (`GENERAL_NOTIFS`) |
| `app.js` | Lógica: navegación, estados, registro e inicio de sesión simulados, reservas de 30 o 60 min, reserva anticipada, modificación directa de citas, cancelaciones, canjes, código de descuento y solicitudes de cita simuladas |
| `img/` | Fotografías optimizadas para web: las 5 tratadas de la carpeta AGE_CLUB_FOTOS (bienvenida y membresías, con su nombre original), 15 de AGE Clinic con el acabado V5.6 y la foto de perfil de Lucía |
| `brand/` | Logotipo completo de AGE Club en negro y en blanco, y brandmark de AGE Club: PNG originales sin modificar |
| `fonts/` | Evolventa (titulares y cifras) y Poppins (texto), alojadas en el propio paquete, con sus licencias |
| `icons/`, `manifest.webmanifest` | Favicon, icono de iOS e iconos PWA generados a partir del brandmark original de AGE Clinic |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos tal cual |
| `robots.txt`, `_headers` | Piden a los buscadores que no indexen el sitio |

Todas las rutas son relativas: funciona en la raíz de un dominio o en una subcarpeta. No necesita servidor, compilación, dependencias ni servicios externos. El estado vive en la pestaña del navegador; al recargar vuelve al escenario inicial.

## Probarlo en tu ordenador

Descomprime la carpeta y abre `index.html` con Chrome, Safari, Firefox o Edge. Funciona sin conexión.

- **Entrada:** empieza en la Bienvenida. «Explorar membresías» lleva a las 4 categorías sin cuenta. La campana abre los avisos generales sin iniciar sesión. Para entrar como socia: «Iniciar sesión» con `lucia.martin@ejemplo.com` y cualquier contraseña.
- **Exclusivo para socios:** con sesión y membresía, desde la tarjeta fotográfica de Inicio. La etiqueta de cada promoción depende del plan activo: con TOX Essential, HIFU es «Adicional a tu plan»; con Premium, «Incluido en tu plan · Meses 2 y 4». La solicitud de cita es una simulación.
- **Código de descuento:** en Activación. Solo se valida el formato (4–20 letras o números); `PRUEBA1` se registra y `AB-1` da error. No cambia el importe.
- **Escritorio:** el panel lateral permite elegir entre 5 escenarios, simular el mes del ciclo y saltar a cualquiera de las 68 pantallas. «Modo paciente» oculta el panel.
- **Móvil:** el prototipo ocupa toda la pantalla. El botón DEMO, abajo a la derecha, abre el panel.
- **Enlace directo a una pantalla:** añade su código al final de la URL, por ejemplo `index.html#E1` o `index.html#G2`.

## Cambios de la V5.7

Todos los botones principales sobre fotografía usan el mismo diseño que «Explorar membresías» (V5.5): pastilla beige con el texto centrado, sin círculo ni flecha, para que no parezcan controles que se arrastran. Afecta a «Lo quiero todo» (tarjeta Premium) y «Ver promociones» (Exclusivo para socios), desde el componente compartido `ctaPhoto()`. Las flechas «›» que indican navegación en tarjetas y listas se mantienen.

## Cambios de la V5.6

1. **Logotipo de bienvenida.** Archivo original `brand/Logo_Club-AgeClinic_White.png` a 185 px de ancho (antes 150 px, +23 %), con su proporción original. El degradado superior de la foto se refuerza ligeramente para que «ageclinic» se lea sobre la fotografía tratada.
2. **Nomenclatura TOX.** La categoría «Bótox» pasa a **TOX** y los planes a **TOX Essential (40 €/mes)** y **TOX Plus (60 €/mes)**. Descripción de la categoría: «Tratamientos con neuromoduladores, revisiones y regalos. En Plus, también HIFU». Los identificadores internos (`botox`, `botox-essential`, `botox-plus`) no cambian. Los nombres de tratamiento del documento («Botox tercio superior», «Botox») se mantienen.
3. **Fotografía.** Bienvenida y las cuatro categorías usan las fotografías tratadas de AGE_CLUB_FOTOS, sin filtros añadidos (solo tamaño y compresión). Las 15 fotografías de AGE Clinic se han retratado desde los originales de cámara con el mismo encuadre: sin el velo beige anterior, equilibrio de blancos parcial, puntos de negro y blanco por luminancia, contraste suave, vibrancia moderada que protege la piel y ligera calidez (`v5/appimg4.py`). La foto de perfil de Lucía no se modifica.
4. **Legibilidad.** La tarjeta TOX crece en altura cuando su descripción, más larga, lo necesita, para no tapar el rostro, y usa un degradado inferior algo más alto. La etiqueta «‹ Volver» sobre las fotografías tiene un halo oscuro más definido.

## Reglas funcionales (V5.5)

1. **Bienvenida.** «Explorar membresías» es un botón convencional: pastilla beige con el texto centrado, sin círculo ni flecha. Toda su superficie es pulsable.
2. **Duración de las citas.** Las citas pueden durar 30 o 60 minutos. Una cita de 60 min ocupa dos espacios consecutivos de 30 min de la agenda. La paciente solo elige la duración cuando su plan y el tratamiento permiten más de una; si no, se muestra la duración fija. La duración aparece en el resumen, en la confirmación, en el detalle de la cita y en la tarjeta de Reservas.
   - Las reglas viven en `DURATIONS` (`data.js`) y son **valores de demostración pendientes de confirmar**: Premium permite 30 o 60 min en tratamientos (revisiones y valoración, 30); TOX Plus permite 30 o 60 min en HIFU; el resto, 30 min.
   - Prioridad: `byPlan[plan][clave]` > `byPlan[plan].default` > `byKey[clave]` > `default`.
3. **Avisos sin sesión.** La Bienvenida tiene una campana que abre avisos generales de ejemplo (`GENERAL_NOTIFS`), sin datos de ninguna paciente. Los avisos personales (citas, pendientes, beneficios) solo aparecen con sesión iniciada.
4. **Modificar una cita.** Desde el detalle de la cita o la tarjeta de Reservas: «Modificar cita» → nueva fecha y hora → «Confirmar cambio». La cita se actualiza al momento en Inicio, Reservas y Mi recorrido, y se muestra «Cita modificada» con la fecha anterior. No existe el estado «Cambio solicitado» ni la aprobación de la clínica. La confirmación es simulada: no consulta una agenda real.
5. **Profesional.** La paciente nunca elige profesional. El resumen y el detalle de la cita muestran «Profesional: Asignado por la clínica» solo como información.
6. **Mi recorrido.**
   - Tratamientos y revisiones de meses futuros: sin candado. Se pueden **reservar con antelación** desde el recorrido (Lo siguiente, detalle del mes, calendario), desde Nueva reserva y desde Reservas. Las fechas ofrecidas están siempre **dentro del mes previsto**: reservar antes no adelanta el tratamiento ni cambia los meses del plan.
   - Regalos y Rewards de meses futuros: mantienen el candado y no se pueden canjear hasta que empieza su mes; entonces pasan a «Disponible».
   - Si se cancela una reserva anticipada, el tratamiento vuelve a «Previsto».

Pantallas nuevas en el inventario: AC6 (avisos sin sesión), D12 (modificar cita · revisar), D13 (cita modificada), D14 (reserva anticipada) y E13 (regalo futuro bloqueado). D6 y D7 muestran una reserva de 60 min.

## Añadir o retirar promociones

En `data.js`, la lista `PROMOS`. Cada promoción tiene `status` (`ejemplo`, `aprobada` o `retirada`), la clave del catálogo (`key`), la imagen, los precios (`null` mientras no estén confirmados), las condiciones, los planes a los que se ofrece y las fechas de validez. Si una promoción no tiene precios y condiciones confirmados, la ficha muestra un único bloque «Precio y condiciones · DEMO».

## Publicarlo en GitHub Pages

1. Sube el contenido de esta carpeta, incluido el archivo oculto `.nojekyll`, a la raíz o a una subcarpeta del repositorio, por ejemplo `/age-club-v5/`.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Elige la rama y la carpeta.
3. La dirección será `https://USUARIO.github.io/REPOSITORIO/` (más la subcarpeta, si la usaste).

**Confidencialidad.** En los planes Free, Pro y Team, un sitio de GitHub Pages es público aunque el repositorio sea privado; solo GitHub Enterprise Cloud permite restringirlo. Este paquete incluye fotografías reales de AGE Clinic. Con el NDA, valora antes una opción con acceso restringido (por ejemplo, Cloudflare Pages con Cloudflare Access).

## Hipótesis pendientes de aprobación

1. Reserva anticipada: la cita se fija dentro del mes previsto del tratamiento. Pendiente: con cuánta antelación se puede reservar, si un tratamiento puede realizarse antes de su mes y qué ocurre con una cita anticipada si la membresía cambia o se cancela.
2. Cambiar de plan reinicia el ciclo en el Mes 1 y anula las citas reservadas.
3. Duración de las citas (`DURATIONS`): qué planes y tratamientos permiten 60 min. Los valores actuales son de demostración.
4. «Valoración» se trata como revisión; «Matcha/coffee + croissant», como regalo.
5. El progreso cuenta actos clínicos; regalos y Rewards se cuentan aparte.
6. Código de descuento: solo se valida el formato.
7. Exclusivo para socios: promociones de ejemplo sin precios ni condiciones; si una promoción coincide con un tratamiento incluido en el plan, su compatibilidad está por validar.
8. Modificación de citas: límites para cambiar (plazo mínimo, número de cambios) y si un cambio puede mover la cita a otro mes del ciclo. En el prototipo, las fechas se ofrecen dentro del mes del tratamiento o desde mañana si es el mes actual.
9. Avisos sin sesión: contenido y frecuencia de los avisos generales (los actuales son ejemplos).
10. Disponibilidad real de la agenda y asignación de profesional: dependen del sistema de la clínica.
11. Nombres de tratamiento «Botox tercio superior» y «Botox» (del documento de AGE Clinic): se mantienen; confirmar si también deben cambiar.

Importes mensuales, planes y meses proceden del documento de AGE Clinic. Fechas, citas, disponibilidad, estados, promociones y datos personales son simulados (DEMO). Duración, permanencia y renovación siguen por confirmar.
