# Actualizacion backend y base de datos - sismos PeruSis

Fecha de registro: 2026-06-09

Este documento resume lo ultimo que debe actualizarse en el backend y en la base de datos para que el frontend PeruSis consuma sismos de Peru y notificaciones realtime correctamente.

## Resultado de pruebas desde frontend

Variables actuales del frontend:

```env
VITE_PDGIBD=http://localhost:3000/api
VITE_SISMO_SOCKET_URL=http://localhost:3000
PDGIBD_FRONT_TOKEN=perusismico-dev-token
VITE_PDGIBD_FRONT_TOKEN=perusismico-dev-token
VITE_PDGIBD_TOKEN=perusismico-dev-token
VITE_IGP_SISMOS_GEOJSON_PATH=/igp-data/sismos-geojson
```

Pruebas realizadas:

- `GET http://localhost:3000/igp-data/sismos-geojson` responde `404`.
- `GET http://localhost:3000/api/igp-data/sismos-geojson` ya encuentra la ruta, pero responde `403 Invalid frontend token`.
- Socket.IO en `http://localhost:3000` conecta correctamente con `auth.token`.

Conclusion:

- La ruta HTTP correcta esta bajo prefijo global `/api`.
- El problema actual ya no es `404`; ahora es token invalido en backend.
- El frontend ya envia el token en `Authorization`, `x-pdgibd-token` y Socket.IO `auth.token`.

## Pendiente backend: token HTTP

El backend debe tener exactamente el mismo token:

```env
PDGIBD_FRONT_TOKEN=perusismico-dev-token
```

Revisar:

- Que el `.env` del backend realmente contenga `PDGIBD_FRONT_TOKEN`.
- Que `ConfigModule` este leyendo ese `.env`.
- Que el backend haya sido reiniciado despues de agregar la variable.
- Que no exista otro `.env` por entorno sobreescribiendo el valor.
- Que el guard compare contra `this.configService.get<string>('PDGIBD_FRONT_TOKEN')`.

Guard esperado:

```ts
const expectedToken = this.configService.get<string>('PDGIBD_FRONT_TOKEN');

const authorization = request.headers.authorization;
const bearerToken = authorization?.startsWith('Bearer ')
  ? authorization.slice('Bearer '.length).trim()
  : undefined;
const headerToken = request.headers['x-pdgibd-token'];
const token = bearerToken || (Array.isArray(headerToken) ? headerToken[0] : headerToken);

if (!expectedToken || token !== expectedToken) {
  throw new ForbiddenException('Invalid frontend token');
}
```

Para depurar sin exponer el token completo, loguear solo longitudes:

```ts
this.logger.debug({
  expectedTokenLength: expectedToken?.length ?? 0,
  receivedTokenLength: token?.length ?? 0,
});
```

Con el valor actual ambos deberian medir `21`.

## Pendiente backend: ruta IGP GeoJSON

El frontend consume:

```http
GET http://localhost:3000/api/igp-data/sismos-geojson
```

Controller esperado:

```ts
@Controller('igp-data')
@UseGuards(FrontTokenGuard)
export class IgpDataController {
  @Get('sismos-geojson')
  async getSismosGeoJson(@Query() query: GetSismosGeoJsonQueryDto) {
    return this.igpDataService.getSismosGeoJson(query);
  }
}
```

Si el backend tiene `app.setGlobalPrefix('api')`, la ruta final queda:

```http
/api/igp-data/sismos-geojson
```

## Pendiente backend: CORS

Permitir headers del frontend:

```ts
app.enableCors({
  origin: true,
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-pdgibd-token',
  ],
});
```

## Pendiente backend: Socket.IO

Socket.IO ya conecto desde el frontend con token, pero igual debe validarse en backend:

```ts
handleConnection(client: Socket) {
  const expectedToken = this.configService.get<string>('PDGIBD_FRONT_TOKEN');
  const token = client.handshake.auth?.token;

  if (!expectedToken || token !== expectedToken) {
    client.disconnect(true);
    return;
  }
}
```

El evento que el frontend escucha por defecto es:

```ts
earthquake.new
```

## Pendiente base de datos: coleccion de eventos sismicos

El webhook usa:

```ts
this.earthquakeModel.findOneAndUpdate(
  { identificador: dto.identificador },
  { $set: dto },
  { new: true, upsert: true },
);
```

Por eso la base de datos debe garantizar que `identificador` sea unico.

Indice requerido en MongoDB:

```js
db.earthquakeevents.createIndex(
  { identificador: 1 },
  { unique: true, background: true }
);
```

Si el nombre real de coleccion no es `earthquakeevents`, usar el nombre que Mongoose genero o el definido en el schema.

Antes de crear el indice unico, revisar duplicados:

```js
db.earthquakeevents.aggregate([
  { $group: { _id: "$identificador", count: { $sum: 1 }, ids: { $push: "$_id" } } },
  { $match: { count: { $gt: 1 } } },
]);
```

Si hay duplicados, consolidarlos antes del indice unico.

## Pendiente base de datos: indices de consulta

Para `findRecent()`:

```ts
.find().sort({ createdAt: -1 }).limit(limit)
```

Indice recomendado:

```js
db.earthquakeevents.createIndex(
  { createdAt: -1 },
  { background: true }
);
```

Para `findAll()`:

```ts
.find().sort({ fecha_hora: -1 })
```

Indice recomendado:

```js
db.earthquakeevents.createIndex(
  { fecha_hora: -1 },
  { background: true }
);
```

Si luego se filtra por mapa o rango desde base de datos, agregar indices:

```js
db.earthquakeevents.createIndex(
  { magnitud: 1, profundidad: 1, fecha_hora: -1 },
  { background: true }
);

db.earthquakeevents.createIndex(
  { latitud: 1, longitud: 1 },
  { background: true }
);
```

## Pendiente base de datos: tipos de datos

Confirmar que los documentos guarden estos campos con tipos consistentes:

```ts
identificador: string;
fecha_hora: Date | string;
latitud: number;
longitud: number;
magnitud: number;
profundidad: number;
referencia: string;
```

Si hoy existen documentos con numeros como string, normalizarlos. Ejemplo:

```js
db.earthquakeevents.find().forEach((doc) => {
  db.earthquakeevents.updateOne(
    { _id: doc._id },
    {
      $set: {
        latitud: Number(doc.latitud),
        longitud: Number(doc.longitud),
        magnitud: Number(doc.magnitud),
        profundidad: Number(doc.profundidad),
      },
    },
  );
});
```

Ejecutar la normalizacion solo si se confirma que esos campos estan guardados como string.

## Checklist para cerrar esta actualizacion

- Backend `.env`: `PDGIBD_FRONT_TOKEN` existe y coincide con `VITE_PDGIBD_FRONT_TOKEN`.
- Backend reiniciado despues de cambiar `.env`.
- `GET /api/igp-data/sismos-geojson` responde `200` con token correcto.
- `GET /api/igp-data/sismos-geojson` responde `403` con token incorrecto.
- Socket.IO conecta con token correcto y rechaza token incorrecto.
- Indice unico creado para `identificador`.
- Indices creados para `createdAt` y `fecha_hora`.
- Tipos de datos normalizados en documentos existentes.

## Politica de docs

Cada nueva actualizacion que requiera cambios en backend o base de datos debe registrarse en un `.md` nuevo dentro de `docs/`, separado del documento principal.
