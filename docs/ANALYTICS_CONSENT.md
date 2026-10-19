# Medicion y consentimiento

18 de octubre de 2026. Trabajo de integracion de Codex coordinado con el backend
de OpenCode. Conserva Pixel 4440745886187242, GA G-PRVFVEYZXQ y GTM GTM-KS7MMJPS.

Antes no habia vinculacion entre aviso y scripts de index.html. Ahora los tres
proveedores solo se cargan al aceptar. Rechazar/cerrar no lee cookies de marketing
ni llama al backend de Meta. Preferencias de cookies en el pie permite cambiar
la decision, revocar eventos posteriores y eliminar cookies de marketing conocidas.
Los noscript de tracking se retiraron: no podian comprobar consentimiento.

PageView de la aplicacion usa una sola llamada por vista consecutiva, tambien
en StrictMode. Browser y futura API comparten eventID. Solo cuatro eventos
publicos: PageView, ViewContent, Contact e InitiateCheckout; no simula Purchase
ni Lead por un click. No guarda PII del formulario en localStorage.

## Conexion futura del backend

VITE_META_CONVERSIONS_URL es PUBLICA y solo admite el endpoint HTTPS
https://crm-readyin72.vercel.app/api/landing/meta-event. No poner claves en ella.
Mientras falte no se llama al endpoint Laravel retirado ni se afirma envio API.
Backend final de OpenCode integrado en el CRM (a905e4b), con 35 pruebas y SQL
remoto verificados; se comprueba publicacion por separado. La variable publica
sigue sin activar hasta cerrar la prueba real; el Pixel de navegador es independiente.

Contrato para OpenCode: POST application/json sin Authorization ni cookies.
{event, consent:true, source?, content_name?, content_category?, selectedPlan?,
 browser:{eventId,eventSourceUrl,fbp,fbc}}.
URL sin query/hash; sin IP/user-agent aportados por el body, ni contacto/credenciales.
Respuesta necesaria para confirmar el servidor: {ok:true,eventsReceived:1}.
Timeout 10 segundos, dando margen a Graph (5 s) y operaciones SQL del servidor.
Metadatos publicos acotados a los mismos limites del backend antes de enviar
a Pixel/Graph: source 60, content_name/category 100, selectedPlan 80.
Rechazo, fallo o respuesta incompleta => unconfirmed,
sin afectar formulario ni cambiar el ID por un reintento automatico.

## Evidencia y limites

14 pruebas aprobadas (11 de consentimiento y 3 del emisor comercial), build Vite
aprobado. No se hicieron envios de prueba reales a Meta ni se usaron secretos.
Falta validar con navegador real los eventos en Events Manager, asi como las
etiquetas internas del contenedor GTM: otro tag configurado alli podria duplicar
medicion y no puede certificarse inspeccionando solamente el codigo de la landing.
No equivale a certificacion legal de privacidad ni a cierre total del CRM.

Referencia oficial Google para carga basica tras consentimiento:
https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic
