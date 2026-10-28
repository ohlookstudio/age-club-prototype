# AGE Club — Prototipo UX · V4

Material confidencial sujeto a NDA. Fase 01 pendiente de validación. Wireframes en escala de grises: no es el diseño visual definitivo.

## Contenido

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | El prototipo: interfaz, estilos y panel de demostración |
| `data.js` | Datos locales: 6 planes × 12 meses según «El recorrido del cliente» y las 4 categorías de selección |
| `app.js` | Lógica: navegación, estados, registro e inicio de sesión simulados, reservas, cambios, cancelaciones, canjes y código de descuento |
| `brand/` | Logotipo completo y brandmark de AGE Club, PNG originales sin modificar (solo en Bienvenida, Crear cuenta e Iniciar sesión) |
| `icons/`, `manifest.webmanifest` | Favicon, icono de iOS e iconos PWA generados a partir del brandmark original de AGE Clinic, sobre fondo blanco provisional |
| `fonts/` | Tipografía IBM Plex alojada en el propio paquete (licencia OFL incluida) |
| `.nojekyll` | Indica a GitHub Pages que publique los archivos tal cual |
| `robots.txt`, `_headers` | Piden a los buscadores que no indexen el sitio |

Todas las rutas son relativas: funciona en la raíz de un dominio o dentro de una subcarpeta. No necesita servidor, compilación, dependencias ni servicios externos. El estado vive en la pestaña del navegador; al recargar, vuelve al escenario inicial.

## Probarlo en tu ordenador

Descomprime la carpeta y abre `index.html` con Chrome, Safari, Firefox o Edge. Funciona sin conexión.

- **Entrada:** empieza en la Bienvenida. «Explorar membresías» lleva a las 4 categorías sin necesidad de cuenta. Para entrar como socia, usa «Iniciar sesión» con la cuenta de prueba `lucia.martin@ejemplo.com` y cualquier contraseña. También puedes crear una cuenta: el registro es simulado y no guarda datos.
- **Código de descuento:** en Activación. Solo se valida el formato (4–20 letras o números); por ejemplo, `PRUEBA1` se registra y `AB-1` da error. No cambia el importe.
- **Escritorio:** el panel lateral permite elegir entre los 5 escenarios, simular el mes del ciclo y saltar a cualquiera de las 59 pantallas. «Modo paciente» oculta el panel.
- **Móvil:** el prototipo ocupa toda la pantalla. El botón DEMO, arriba a la derecha, abre el panel.
- **Enlace directo a una pantalla:** añade su código al final de la URL, por ejemplo `index.html#A2` o `index.html#E12`.

## Publicarlo en GitHub Pages

1. Crea un repositorio (o usa uno existente) y sube el contenido de esta carpeta, incluido el archivo oculto `.nojekyll`, a la raíz o a una subcarpeta, por ejemplo `/age-club-v4/`.
2. En el repositorio: **Settings → Pages → Build and deployment → Source: Deploy from a branch**. Elige la rama (por ejemplo `main`) y la carpeta (`/root` o `/docs`).
3. Espera a que termine la publicación. La dirección será `https://USUARIO.github.io/REPOSITORIO/` (más la subcarpeta, si la usaste).

**Confidencialidad.** En los planes Free, Pro y Team, un sitio de GitHub Pages es público aunque el repositorio sea privado. Solo GitHub Enterprise Cloud permite restringir el acceso a un sitio de Pages. Con el NDA, valora antes una opción con acceso restringido (por ejemplo, Cloudflare Pages con Cloudflare Access, que pide un código por correo a las direcciones autorizadas).

## Hipótesis pendientes de aprobación

1. Tratamientos y beneficios se desbloquean al empezar su mes del ciclo; no hay reservas ni canjes anticipados.
2. Cambiar de plan reinicia el ciclo en el Mes 1 y anula las citas reservadas.
3. Un cambio de fecha queda «solicitado» hasta que la clínica lo confirma.
4. «Valoración» se trata como revisión; «Matcha/coffee + croissant», como regalo.
5. El progreso cuenta actos clínicos; los regalos y Rewards se cuentan aparte.
6. Código de descuento: solo se valida el formato; las reglas comerciales están por confirmar.

Importes mensuales, planes y meses proceden del documento de AGE Clinic. Fechas, citas, disponibilidad, estados y datos personales son simulados (marca DEMO). Duración, permanencia y renovación siguen por confirmar.
