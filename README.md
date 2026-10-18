# Armonia Digital

Fuente independiente de la landing. Proyecto Vercel `landing-armoniadigital`, equipo `armonia-ready-team`. Produccion temporal: https://landing-armoniadigital.vercel.app.

## Desarrollo y verificacion

```sh
npm ci
npm run dev
node --test tests/lead-sender.test.mjs
npm run build
```

## Publicacion

La rama `main` esta conectada al proyecto homonimo de Vercel. Cada push debe generar un despliegue; comprobar Ready antes de darlo por publicado. No conectar este repositorio al proyecto del CRM ni al de la otra marca.

Los formularios activos usan el endpoint publico del CRM, sin clave secreta en el navegador. Solo muestran confirmacion tras un recibo 202 valido; solicitudes de pago no equivalen a pago recibido. Reintentos conservan UUID/cuerpo. El agendamiento se completa en el calendario configurado, no en un simulador de disponibilidad.

No subir archivos .env, credenciales, node_modules ni datos de clientes. Los dominios propios y el correo de Namecheap no se cambian por hacer push. La configuracion DNS se migrara en un paso separado conservando MX y registros del correo.
