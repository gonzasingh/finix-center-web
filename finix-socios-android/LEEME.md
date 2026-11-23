# FINIX Center · App Android del portal de socios

Es el **portal del socio** de tu web (login con DNI + contraseña, inicio, créditos, estado de cuenta, simulador, solicitudes, avisos, perfil, requisitos, sucursales, atención y quiénes somos) empaquetado como app Android, con **el mismo diseño de la web** y **conectado a los servidores reales de FINIX**: la misma API AdmCloud que usa tu app anterior (`com.finix.center`).

- Paquete: `com.finix.center` · `targetSdk 36` (lo que Google Play exige hoy) · `minSdk 24`
- Tecnología: React + Tailwind + Capacitor 8
- **Ya no usa Firebase.** Los datos salen de la API de FINIX (`http://nuevo.mine.nu/admcloud-api/api/`, empresa `FINIX`), que se extrajo del APK que me pasaste.

## Qué datos reales muestra

| Pantalla | Dato real | Endpoint de la API |
|---|---|---|
| Ingreso | DNI + contraseña del socio (token Bearer) | `ClienteAuth/login` |
| Inicio / Mis créditos | Saldo, cuota, plan, avance, “Con atraso” | `ClienteCuenta/creditos` |
| Estado de cuenta | Próximo vencimiento + historial de movimientos (pagos, tickets, intereses…) | `ClienteCuenta/estado-cuenta/{idVenta}` |
| Mis solicitudes / Detalle | Estado, observaciones y línea de tiempo | `ClienteSolicitudes/mis-solicitudes`, `crm/solicitudes/{id}/detalle` |
| Avisos | Notificaciones del servidor (leídas / no leídas) | `ClienteNotificaciones` (+ `/leer`, `/leer-todas`) |
| Perfil | Nombre, DNI, dirección, teléfono, correo, empresa | `ClientePerfil` |
| Cambiar contraseña | — | `ClienteAuth/cambiar-password` |
| Nueva solicitud (desde el simulador) | Se envía con tus datos de perfil | `Publico/solicitudes` |
| Atención | WhatsApp, correo y horarios de la empresa (si el servidor los informa) | `Empresa/FINIX` |

## Cosas que tenés que saber (importante)

1. **Todavía no la pude probar contra tu servidor real.** Desde mi entorno no se puede llegar a `nuevo.mine.nu`. La probé de punta a punta contra un servidor simulado que respeta exactamente los endpoints y campos que saqué de tu APK (login, créditos, estado de cuenta, solicitudes, avisos, perfil, errores de red y sesión vencida). **Antes de publicar, probala en un celular real con un socio real** (Prueba interna de Play Console). Si algún dato sale vacío o distinto, avisame qué pantalla y pasame lo que ves: es un ajuste de una línea en `src/services/apiProvider.js`.
2. **La API responde por `http://` (sin cifrar).** Android bloquea eso por defecto; la app lo permite **solo** para `nuevo.mine.nu` (`android/app/src/main/res/xml/network_security_config.xml`). El DNI y la contraseña viajan sin cifrar, igual que en tu app anterior. Te recomiendo ponerle HTTPS al servidor; cuando lo tenga: definí `VITE_API_BASE_URL=https://nuevo.mine.nu/admcloud-api/api/` (ver `.env.example`) y borrá el bloque `<domain-config>` de ese XML. En la ficha **Seguridad de los datos** de Play Console declará que los datos **no** se cifran en tránsito mientras siga en http.
3. **Estado de cuenta:** la API no entrega un cronograma de cuotas, así que la app muestra lo que sí informa el servidor (próximo vencimiento, importe de cuota y movimientos) en vez de inventar fechas.
4. **Simulador:** usa las tasas del diseño de la web (`src/config/business.js`), no las del servidor. Al enviar la solicitud se usa el plan del servidor (Semanal / Quincenal / Mensual).
5. **No incluido** (no estaba en el portal de socios de la web): banners y publicidad que el servidor envía a la app anterior.
6. La sesión se guarda en el almacenamiento privado de la app y se cierra sola cuando el servidor la vence (la app avisa “La sesión expiró”).

