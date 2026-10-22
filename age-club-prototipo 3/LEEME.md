# AGE Club · Prototipo UX navegable (Fase 01)

Material confidencial sujeto a NDA. Fase 01 pendiente de validación. No es diseño visual definitivo.

## Contenido

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | El prototipo: interfaz, estilos y panel de demostración |
| `data.js` | Datos locales: 6 planes × 12 meses según «El recorrido del cliente» |
| `app.js` | Lógica: navegación, estados, reservas, cambios, cancelaciones, canjes |
| `fonts/` | Tipografía IBM Plex alojada en el propio paquete (licencia OFL incluida) |
| `robots.txt`, `_headers` | Piden a los buscadores que no indexen el sitio |
| `brand/` | Logotipo completo y brandmark de AGE Club, PNG originales sin modificar (solo en Bienvenida, Crear cuenta e Iniciar sesión) |
| `icons/`, `manifest.webmanifest` | Favicon, icono de iOS e iconos PWA generados a partir del brandmark original de AGE Clinic, sobre fondo blanco provisional |

No necesita servidor, base de datos ni conexión a servicios externos. Todo el estado vive en la pestaña del navegador; al recargar, vuelve al escenario inicial.

## Probarlo en tu ordenador

Descomprime la carpeta y abre `index.html` con Chrome, Safari, Firefox o Edge. Funciona sin conexión.

- **Entrada:** el prototipo empieza en la Bienvenida. Para explorar sin cuenta, toca «Explorar membresías». Para entrar como socia, usa «Iniciar sesión» con la cuenta de prueba `lucia.martin@ejemplo.com` y cualquier contraseña. También puedes crear una cuenta: el registro es simulado y no guarda datos.
- **Escritorio:** el panel lateral permite elegir entre los 5 escenarios, simular el mes del ciclo y saltar a cualquiera de las 54 pantallas. «Modo paciente» oculta el panel.
- **Móvil:** el prototipo ocupa toda la pantalla. El botón DEMO, arriba a la derecha, abre el panel.
- **Enlace directo a una pantalla:** añade su código al final de la URL, por ejemplo `index.html#E1` o `index.html#D9`.

## Publicarlo con acceso restringido

La URL no debe ser pública. Abajo tienes las opciones de más a menos recomendable para un proyecto con NDA. Ninguna se ha activado.

### Opción A · Cloudflare Pages + Cloudflare Access (recomendada)

Cloudflare Access tiene un plan gratuito para equipos de menos de 50 usuarios. Pide un código de un solo uso por correo, así que solo entran las direcciones que autorices (por ejemplo, las personas concretas de OUI Creatives o todo su dominio).

1. Crea una cuenta en Cloudflare y entra en **Workers & Pages → Create → Pages → Upload assets**.
2. Sube esta carpeta (sin comprimir) y ponle un nombre al proyecto, por ejemplo `ageclub-proto-xxxx`.
3. En **Zero Trust → Access → Applications → Add application → Self-hosted**, añade el dominio del proyecto (`ageclub-proto-xxxx.pages.dev`) y también `*.ageclub-proto-xxxx.pages.dev`.
4. Crea una política **Allow** con la regla «Emails» (direcciones concretas) o «Emails ending in» (`@dominio-de-oui.com`).
5. En **Settings → Authentication**, activa **One-time PIN**.
6. Comprueba el acceso desde una ventana privada antes de compartir la URL.

La segunda entrada del paso 3 protege también las URL de vista previa de cada despliegue, que de otro modo quedarían abiertas.

### Opción B · Vercel

- **Vercel Authentication:** gratis en todos los planes, pero quien visite el sitio necesita una cuenta de Vercel con acceso al equipo.
- **Password Protection:** una contraseña compartida. En el plan Pro cuesta 20 $ al mes por proyecto y en Hobby no está disponible.

### Opción C · Netlify

La protección con contraseña de todo el sitio solo está en los planes Pro (20 $/mes) y Enterprise. Netlify Drop en el plan gratuito no permite contraseña, así que no es adecuado para el NDA.

### Opción D · Claude (artefacto)

El prototipo ya está publicado como artefacto privado en tu cuenta de Claude. Desde su menú **Compartir** decides quién puede abrirlo. Si la única opción disponible es «Cualquiera con el enlace», ten en cuenta que es un enlace no listado, pero sin contraseña: quien lo reciba, aunque sea reenviado, puede abrirlo.

### Qué no hacer

- No uses una «contraseña» escrita en JavaScript dentro de la página: se salta desde las herramientas del navegador.
- No subas el paquete a un repositorio público (GitHub Pages en abierto).

## Hipótesis pendientes de aprobación

1. Un tratamiento se puede reservar cuando empieza su mes del ciclo.
2. Cambiar de plan reinicia el ciclo en el Mes 1 y anula las citas reservadas.
3. Un cambio de fecha queda «solicitado» hasta que la clínica lo confirma.
4. «Valoración» se trata como revisión; «Matcha/coffee + croissant», como regalo.
5. El progreso cuenta actos clínicos; los regalos y Rewards se cuentan aparte.

Importes, planes y meses proceden del documento de AGE Clinic. Fechas, citas, disponibilidad, estados y datos personales son simulados (marca DEMO). Lo no documentado aparece como «Por confirmar».

## Iconos

Los iconos se han generado reduciendo el PNG original del brandmark de AGE Clinic, sin redibujarlo, centrado sobre fondo blanco con margen de seguridad: favicon de 16, 32 y 48 px, `favicon.ico`, `apple-touch-icon` de 180 px e iconos PWA de 192 y 512 px (normales y adaptables). El manifiesto permite añadir el prototipo a la pantalla de inicio; no incluye funcionamiento sin conexión. Los colores corporativos definitivos están pendientes.
