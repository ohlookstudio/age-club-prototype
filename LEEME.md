# AGE Club — Prototipo · V5.8

Material confidencial sujeto a NDA. Fase 01. Diseño visual aprobado (V5.4), ajustes funcionales del cliente (V5.5), ajustes visuales y de nomenclatura (V5.6), botones sobre fotografía sin círculo ni flecha (V5.7) y decisiones de la sesión del 4/11/2026 (V5.8, 5 nov 2026).

## Contenido

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | El prototipo: interfaz, sistema visual V5 y panel de demostración |
| `data.js` | Datos: 6 planes × 12 meses según «El recorrido del cliente», las 4 categorías, las promociones de «Exclusivo para socios» (`PROMOS`), las fotografías (`PHOTOS`), la duración de las citas (`DURATIONS`), los avisos generales sin sesión (`GENERAL_NOTIFS`) y los precios DEMO de los tratamientos individuales (`SINGLES`) |
| `app.js` | Lógica: navegación, estados, acceso con correo y código simulado, una o dos membresías, reservas de uno o dos servicios, reserva anticipada, modificación directa de citas, cancelaciones, canje por la clínica (simulado), código de descuento y solicitudes de cita simuladas |
| `img/` | Fotografías optimizadas para web: las 5 tratadas de la carpeta AGE_CLUB_FOTOS (bienvenida y membresías, con su nombre original), 15 de AGE Clinic con el acabado V5.6 y la foto de perfil de Lucía |
| `brand/` | Logotipo completo de AGE Club en negro y en blanco, y brandmark de AGE Club: PNG originales sin modificar |
| `fonts/` | Evolventa (titulares y cifras) y Poppins (texto), alojadas en el propio paquete, con sus licencias |
| `icons/`, `manifest.webmanifest` | Favicon, icono de iOS e iconos PWA generados a partir del brandmark original de AGE Clinic |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos tal cual |
| `robots.txt`, `_headers` | Piden a los buscadores que no indexen el sitio |

Todas las rutas son relativas: funciona en la raíz de un dominio o en una subcarpeta. No necesita servidor, compilación, dependencias ni servicios externos. El estado vive en la pestaña del navegador; al recargar vuelve al escenario inicial.

## Probarlo en tu ordenador

Descomprime la carpeta y abre `index.html` con Chrome, Safari, Firefox o Edge. Funciona sin conexión.

- **Entrada:** empieza en la Bienvenida. «Explorar membresías» lleva a las 4 categorías sin cuenta. La campana abre los avisos generales sin iniciar sesión. Para entrar como socia: «Iniciar sesión» con `lucia.martin@ejemplo.com` → «Enviar código» → código de prueba `123456`. No hay contraseñas.
- **Exclusivo para socios:** con sesión y membresía, desde la tarjeta fotográfica de Inicio. Cada promoción muestra precio habitual, precio de socio y ahorro (DEMO). La etiqueta depende de los planes activos: con TOX Essential, HIFU es «Adicional a tu plan»; con Premium, «Incluido en tu plan · Meses 2 y 4». La solicitud de cita es una simulación.
- **Dos membresías:** escenario «Socia · dos membresías» del panel (TOX Essential en el Mes 6 y Skinbooster Glow en el Mes 4).
- **Canje de regalos:** en el panel, «Backoffice de la clínica · simulación» lista los regalos disponibles; al pulsar «Entregar…» quedan canjeados. La app de la paciente no tiene ese botón.
- **Código de descuento:** en Activación. Solo se valida el formato (4–20 letras o números); `PRUEBA1` se registra y `AB-1` da error. No cambia el importe.
- **Escritorio:** el panel lateral permite elegir entre 6 escenarios, simular el mes del ciclo, simular el canje en la clínica y saltar a cualquiera de las 84 pantallas. «Modo paciente» oculta el panel.
- **Móvil:** el prototipo ocupa toda la pantalla. El botón DEMO, arriba en el centro, abre el panel (en V5.8 deja libre la esquina inferior derecha para el botón «Reservar»).
- **Enlace directo a una pantalla:** añade su código al final de la URL, por ejemplo `index.html#E1` o `index.html#G2`.

## Cambios de la V5.8 · decisiones de la sesión del 4/11/2026

Antes de cambiar nada se comparó cada decisión con la V5.7. Ya estaban resueltas y **no se han tocado**: el cambio de cita directo, las duraciones de 30/60 min, los avisos sin sesión, el candado solo en regalos y Rewards futuros, la reserva anticipada y la simulación del código de descuento (decisión 10).