---

## Rápido: APK para instalar y probar en tu celular (sin keystore)

Para tener ya un `.apk` instalable, sin cargar ningún secret:

1. Subí esta carpeta a un repositorio **privado** de GitHub (ver Opción A, paso 1).
2. Pestaña **Actions → "Generar APK instalable (para probar en el celular)" → Run workflow** → tipo **debug** → *Run workflow*. Tarda unos 6–10 minutos.
3. Entrá a la ejecución y bajá el archivo **`finix-center-apk-debug`** (adentro está `finix-center-debug.apk`).
4. Pasalo al celular, abrilo y aceptá *“instalar apps de orígenes desconocidos”* cuando Android lo pida. Ingresá con el DNI y la contraseña de un socio real.

Notas:
- El APK **debug** está firmado con una clave de prueba: **sirve para probar, no para subir a Play Console** (para eso usá el AAB de la Opción A).
- Si en el celular ya tenés instalada tu app anterior (`com.finix.center`), Android no deja instalar encima una con otra firma: **desinstalala primero**.
- Si querés un APK firmado con tu propio keystore, ejecutá el mismo workflow con tipo **release** (usa los 4 secrets de abajo).

---

## Lo que necesitás tener a mano: tu keystore

El archivo `.jks`/`.keystore` con el que firmaste el AAB anterior (certificado `CN=Jose, OU=Adm`, alias probable `ADMCLOUD`), huella SHA-256:
`69:1C:5B:6E:02:2A:F5:DC:9A:81:3D:2C:9B:71:B8:A8:5C:2A:2F:C1:3F:D8:1F:DD:E8:8C:B1:8C:43:A5:21:17`
Si firmás con ese mismo keystore, Play Console acepta el AAB como actualización de tu app sin ningún trámite. El workflow te avisa si el keystore cargado no coincide. ¿No lo tenés? Mirá *"Si no tenés el keystore"* al final.

**Ya no hace falta cargar ningún dato de Firebase.** (El keystore solo es necesario para el AAB de Play Console o el APK *release*; el APK *debug* no lo necesita.)

---

## Opción A (recomendada): generar el AAB en GitHub, sin instalar nada

1. Creá un repositorio **privado** en GitHub (ej. `finix-socios-android`) y subí **todo el contenido de esta carpeta** (el `.gitignore` deja afuera lo que no debe subirse).
2. En el repo: **Settings → Secrets and variables → Actions → New repository secret**. Creá estos 4:

| Secret | Valor |
|---|---|
| `FINIX_KEYSTORE_BASE64` | tu keystore convertido a texto (ver abajo) |
| `FINIX_KEYSTORE_PASSWORD` | contraseña del keystore |
| `FINIX_KEY_ALIAS` | alias de la clave (ej. `ADMCLOUD`) |
| `FINIX_KEY_PASSWORD` | contraseña de la clave (suele ser igual a la del keystore) |

   **Convertir el keystore a texto:**
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\tu-keystore.jks")) | Set-Clipboard` y pegás con Ctrl+V.
   - Mac/Linux: `base64 -w0 tu-keystore.jks` (en Mac: `base64 -i tu-keystore.jks`).

3. Pestaña **Actions → "Generar AAB firmado (Google Play)" → Run workflow**. Tarda unos 6–10 minutos.
4. Al terminar, entrá a la ejecución y bajá el archivo **`finix-center-aab`** (adentro está `app-release.aab`). En el resumen ves el `versionCode` usado y la huella del keystore.
5. En **Google Play Console** → tu app → *Prueba interna* (para probarla primero) o *Producción* → **Crear versión** → subí el `.aab` → notas de la versión → **Revisar y publicar**.

Cada ejecución genera un `versionCode` nuevo y mayor automáticamente (tu AAB anterior usaba 3; este arranca en 101).

---

## Opción B: compilar en tu PC con Android Studio

Requisitos: Node 22+, Android Studio (con JDK 21) y el SDK de Android 36.

