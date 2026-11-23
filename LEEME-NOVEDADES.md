# Novedades editables sin actualizar la app

> Es el **mismo `novedades.json` para la app Android y para el portal de la web**: lo editás una vez y se actualizan los dos. En el sitio, la dirección está en `src/config/news.js` y el kit de respaldo en `public/novedades/`.

El carrusel **"Novedades para vos"** lee un archivo `novedades.json` que está publicado en internet. Cuando lo cambiás, los socios ven las novedades nuevas la próxima vez que abren la app (o cuando vuelven a ella), **sin actualizar ni reinstalar nada** y sin tocar el código.

## 1) Publicarlo una sola vez (≈10 minutos)

1. En GitHub creá un repositorio **público** llamado `finix-novedades` (solo contendrá las novedades, nada sensible).
2. Subí el contenido de la carpeta `public/novedades/` de este proyecto: `novedades.json`, `supermiercoles.html` y la carpeta `img/`.
3. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
4. Esperá 1–2 minutos. El archivo quedará en `https://TU-USUARIO.github.io/finix-novedades/novedades.json` (abrilo en el navegador para comprobarlo).
5. Esa dirección tiene que coincidir con `NEWS_URL` en `src/config/news.js`. Hoy está puesta con el usuario **gonzasingh** (supuesto a partir del nombre de tu repositorio de la app). Si tu usuario u hosting es otro, cambiá solo esa línea (o definí `VITE_NEWS_URL`) y generá la app **una vez más**. Después ya no hace falta volver a generarla para cambiar novedades.

## 2) Cambiar las novedades cuando quieras

Opción fácil: abrí `herramientas/editor-novedades.html` en el navegador, cargá el `novedades.json` (o "Abrir desde internet"), editá con vista previa, tocá **Descargar novedades.json** y reemplazá ese archivo en GitHub (**Add file → Upload files**, o el lápiz ✏️ del archivo). Para una imagen o página nueva, subila a la misma carpeta.

Opción manual: editá `novedades.json` directamente en GitHub con el lápiz ✏️.

GitHub Pages guarda en caché hasta ~10 minutos: los cambios pueden tardar ese tiempo en verse.

## 3) Campos de cada novedad

| Campo | Qué es |
|---|---|
| `id` | Nombre único sin espacios (ej. `promo-diciembre`). |
| `activo` | `true` se muestra · `false` queda guardada pero oculta. |
| `desde` / `hasta` | Fechas `AAAA-MM-DD` de vigencia (opcionales, `hasta` inclusive). Vencida = desaparece sola. |
| `etiqueta` | Texto corto del chip (ej. `Promo`). Opcional. |
| `titulo` | Título grande (obligatorio, hasta 90 caracteres). |
| `texto` | Bajada (hasta 140 caracteres). Opcional. |
| `imagen` | Imagen chica de la derecha: `img/archivo.png` (misma carpeta) o una dirección `https://`. Ideal: cuadrada, ~400 × 400 px. Opcional. |
| `ajuste` | `contener` (íconos/ilustraciones, se ve entera) o `cubrir` (fotos, llena el cuadro). |
| `destino` | Qué pasa al tocar. `{"tipo":"web","url":"pagina.html"}` abre una página web dentro de la app (solo `https://`). `{"tipo":"app","seccion":"sucursales"}` lleva a una sección: `simulador`, `requisitos`, `sucursales`, `atencion`, `nosotros` y, con sesión iniciada, `creditos`, `solicitudes`, `avisos`, `perfil`. Sin `destino`, la tarjeta no se toca. |

El orden de la lista es el orden del carrusel. Si no queda ninguna novedad vigente, la sección se oculta sola. Si el archivo no se puede descargar, la app muestra la última versión que ya tenía guardada.

## Notas

- Si el JSON tiene un error de escritura (una coma de más, etc.), la app ignora ese cambio y conserva lo anterior; el editor evita estos errores.
- Las páginas web que se abren dentro de la app deben ser `https://` y permitir mostrarse en la app.
- Para usar otro hosting (Firebase, tu propio servidor, etc.) alcanza con que el archivo sea accesible por `https://` y permita lectura desde cualquier origen (CORS `*`).