1. **Acceso con correo y código.** Iniciar sesión pide solo el correo → «Enviar código» → pantalla «Introduce el código» (6 cifras, teclado numérico, autocompletado del código del SMS/correo), con «Reenviar código» y «Cambiar correo». Crear cuenta: nombre, apellidos, correo, móvil y condiciones → mismo paso de verificación → cuenta creada. Sin contraseña ni recuperación de contraseña. Envío y validación simulados: el código de prueba es `123456` (`DEMO.otp`); cualquier otro da error.
2. **Sin cambio de plan.** Se retiran la pantalla de cambio de plan (antigua A9), «Cambiar de membresía», «Cambiar a este plan» y el enlace «Cambiar plan» de Mi recorrido (ahora «Ver otros planes», que es solo una vista previa). En Mi membresía: «Cancelar esta membresía» (con confirmación) y «Contratar otra membresía».
3. **Dos membresías a la vez.** La ficha de otro plan ofrece «Contratar también esta membresía» («Se suma a tu …, que sigue activa»). Cada membresía tiene su propio ciclo de 12 meses, estados, citas, regalos y progreso. Inicio y Perfil muestran las dos; Reservas, Notificaciones, Beneficios e Historial las reúnen e indican a cuál pertenece cada elemento; Mi recorrido empieza con una pantalla para elegir cuál consultar («Mis membresías» vuelve a ella). Con dos activas no se ofrece una tercera. Cancelar una conserva lo realizado en el historial y anula sus citas reservadas.
4. **Dos servicios en una cita.** Nueva reserva: paso 1 «Servicios» (uno o dos, con casillas) → duración total → fecha y hora → resumen → confirmación. Los servicios se hacen seguidos y la duración total es la suma (p. ej. 30 + 30 = 60 min); solo se ofrecen horas con ese hueco consecutivo libre. Desde cualquier «Reservar» de un servicio se puede «Añadir otro servicio a esta cita». El detalle de la cita, la tarjeta de Reservas e Inicio muestran los dos servicios; modificar o cancelar mueve o anula los dos. Solo se combinan servicios con la misma ventana de reserva (los dos de este mes o los dos del mismo mes futuro). La reserva de un solo servicio no cambia. La agenda DEMO pasa a huecos de 30 min (10:00–14:00 y 16:00–19:30) para que quepan citas de hasta 120 min.
5. **Regalos solo en la clínica.** Se retira el botón «Simular: beneficio recogido» de la app. El beneficio explica «Recógelo en AGE Clinic» y que lo registra el equipo; los estados son Pendiente (bloqueado hasta su mes, antes «Próximamente»), Disponible y Canjeado. El canje se simula desde el panel de demostración («Backoffice de la clínica»).
6. **Móvil obligatorio** en Crear cuenta, Activación (si la cuenta no lo tuviera) y Datos personales, con validación básica: móvil español de 9 cifras que empieza por 6 o 7 (con o sin +34) o número internacional con prefijo.
7. **Sin referencias al profesional.** Fuera la fila «Profesional», «Asignado por la clínica» y la nota «El profesional lo asigna la clínica».
8. **Botón flotante «Reservar».** En Inicio, Mi recorrido, Reservas y Perfil, sobre la barra de pestañas y alineado a su derecha (52 px de alto, contraste AA). El contenido reserva su espacio para que nunca quede tapado. Sustituye al «+» de Reservas y a la casilla «Reservar» de Inicio, para no duplicar accesos. No aparece en fichas, flujos ni sin membresía.
9. **Tratamientos individuales con precio de socio.** Nueva lista `SINGLES` (`data.js`) con 9 tratamientos y precios DEMO. Se ve, sin entrar en la ficha, en Inicio sin membresía, en Exclusivo para socios (promociones con su descuento y lista completa) y en el catálogo de Tratamientos. La ficha del tratamiento y la de la promoción muestran el precio habitual tachado, el precio de socio destacado y el ahorro. Sustituye al bloque vacío «Precio y condiciones · DEMO».
11. **Revisión global.** 84 pantallas comprobadas en móvil (320, 390, 412 px) y escritorio.