```bash
npm install
npm run android:sync                      # compila la web y la copia al proyecto Android
```

Creá `android/keystore.properties` (no se sube a GitHub):

```properties
storeFile=C:/ruta/completa/tu-keystore.jks
storePassword=TU_CLAVE
keyAlias=ADMCLOUD
keyPassword=TU_CLAVE
```

Después: `npm run android:open` y en Android Studio **Build → Generate Signed App Bundle** (o `cd android && ./gradlew bundleRelease -PfinixVersionCode=101`).
El AAB queda en `android/app/build/outputs/bundle/release/app-release.aab`.

---

## Probarla antes de subirla

- En el navegador, con datos de ejemplo (sin servidor): `npm install && npm run dev` → DNI `38492615`, clave `demo1234`. El modo demo **nunca** entra en el AAB de producción.
- En un celular real: generá el AAB, subilo a **Prueba interna** en Play Console, instalá desde el enlace de prueba e ingresá con el DNI y la contraseña de un socio real.

## Qué debe estar listo en Play Console

- **Política de privacidad (URL)**: obligatoria (la app maneja DNI, dirección, teléfono y datos de créditos).
- **Acceso a la app**: cargá un **DNI y contraseña de prueba** para el revisor de Google (una cuenta de socio de prueba, no una real).
- **Seguridad de los datos**, **clasificación de contenido** y **público objetivo**.
- Ícono de la ficha (512×512): `assets/play-store-icon-512.png`.

## Cómo se comporta la app

- Botón **Atrás** de Android: retrocede dentro del portal, cierra ventanas emergentes y, desde Inicio, sale de la app.
- Al volver a abrir la app desde segundo plano se actualizan los datos.
- Los enlaces externos (WhatsApp, llamadas, mapas) se abren con la app del teléfono.
- No se guardan datos financieros en caché local: sin conexión muestra un aviso en vez de datos viejos.

## Si algo no anda

| Síntoma | Causa probable |
|---|---|
| “Sin conexión con el servidor” en un celular con internet | El servidor `nuevo.mine.nu` está caído o cambió de dirección/puerto. Probá abrir `http://nuevo.mine.nu/admcloud-api/api/Empresa/FINIX` en el navegador del celular. |
| “Documento o contraseña incorrectos” con datos correctos | Es la respuesta del servidor: revisá el DNI/clave en el sistema AdmCloud. La app envía el DNI sin puntos ni espacios. |
| Datos vacíos o faltantes en alguna pantalla | Los nombres de campo de esa respuesta difieren de lo esperado: ajustar `src/services/apiProvider.js` (funciones `mapCredit`, `mapRequest`, etc.). |
| La app “no conecta” solo después de pasar el servidor a otro dominio http | Agregá ese dominio en `network_security_config.xml`. |
| Play rechaza el AAB: “versionCode ya usado” | Volvé a ejecutar el workflow (cada ejecución sube el número). |
| Play rechaza el AAB: “clave de firma distinta” | Ver la siguiente sección. |

## Si no tenés el keystore

Sin la clave original, Google no acepta actualizaciones firmadas con otra. Tenés dos caminos:

1. **Solicitar el restablecimiento de la clave de carga** (recomendado): creá un keystore nuevo (`keytool -genkeypair -v -keystore finix-upload.jks -alias finix -keyalg RSA -keysize 2048 -validity 10000`), exportá su certificado (`keytool -export -rfc -keystore finix-upload.jks -alias finix -file upload_certificate.pem`) y en Play Console → *Integridad de la app → Firma de apps de Play → Solicitar restablecimiento de la clave de carga* (el nombre exacto del menú puede variar) subí el `.pem`. Google tarda algunos días en habilitarla.
2. Publicar como app nueva con otro nombre de paquete (cambiar `appId` en `capacitor.config.json` y `applicationId`/`namespace` en `android/app/build.gradle`, y mover `MainActivity.java` a la nueva carpeta).

Guardá el keystore y sus contraseñas en un lugar seguro (no en el repositorio): sin ellos no podés actualizar la app.
