# API IGP para sismos de Peru en GeoJSON

## Objetivo

Crear en el backend NestJS un endpoint que consuma la fuente oficial del IGP para sismos de Peru desde 2012 hasta el anio actual y entregue la respuesta en formato GeoJSON, listo para pintar en Leaflet.

La razon del cambio es que la data USGS no debe alimentar los puntos ubicados en Peru: para Peru se debe usar IGP, porque es la fuente oficial local y puede tener magnitudes distintas a USGS.

## Fuentes de datos

- IGP actual, desde 2012 hasta la actualidad:
  `https://ultimosismo.igp.gob.pe/api/ultimo-sismo/ajaxb/{year}`
- Historicos locales del frontend:
  - `public/datas/data_peru.csv`
  - `public/datas/historicos.csv`

No mover, sobrescribir ni reemplazar los CSV historicos. El nuevo endpoint del backend cubre la data IGP moderna desde 2012. Los historicos locales quedan para los filtros antiguos.

## Endpoints recomendados

Mantener el endpoint actual si ya se usa:

```ts
@Get('sismos/:year')
async getSismos(@Param('year') year: string) {
  return this.igpDataService.getSismos(year);
}
```

Agregar un endpoint GeoJSON para un anio:

```ts
@Get('sismos/:year/geojson')
async getSismosGeoJson(@Param('year') year: string) {
  return this.igpDataService.getSismosGeoJsonByYear(year);
}
```

Agregar un endpoint GeoJSON con filtros para el frontend:

```ts
@Get('sismos-geojson')
async getSismosGeoJson(@Query() query: GetSismosGeoJsonQueryDto) {
  return this.igpDataService.getSismosGeoJson(query);
}
```

Usar `sismos-geojson` evita conflictos con la ruta generica `sismos/:year`.

## Query DTO sugerido

```ts
export class GetSismosGeoJsonQueryDto {
  startYear?: string;      // default: 2012
  endYear?: string;        // default: anio actual
  startDate?: string;      // YYYY-MM-DD, opcional
  endDate?: string;        // YYYY-MM-DD, opcional
  minMagnitude?: string;   // ejemplo: 4
  maxMagnitude?: string;   // ejemplo: 9.5
  minDepth?: string;       // km
  maxDepth?: string;       // km
  minLatitude?: string;
  maxLatitude?: string;
  minLongitude?: string;
  maxLongitude?: string;
}
```

Validaciones:

- `startYear` y `endYear` no deben ser menores a 2012.
- `endYear` no debe ser mayor al anio actual del servidor.
- Si el rango de anios es invalido, responder `400 Bad Request`.
- Convertir filtros numericos con `Number()` y descartar registros con coordenadas no validas.

## Normalizacion de fecha y hora IGP

La respuesta IGP viene separada:

```json
{
  "fecha_local": "2026-01-01T00:00:00.000Z",
  "hora_local": "1970-01-01T05:20:25.000Z"
}
```

El backend debe construir `fechalocal` sin `Z`, para que represente hora local peruana y el frontend no la interprete como UTC:

```ts
private buildLocalDateTime(item: any): string | null {
  if (!item.fecha_local || !item.hora_local) return null;

  const datePart = String(item.fecha_local).split('T')[0];
  const timePart = String(item.hora_local).split('T')[1]?.replace('Z', '');

  return datePart && timePart ? `${datePart}T${timePart}` : null;
}
```

El metodo actual `getSismos(year)` puede quedarse devolviendo la data IGP normalizada con `fechalocal`.

## Conversion a GeoJSON

Cada sismo IGP debe convertirse a un `Feature`:

```ts
private toGeoJsonFeature(item: any): GeoJSON.Feature | null {
  const latitude = Number(item.latitud);
  const longitude = Number(item.longitud);
  const magnitude = Number(item.magnitud);
  const depth = Number(item.profundidad ?? 0);
  const fechalocal = this.buildLocalDateTime(item);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!Number.isFinite(magnitude)) return null;

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude, Number.isFinite(depth) ? depth : 0],
    },
    properties: {
      source: 'IGP',
      id: item.idlistasismos,
      codigo: item.codigo,
      mag: magnitude,
      magnitude,
      magType: item.tipomagnitud || 'IGP',
      depth: Number.isFinite(depth) ? depth : 0,
      place: item.referencia || '-',
      referencia: item.referencia,
      intensidad: item.intensidad || null,
      time: fechalocal,
      fechalocal,
      fecha_local: item.fecha_local,
      hora_local: item.hora_local,
      fecha_utc: item.fecha_utc,
      hora_utc: item.hora_utc,
      reporte_acelerometrico_pdf: item.reporte_acelerometrico_pdf || null,
      numero_reporte: item.numero_reporte ?? null,
    },
  };
}
```

La respuesta final:

```ts
return {
  type: 'FeatureCollection',
  metadata: {
    source: 'IGP',
    startYear,
    endYear,
    count: features.length,
  },
  features,
};
```

## Filtros a aplicar

Aplicar los filtros despues de convertir/normalizar:

