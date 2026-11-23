# FINIX Center · Sitio institucional + Portal de socios

Proyecto en **React + Vite + Tailwind CSS**, listo para subir a **GitHub** y publicar en **Vercel**. El portal de socios trabaja con **los datos reales de FINIX**: la misma API AdmCloud (`nuevo.mine.nu`, empresa `FINIX`) que usa la app Android de socios.

| Ruta | Qué es | Quién accede |
|------|--------|--------------|
| `/` | Sitio institucional (hero con simulador, beneficios, cómo funciona, app, nosotros, dólar, FAQ) | Público |
| `/ingresar` | Inicio de sesión del socio (DNI + contraseña) | Público |
| `/portal` | Portal del socio: saldo, próxima cuota, créditos, estado de cuenta, solicitudes, avisos, perfil, cambio de contraseña | Socios (cuenta real de FINIX) |
| `/panel` | Panel de gestión: socios, créditos, solicitudes y auditoría | Colaboradores (pestaña "Soy colaborador" del ingreso) |

> **Socios y colaboradores usan fuentes de datos distintas.** Los socios ven siempre los datos reales de FINIX (API AdmCloud). El panel de colaboradores usa **Firebase** si está configurado (sección 4) y, si no, **datos de ejemplo guardados en el navegador** (no son los datos reales de AdmCloud). Las credenciales de ejemplo no se muestran en pantalla.

## 1. Probarlo en local

```bash
npm install
npm run dev          # http://localhost:5173  -> MODO DEMO (datos de ejemplo, sin servidor)
npm run dev:real     # http://localhost:5173  -> conectado al servidor REAL de FINIX
```

**Modo demo** (`npm run dev`): socios y colaboradores con datos de ejemplo guardados en el navegador, sin tocar el servidor real. Credenciales de prueba (no se muestran en la pantalla de ingreso):

- Socio: Mateo E. Gomez · DNI `38492615` · clave `demo1234`
- Colaborador (pestaña "Soy colaborador"): `colaborador@finixcenter.com` · clave `Finix2026!`

**Modo real** (`npm run dev:real`): ingresás con el DNI y la contraseña de un socio real, así que cualquier operación (ej. enviar una solicitud o cambiar la contraseña) se hace sobre datos reales. En el build de producción (`npm run build`) los socios siempre usan datos reales y el modo demo no se incluye; las credenciales de ejemplo del colaborador solo sirven mientras el panel no esté conectado a Firebase.

## 2. Conexión con los datos reales de FINIX

| Pantalla | Dato real | Endpoint de la API (`/api/…`) |
|---|---|---|
| Ingreso | DNI + contraseña del socio (token Bearer) | `ClienteAuth/login` |
| Inicio / Mis créditos | Saldo, cuota, plan, avance, "Con atraso" | `ClienteCuenta/creditos` |
| Estado de cuenta | Próximo vencimiento + movimientos (pagos, tickets, intereses…) | `ClienteCuenta/estado-cuenta/{idVenta}` |
| Mis solicitudes / Detalle | Estado, observaciones y línea de tiempo | `ClienteSolicitudes/mis-solicitudes`, `crm/solicitudes/{id}/detalle` |
| Avisos | Notificaciones del servidor (leídas / no leídas) | `ClienteNotificaciones` (+ `/leer`, `/leer-todas`) |
| Perfil | Nombre, DNI, dirección, teléfono, correo, empresa | `ClientePerfil` |
| Cambiar contraseña | — | `ClienteAuth/cambiar-password` |
| Nueva solicitud (desde el simulador) | Se envía con los datos del perfil | `Publico/solicitudes`, `Publico/planes` |
| Contacto de la empresa | Correo y redes (si el servidor los informa) | `Empresa/FINIX` |

Código: `src/services/apiProvider.js` (mapeo de las respuestas) y `src/services/apiClient.js` (cliente HTTP).

**Cómo llegan las consultas:** el servidor de FINIX **no habilita CORS**, así que el navegador no puede llamarlo directo. El sitio lo consulta por su propia ruta `/admcloud-api/…`, y el hosting la reenvía a `https://nuevo.mine.nu/admcloud-api/…`:

