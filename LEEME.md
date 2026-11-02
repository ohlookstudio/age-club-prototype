# AGE Club — Prototipo · V5

Material confidencial sujeto a NDA. Fase 01. Diseño visual definitivo aplicado sobre la arquitectura UX aprobada en V4.

## Contenido

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | El prototipo: interfaz, sistema visual V5 y panel de demostración |
| `data.js` | Datos: 6 planes × 12 meses según «El recorrido del cliente», las 4 categorías, las promociones de «Exclusivo para socios» (`PROMOS`) y las fotografías (`PHOTOS`) |
| `app.js` | Lógica: navegación, estados, registro e inicio de sesión simulados, reservas, cambios, cancelaciones, canjes, código de descuento y solicitudes de cita simuladas |
| `img/` | 20 fotografías reales de AGE Clinic, recortadas y optimizadas para web (780 px de ancho como máximo) |
| `brand/` | Logotipo completo de AGE Club en negro y en blanco, y brandmark de AGE Club: PNG originales sin modificar |
| `fonts/` | Evolventa (titulares y cifras) y Poppins (texto), alojadas en el propio paquete, con sus licencias |
| `icons/`, `manifest.webmanifest` | Favicon, icono de iOS e iconos PWA generados a partir del brandmark original de AGE Clinic |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos tal cual |
| `robots.txt`, `_headers` | Piden a los buscadores que no indexen el sitio |

Todas las rutas son relativas: funciona en la raíz de un dominio o en una subcarpeta. No necesita servidor, compilación, dependencias ni servicios externos. El estado vive en la pestaña del navegador; al recargar vuelve al escenario inicial.

## Probarlo en tu ordenador

Descomprime la carpeta y abre `index.html` con Chrome, Safari, Firefox o Edge. Funciona sin conexión.

- **Entrada:** empieza en la Bienvenida. «Explorar membresías» lleva a las 4 categorías sin cuenta. Para entrar como socia: «Iniciar sesión» con `lucia.martin@ejemplo.com` y cualquier contraseña.
- **Exclusivo para socios:** con sesión y membresía, desde la tarjeta fotográfica de Inicio. La etiqueta de cada promoción depende del plan activo: con Botox Essential, HIFU es «Adicional a tu plan»; con Premium, «Incluido en tu plan · Meses 2 y 4». La solicitud de cita es una simulación.
- **Código de descuento:** en Activación. Solo se valida el formato (4–20 letras o números); `PRUEBA1` se registra y `AB-1` da error. No cambia el importe.
- **Escritorio:** el panel lateral permite elegir entre 5 escenarios, simular el mes del ciclo y saltar a cualquiera de las 64 pantallas. «Modo paciente» oculta el panel.
- **Móvil:** el prototipo ocupa toda la pantalla. El botón DEMO, abajo a la derecha, abre el panel.
- **Enlace directo a una pantalla:** añade su código al final de la URL, por ejemplo `index.html#E1` o `index.html#G2`.

## Añadir o retirar promociones

En `data.js`, la lista `PROMOS`. Cada promoción tiene `status` (`ejemplo`, `aprobada` o `retirada`), la clave del catálogo (`key`), la imagen, los precios (`null` mientras no estén confirmados), las condiciones, los planes a los que se ofrece y las fechas de validez. Si una promoción no tiene precios y condiciones confirmados, la ficha muestra un único bloque «Precio y condiciones · DEMO».

## Publicarlo en GitHub Pages

1. Sube el contenido de esta carpeta, incluido el archivo oculto `.nojekyll`, a la raíz o a una subcarpeta del repositorio, por ejemplo `/age-club-v5/`.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Elige la rama y la carpeta.
3. La dirección será `https://USUARIO.github.io/REPOSITORIO/` (más la subcarpeta, si la usaste).

**Confidencialidad.** En los planes Free, Pro y Team, un sitio de GitHub Pages es público aunque el repositorio sea privado; solo GitHub Enterprise Cloud permite restringirlo. Este paquete incluye fotografías reales de AGE Clinic. Con el NDA, valora antes una opción con acceso restringido (por ejemplo, Cloudflare Pages con Cloudflare Access).

## Hipótesis pendientes de aprobación

1. Tratamientos y beneficios se desbloquean al empezar su mes del ciclo; no hay reservas ni canjes anticipados.
2. Cambiar de plan reinicia el ciclo en el Mes 1 y anula las citas reservadas.
3. Un cambio de fecha queda «solicitado» hasta que la clínica lo confirma.
4. «Valoración» se trata como revisión; «Matcha/coffee + croissant», como regalo.
5. El progreso cuenta actos clínicos; regalos y Rewards se cuentan aparte.
6. Código de descuento: solo se valida el formato.
7. Exclusivo para socios: promociones de ejemplo sin precios ni condiciones; si una promoción coincide con un tratamiento incluido en el plan, su compatibilidad está por validar.

Importes mensuales, planes y meses proceden del documento de AGE Clinic. Fechas, citas, disponibilidad, estados, promociones y datos personales son simulados (DEMO). Duración, permanencia y renovación siguen por confirmar.