- Magnitud: `properties.mag >= minMagnitude && properties.mag <= maxMagnitude`
- Profundidad: `properties.depth >= minDepth && properties.depth <= maxDepth`
- Fecha: usar `properties.fechalocal` o `properties.time`
- BBox: validar `lat/lon` contra `minLatitude`, `maxLatitude`, `minLongitude`, `maxLongitude`

Para Peru completo usar estos limites iniciales, que coinciden con el frontend:

```ts
const PERU_BOUNDS = {
  minLatitude: -18.35,
  maxLatitude: -0.03,
  minLongitude: -81.33,
  maxLongitude: -68.65,
};
```

Para departamentos, el frontend ya envia o usa sus propios limites por region.

## Servicio NestJS sugerido

```ts
async getSismosGeoJsonByYear(year: string) {
  const rows = await this.getSismos(year);
  const features = rows
    .map((item) => this.toGeoJsonFeature(item))
    .filter(Boolean);

  return {
    type: 'FeatureCollection',
    metadata: {
      source: 'IGP',
      year: Number(year),
      count: features.length,
    },
    features,
  };
}

async getSismosGeoJson(query: GetSismosGeoJsonQueryDto) {
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(Number(query.startYear ?? 2012), 2012);
  const endYear = Math.min(Number(query.endYear ?? currentYear), currentYear);

  if (!Number.isFinite(startYear) || !Number.isFinite(endYear) || startYear > endYear) {
    throw new BadRequestException('Rango de anios invalido');
  }

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => String(startYear + index),
  );

  const rowsByYear = await Promise.all(years.map((year) => this.getSismos(year)));
  const rows = rowsByYear.flat();

  let features = rows
    .map((item) => this.toGeoJsonFeature(item))
    .filter(Boolean);

  features = this.applyGeoJsonFilters(features, query);

  return {
    type: 'FeatureCollection',
    metadata: {
      source: 'IGP',
      startYear,
      endYear,
      count: features.length,
    },
    features,
  };
}
```

## Regla de separacion Peru vs Global

- Pestaña Peru: pintar sismos modernos desde el endpoint IGP GeoJSON.
- Pestaña Global: seguir usando USGS, pero no pintar eventos ubicados dentro de Peru.
- Historicos de Peru hasta 2011: seguir usando los CSV locales existentes.

Si en el futuro el backend tambien actua como proxy para USGS, debe filtrar Peru antes de responder al frontend.

## Ejemplo de consumo frontend

```ts
GET /igp-data/sismos-geojson?startYear=2012&endYear=2026&minMagnitude=4&maxMagnitude=9.5&minDepth=0&maxDepth=700&minLatitude=-18.35&maxLatitude=-0.03&minLongitude=-81.33&maxLongitude=-68.65
```

El frontend espera `FeatureCollection.features` con:

- `geometry.coordinates`: `[longitude, latitude, depth]`
- `properties.mag`
- `properties.depth`
- `properties.place`
- `properties.time`
- `properties.magType`

Con esos nombres, el mapa puede reutilizar la logica actual de pintado sin transformaciones grandes.

## Manejo de errores y cache

- Si IGP no responde, registrar el error con `Logger` y responder `502 Bad Gateway` o relanzar segun el estandar actual del backend.
- Usar cache por anio, porque la data antigua cambia poco.
- Para el anio actual, usar un TTL corto, por ejemplo 5 a 15 minutos.
- Para anios cerrados, usar un TTL largo, por ejemplo 24 horas.

## Pruebas minimas

- `getSismos(2026)` agrega `fechalocal` correctamente.
- `getSismosGeoJsonByYear(2026)` devuelve `FeatureCollection`.
- Registros sin latitud/longitud valida no entran en `features`.
- Filtro de magnitud excluye eventos fuera del rango.
- Filtro de profundidad respeta superficial/intermedio/profundo.
- Filtro bbox de Peru solo devuelve puntos dentro de los limites pedidos.

## Notificaciones realtime desde seismic-webhook

Ademas del consumo historico/GeoJSON, el backend puede recibir eventos nuevos por AWS SNS en:

```http
POST /seismic-webhook/earthquakes-webhook
```

Flujo esperado:

- AWS SNS llama al webhook publico.
- El controlador valida la firma SNS con `SnsValidatorService`.
- El controlador valida que `TopicArn` coincida con `EARTHQUAKES_TOPIC_ARN`.
- En `SubscriptionConfirmation`, el backend confirma `SubscribeURL`.
- En `Notification`, el backend parsea `body.Message` como `CreateEarthquakeEventDto`.
- `SeismicWebhookService.createOrUpdate(dto)` guarda o actualiza por `identificador`.
- Despues de persistir, `EventsGateway.sendEarthquakeNotification(payload)` emite el sismo a los clientes conectados.

El gateway debe emitir por Socket.IO un evento estable. El frontend queda escuchando por defecto:

```ts
earthquake.new
```

Ejemplo sugerido del gateway:

```ts
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  sendEarthquakeNotification(payload: Record<string, unknown>) {
    this.server.emit('earthquake.new', payload);
  }
}
```