- **Producción (Vercel):** lo hace `vercel.json` (regla `rewrites`). Por eso el sitio con datos reales **se publica en Vercel**.
- **Desarrollo:** lo hace el proxy de `vite.config.js` (`npm run dev:real`). Si el servidor cambia de dirección: `API_PROXY_TARGET=https://otro.dominio npm run dev:real` y editá el destino en `vercel.json`.
- Variables opcionales (`.env.example`): `VITE_API_BASE_URL`, `VITE_EMPRESA_CODIGO`, `VITE_NEWS_URL`.

**Cosas para saber:**

1. La sesión se guarda en el navegador (`localStorage`) y se cierra sola cuando el servidor la vence: el sitio avisa "La sesión expiró" en la pantalla de ingreso.
2. **Estado de cuenta:** la API no entrega un cronograma de cuotas, así que se muestra lo que informa el servidor (próximo vencimiento, importe de cuota y movimientos) en vez de inventar fechas.
3. **Simulador:** usa las tasas de `src/config/business.js`, no las del servidor. Al enviar la solicitud se usa el plan del servidor (Semanal / Quincenal / Mensual).
4. No se guardan datos financieros en caché: las consultas van con `no-store`, y al volver a la pestaña después de un minuto el portal se actualiza solo.
5. Si el servicio no responde, el portal muestra el error con un botón **Reintentar** (no datos viejos).

## 3. Subir a GitHub y publicar en Vercel

```bash
git init && git add . && git commit -m "FINIX Center web"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/finix-center-web.git
git push -u origin main
```

En <https://vercel.com/new> importá el repo (se detecta Vite) y desplegá: **no hace falta cargar variables de entorno**. `vercel.json` ya incluye el reenvío a la API de FINIX y el rewrite para que las rutas (`/portal`) funcionen al recargar.

Después de publicar, probá el ingreso con un socio real (o de prueba). Si dice "El servicio no está disponible", revisá que el servidor `nuevo.mine.nu` esté en línea y que la regla `/admcloud-api` de `vercel.json` esté desplegada.

### GitHub Pages (solo sitio institucional y panel de ejemplo)

El workflow `.github/workflows/deploy.yml` publica en `https://USUARIO.github.io/NOMBRE-REPO/`, pero **GitHub Pages no puede reenviar las consultas a la API de FINIX** (es un hosting de archivos: no acepta `POST`). Ahí el sitio institucional funciona, pero el **ingreso de socios falla** con un mensaje como *"No pudimos conectar con el servidor de FINIX… (código 405)"*. Ese código 405 es la señal de que el sitio está en un hosting sin reenvío: para tener datos reales publicalo en **Vercel**. (Alternativa: que el servidor de FINIX habilite CORS para tu dominio y definir `VITE_API_BASE_URL`.)

## 4. Panel de colaboradores con Firebase (opcional)

Sin configuración, el panel funciona con datos de ejemplo del navegador (útil para mostrarlo). Para usarlo con cuentas y datos reales de colaboradores:

1. Creá un proyecto en <https://console.firebase.google.com> y activá **Authentication → Email/Password** y **Firestore Database**.
2. En *Configuración del proyecto → Tus apps → Web* copiá la configuración y completá `.env.local` (usá `.env.example` como guía).
3. Publicá las reglas de seguridad: `npx firebase-tools deploy --only firestore:rules` (archivo `firestore.rules`) o pegalas en la consola.
4. Descargá una **clave de cuenta de servicio** (Configuración → Cuentas de servicio → Generar clave privada), guardala como `serviceAccountKey.json` (está en `.gitignore`, **no la subas**) y creá los usuarios:

```bash
npm run seed -- staff --email valeria@tudominio.com --password "Clave-Segura-1" --name "Valeria Ortiz"
npm run seed -- demo        # opcional: colaborador + socios con créditos de ejemplo
```

Cómo funciona el acceso: los **colaboradores** ingresan con su email. El rol vive en `users/{uid}` y solo se puede escribir con el Admin SDK, así nadie puede auto-asignarse permisos.

### Modelo de datos (Firestore)