Inventario: se retira A9 y se añaden AC7–AC9 (código), A10–A13 (segunda membresía y cancelación), B8 (Inicio con dos), C5 (precio individual), D15–D18 (dos servicios), E14–E15 (selector y segundo recorrido), F8–F9 (Perfil con dos; beneficio canjeado por la clínica). Escenario nuevo: «Socia · dos membresías».

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
5. **Profesional.** La paciente nunca elige profesional. Desde V5.8 tampoco se muestra ninguna referencia al profesional.
6. **Mi recorrido.**
   - Tratamientos y revisiones de meses futuros: sin candado. Se pueden **reservar con antelación** desde el recorrido (Lo siguiente, detalle del mes, calendario), desde Nueva reserva y desde Reservas. Las fechas ofrecidas están siempre **dentro del mes previsto**: reservar antes no adelanta el tratamiento ni cambia los meses del plan.
   - Regalos y Rewards de meses futuros: mantienen el candado y no se pueden canjear hasta que empieza su mes; entonces pasan a «Disponible».
   - Si se cancela una reserva anticipada, el tratamiento vuelve a «Previsto».

Pantallas nuevas en el inventario: AC6 (avisos sin sesión), D12 (modificar cita · revisar), D13 (cita modificada), D14 (reserva anticipada) y E13 (regalo futuro bloqueado). D6 y D7 muestran una reserva de 60 min.

## Añadir o retirar promociones

En `data.js`, la lista `PROMOS`. Cada promoción tiene `status` (`ejemplo`, `aprobada` o `retirada`), la clave del catálogo (`key`), la imagen, los precios (`null` mientras no estén confirmados), las condiciones, los planes a los que se ofrece y las fechas de validez. Si una promoción no tiene precios propios, toma los precios DEMO del tratamiento en `SINGLES` y los marca como DEMO.

## Cambiar los precios de los tratamientos individuales

En `data.js`, la lista `SINGLES.items`: `key` (clave del catálogo), `regular` (precio habitual) y `member` (precio de socio). El ahorro y el porcentaje se calculan solos. Todos los valores actuales son de demostración.

## Publicarlo en GitHub Pages

1. Sube el contenido de esta carpeta, incluido el archivo oculto `.nojekyll`, a la raíz o a una subcarpeta del repositorio, por ejemplo `/age-club-v5/`.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Elige la rama y la carpeta.
3. La dirección será `https://USUARIO.github.io/REPOSITORIO/` (más la subcarpeta, si la usaste).

**Confidencialidad.** En los planes Free, Pro y Team, un sitio de GitHub Pages es público aunque el repositorio sea privado; solo GitHub Enterprise Cloud permite restringirlo. Este paquete incluye fotografías reales de AGE Clinic. Con el NDA, valora antes una opción con acceso restringido (por ejemplo, Cloudflare Pages con Cloudflare Access).

## Pendiente de confirmar con AGE Clinic

1. **Acceso con código:** canal (correo, SMS o ambos), longitud y validez del código, número de intentos y tiempo entre reenvíos.
2. **Móvil:** formato definitivo, países admitidos y si se verifica por SMS.
3. **Varias membresías:** número máximo (el prototipo permite dos y no el mismo plan dos veces), cómo se cobran dos cuotas y si los beneficios pueden coincidir.
4. **Cancelar una membresía:** permanencia, preaviso, cuotas pendientes y qué pasa con las citas reservadas y los regalos no recogidos (en el prototipo, las citas se anulan y lo realizado se conserva).
5. **Dos servicios por cita:** qué servicios se pueden combinar, si pueden ser de membresías distintas o de meses distintos, orden y tiempo entre ellos, y si se puede quitar uno de una cita ya reservada.
6. **Duraciones** (`DURATIONS`) y agenda: valores DEMO; la disponibilidad real depende del sistema de la clínica.
7. **Precios de los tratamientos individuales** (`SINGLES`): todos DEMO, igual que el descuento de socio. Condiciones, y compatibilidad con promociones y códigos.
8. **Canje en la clínica:** qué herramienta usa el equipo (backoffice) y si la paciente recibe un aviso al canjear.
9. **Códigos de descuento (decisión 10):** se mantiene la simulación; solo se valida el formato y el importe no cambia.
10. Reserva anticipada: cuánta antelación se permite y si un tratamiento puede realizarse antes de su mes.
11. Modificación de citas: plazo mínimo y número de cambios.
12. «Valoración» se trata como revisión; «Matcha/coffee + croissant», como regalo. El progreso cuenta actos clínicos.
13. Avisos sin sesión: contenido y frecuencia (los actuales son ejemplos).
14. Nombres de tratamiento «Botox tercio superior» y «Botox» (del documento de AGE Clinic): se mantienen; confirmar si también deben cambiar.

Importes mensuales, planes y meses proceden del documento de AGE Clinic. Fechas, citas, disponibilidad, estados, promociones, precios de tratamientos individuales, códigos de acceso y datos personales son simulados (DEMO). Duración, permanencia y renovación siguen por confirmar.
