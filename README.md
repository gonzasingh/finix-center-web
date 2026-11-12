# FINIX Center · Sitio institucional + Portal de socios + Panel de colaboradores

Proyecto completo en **React + Vite + Tailwind CSS + Firebase (Auth y Firestore)**, listo para subir a **GitHub** y publicar en **Vercel**.

| Ruta | Qué es | Quién accede |
|------|--------|--------------|
| `/` | Sitio institucional (hero con simulador, beneficios, cómo funciona, app, nosotros, dólar, FAQ) | Público |
| `/ingresar` | Inicio de sesión (pestañas *Soy socio* / *Soy colaborador*) | Público |
| `/portal` | Dashboard del socio: saldo, próxima cuota, créditos, estado de cuenta, solicitudes, avisos, perfil | Rol `socio` |
| `/panel` | Dashboard del colaborador: socios, créditos, solicitudes y auditoría | Rol `colaborador` |

## 1. Probarlo en local (modo demo, sin Firebase)

```bash
npm install
npm run dev          # http://localhost:5173
```

Sin variables de entorno el sitio corre en **modo demo** con datos de ejemplo guardados en el navegador:

- Socio: Mateo E. Gomez · DNI `38492615` · clave `demo1234`
- Colaborador: `colaborador@finixcenter.com` · clave `Finix2026!`

## 2. Conectar con Firebase

1. Creá un proyecto en <https://console.firebase.google.com> y activá **Authentication → Email/Password** y **Firestore Database**.
2. En *Configuración del proyecto → Tus apps → Web* copiá la configuración y completá `.env.local` (usá `.env.example` como guía).
3. Publicá las reglas de seguridad: `npx firebase-tools deploy --only firestore:rules` (archivo `firestore.rules`) o pegalas en la consola.
4. Descargá una **clave de cuenta de servicio** (Configuración → Cuentas de servicio → Generar clave privada), guardala como `serviceAccountKey.json` (está en `.gitignore`, **no la subas**) y creá los usuarios:

```bash
npm run seed -- staff --email valeria@tudominio.com --password "Clave-Segura-1" --name "Valeria Ortiz"
npm run seed -- socio --dni 38492615 --password "ClaveSocio1" --name "Mateo E. Gomez" --address "Calle 123" --phone "+54 9 381 555 0142"
npm run seed -- demo        # opcional: colaborador + socios con créditos de ejemplo
```

Cómo funciona el acceso: los **socios** ingresan con DNI + contraseña (internamente `DNI@socios.finixcenter.app` en Firebase Auth, no es un mail real) y los **colaboradores** con su email. El rol vive en `users/{uid}` y solo se puede escribir con el Admin SDK, así nadie puede auto-asignarse permisos.

### Modelo de datos (Firestore)

- `users/{uid}`: `role` (`socio`|`colaborador`), `displayName`, `clientId`, `active`
- `clients/{id}`: `legajo`, `nombre`, `dni`, `direccion`, `telefono`, `score` (0-100), `deleted`, `updatedAt/updatedByName`
- `credits/{id}`: `clientId`, `numero`, `plan`, `cuotas`, `valorCuota`, `cuotasPagas`, `estado`, `inicio`, `primerVencimiento`
- `requests/{id}`: `clientId`, `numero`, `monto`, `plan`, `cuotas`, `estado`, `timeline[]`
- `auditLogs/{id}`: `ts` (hora del servidor), `actorId/actorName/actorEmail`, `action`, `entityLabel`, `summary`, `changes[]`

### Auditoría

Cada alta, edición o baja de socio y cada acción sobre una solicitud (revisión, observación, **aprobación**, rechazo) escribe, en el mismo lote que el cambio, un registro con **qué colaborador** lo hizo y **la hora del servidor**. Las reglas impiden modificar o borrar registros de auditoría. La baja de socios es **lógica** (`deleted: true`) para conservar el historial. Se puede exportar a CSV desde el panel.

## 3. Subir a GitHub y publicar en Vercel

```bash
git init && git add . && git commit -m "FINIX Center web"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/finix-center-web.git
git push -u origin main
```

En <https://vercel.com/new> importá el repo (se detecta Vite). En **Settings → Environment Variables** cargá las `VITE_FIREBASE_*` de `.env.example` y desplegá. `vercel.json` ya incluye el rewrite para que las rutas (`/portal`, `/panel`) funcionen al recargar. Agregá tu dominio de Vercel en *Firebase → Authentication → Settings → Dominios autorizados*.

## 3b. Publicar en GitHub Pages (alternativa a Vercel)

1. Subí el proyecto a un repositorio (ver pasos de arriba). `package.json` debe quedar en la **raíz** del repo y la carpeta `.github/workflows/deploy.yml` tiene que subirse también.
2. En el repo: **Settings → Pages → Build and deployment → Source: _GitHub Actions_** (no “Deploy from a branch”).
3. Cada `git push` a `main` ejecuta el workflow (pestaña **Actions**) y publica en `https://USUARIO.github.io/NOMBRE-REPO/`.
4. Opcional (Firebase): en **Settings → Secrets and variables → Actions** creá los *secrets* `VITE_FIREBASE_*` (mismos nombres que `.env.example`) y agregá `USUARIO.github.io` en *Firebase → Authentication → Settings → Dominios autorizados*. Sin esos secrets el sitio corre en modo demo.

Para probar localmente como si estuviera en Pages: `VITE_BASE=/finix-center-web/ npm run build && npm run preview`.

## 4. Personalización rápida

- Textos, WhatsApp, horarios, tasas, planes, requisitos, sucursales y cotización USD: `src/config/business.js`
- Logo original: `src/assets/logo-finix.png` (versión blanca e isotipo incluidos). Recomendado reemplazar por un SVG vectorial para máxima nitidez.
- Colores y modo claro/oscuro: variables en `src/index.css` y `tailwind.config.js`
- Vista previa en un único archivo HTML (demo): `npm run build:preview` → `dist-preview/index.html`

## Notas

- Pendientes de completar en `business.js`: mail institucional y redes sociales.
- El simulador usa interés simple por período (6%, o 5% con Supermiércoles) según la maqueta de la app.
- Recuperación de contraseña: como los socios no usan un mail real, el enlace “¿Olvidaste tu contraseña?” deriva a WhatsApp; el colaborador/administrador restablece la clave desde la consola de Firebase o con `npm run seed -- socio ...`.