- `users/{uid}`: `role` (`socio`|`colaborador`), `displayName`, `clientId`, `active`
- `clients/{id}`: `legajo`, `nombre`, `dni`, `direccion`, `telefono`, `score` (0-100), `deleted`, `updatedAt/updatedByName`
- `credits/{id}`: `clientId`, `numero`, `plan`, `cuotas`, `valorCuota`, `cuotasPagas`, `estado`, `inicio`, `primerVencimiento`
- `requests/{id}`: `clientId`, `numero`, `monto`, `plan`, `cuotas`, `estado`, `timeline[]`
- `auditLogs/{id}`: `ts` (hora del servidor), `actorId/actorName/actorEmail`, `action`, `entityLabel`, `summary`, `changes[]`

### Auditoría

Cada alta, edición o baja de socio y cada acción sobre una solicitud (revisión, observación, **aprobación**, rechazo) escribe, en el mismo lote que el cambio, un registro con **qué colaborador** lo hizo y **la hora del servidor**. Las reglas impiden modificar o borrar registros de auditoría. La baja de socios es **lógica** (`deleted: true`) para conservar el historial. Se puede exportar a CSV desde el panel.

> Los socios no se cargan en Firebase: ingresan con la API de FINIX. En Vercel cargá las `VITE_FIREBASE_*` de `.env.example` en *Settings → Environment Variables* (y agregá tu dominio en *Firebase → Authentication → Settings → Dominios autorizados*). En GitHub Pages: *Settings → Secrets and variables → Actions → Secrets*.

## 5. Novedades editables ("Novedades para vos")

El carrusel de Inicio del portal lee un `novedades.json` publicado en internet (el mismo que usa la app Android), así se cambian las promos **sin volver a publicar el sitio**. Pasos, campos y editor visual: **[LEEME-NOVEDADES.md](LEEME-NOVEDADES.md)** y `herramientas/editor-novedades.html`. La dirección está en `src/config/news.js`; si no se puede descargar, se usa el kit incluido en `public/novedades/`.

## 6. Personalización rápida

- Textos, WhatsApp, teléfonos, horarios, tasas, planes, requisitos, sucursales y cotización USD: `src/config/business.js`
- Logo original: `src/assets/logo-finix.png` (versión blanca e isotipo incluidos). Recomendado reemplazar por un SVG vectorial para máxima nitidez.
- Colores y modo claro/oscuro: variables en `src/index.css` y `tailwind.config.js`
- Vista previa en un único archivo HTML (modo demo): `npm run build:preview` → `dist-preview/index.html`

## Notas

- Pendientes de completar en `business.js`: mail institucional y redes sociales (si el servidor los informa en `Empresa/FINIX`, el portal los toma de ahí).
- La sucursal "Casa Central Tucumán" (dirección y teléfono) es un dato de ejemplo: reemplazala por el real o quitala de `business.branches`.
- El simulador usa interés simple por período (6%, o 5% con Supermiércoles) según la maqueta de la app.
- Recuperación de contraseña: el enlace "¿Olvidaste tu contraseña?" deriva a WhatsApp; el cambio de contraseña estando adentro se hace desde Perfil.
- Los **socios no usan Firebase**; Firebase se usa solo para el panel de colaboradores (sección 4).

## Cotización del dólar automática

La sección "Compramos tus dólares" toma el **dólar blue de referencia** de una API pública, sin servidor propio ni API key:

1. **DolarApi.com** (`https://dolarapi.com/v1/dolares/blue`, campos `compra` y `venta`).
2. Si falla o devuelve datos inválidos, **Bluelytics** (`https://api.bluelytics.com.ar/v2/latest`).
3. Si ambas fallan, se muestra el valor manual de `BUSINESS.usd` en `src/config/business.js`.

Se actualiza cada 5 minutos (y al volver a la pestaña), pausada mientras la pestaña está oculta. El último valor se guarda 1 hora en el navegador para mostrarlo al instante.

Todo se configura en `src/config/business.js` → `usdLive`:

- `enabled`: `false` desactiva la API y muestra siempre el valor manual.
- `refreshMs`: frecuencia de actualización en milisegundos.
- `buyMarginPct` / `sellMarginPct`: ajuste en % sobre el blue para mostrar el precio propio de la casa (ej. `buyMarginPct: -2`). En `0` se muestra el valor del mercado tal cual.

Código: `src/services/exchangeRates.js` (fuentes y validación) y `src/lib/useDollarRate.js` (hook de React).