Payload minimo esperado por el frontend:

```json
{
  "identificador": "2026-0609-0001",
  "fecha_hora": "2026-06-09T10:25:00.000Z",
  "latitud": -12.34,
  "longitud": -76.89,
  "magnitud": 5.4,
  "profundidad": 48,
  "referencia": "60 km al SO de Lima"
}
```

El frontend tambien acepta variantes equivalentes:

- Coordenadas: `latitud/longitud`, `latitude/longitude`, `lat/lon`, `lat/lng` o `geometry.coordinates`.
- Magnitud: `magnitud`, `magnitude` o `mag`.
- Profundidad: `profundidad`, `depth` o la tercera coordenada GeoJSON.
- Fecha: `fecha_hora`, `fechalocal`, `time` o `createdAt`.
- Referencia: `referencia`, `place` o `lugar`.

Variables de entorno del frontend:

```env
VITE_PDGIBD=http://localhost:3000/api
VITE_SISMO_SOCKET_URL=http://localhost:3000
PDGIBD_FRONT_TOKEN=perusismico-dev-token
VITE_PDGIBD_FRONT_TOKEN=perusismico-dev-token
VITE_PDGIBD_TOKEN=perusismico-dev-token
VITE_IGP_SISMOS_GEOJSON_PATH=/igp-data/sismos-geojson
VITE_SISMO_EVENT_NAMES=earthquake.new
VITE_SISMO_SOCKET_DEBUG=false
```

`VITE_PDGIBD` es la URL base HTTP del backend NestJS. Si el backend usa prefijo global `/api`, debe incluirse aqui. `VITE_SISMO_SOCKET_URL` queda separado porque Socket.IO suele montarse en la raiz del backend.

`VITE_PDGIBD_FRONT_TOKEN` se envia en HTTP como `Authorization: Bearer <token>` y `x-pdgibd-token`, y en Socket.IO como `socket.handshake.auth.token`. `VITE_PDGIBD_TOKEN` queda como alias compatible. `PDGIBD_FRONT_TOKEN` sin prefijo `VITE_` solo queda como referencia local; el navegador no puede leerlo directamente.

Si el websocket usa un origen distinto al backend HTTP, se puede sobreescribir solo para realtime con:

```env
VITE_SISMO_SOCKET_URL=http://localhost:3000
```

Si el gateway emite otro nombre de evento, agregarlo separado por coma:

```env
VITE_SISMO_EVENT_NAMES=earthquake.new,earthquake.notification
```

Comportamiento en PeruSis:

- `t-sismo-notificacion.vue` se conecta por Socket.IO al backend.
- Cuando llega un evento, muestra una alerta en la esquina superior derecha con magnitud, profundidad, epicentro, referencia y fecha.
- La alerta permanece visible 15 segundos, salvo que el usuario la cierre.
- El mapa (`t-map.vue`) dibuja una estrella temporal en el epicentro durante 30 segundos.
- Al hacer clic sobre la alerta, el mapa centra y hace zoom al epicentro, y abre el popup de la estrella.

Esto no reemplaza el consumo de `GET /igp-data/sismos-geojson`; las notificaciones son solo para eventos nuevos recibidos por webhook.

## Store frontend para fuentes de sismos

En el frontend conviene separar las fuentes en `dataStore`:

- `combinedData`: sismos historicos locales de Peru desde CSV (`data_peru.csv` + `historicos.csv`). Cubre la data local hasta 2011.
- `dataIgpPeru`: sismos modernos de Peru desde el backend IGP (`GET /igp-data/sismos-geojson`). Cubre desde 2012.
- `dataUSGS`: sismos globales desde USGS. No debe alimentar puntos dentro de Peru.
- `realtimeEarthquake`: ultimo sismo recibido por Socket.IO desde `seismic-webhook`.
- `realtimeFocusRequest`: solicitud para que el mapa centre el epicentro cuando se hace clic en la alerta.

Actions esperadas:

```js
fetchDataPeru()
```

Carga los CSV locales historicos y llena `combinedData`.

```js
fetchDataIgpPeru(params)
```

Consume:

```http
GET ${VITE_PDGIBD}/igp-data/sismos-geojson
```

con filtros:

- `startYear`, `endYear`
- `startDate`, `endDate`
- `minMagnitude`, `maxMagnitude`
- `minDepth`, `maxDepth`
- `minLatitude`, `maxLatitude`, `minLongitude`, `maxLongitude`

```js
fetchDataUSGS(params)
```

Consume USGS solo para modo Global.

Regla de pintado en `t-map.vue`:

- Si el rango termina antes de 2012, pintar solo `combinedData`.
- Si el rango toca 2012 o despues, pintar `combinedData` filtrado por fecha y combinarlo con `dataIgpPeru`.
- Si falla el backend IGP, mantener el CSV local como fallback para que PeruSis no quede en blanco.
- Los filtros de magnitud, profundidad, fechas y bbox se mandan al backend IGP y tambien se aplican al CSV historico.

La configuracion de token que debe implementar el backend esta en `docs/backend-token-sismos.md`.
