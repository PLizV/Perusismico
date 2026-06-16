# Token de seguridad para consumo de sismos

Este documento es para aplicar en el backend NestJS.

El frontend PeruSis envia un token en cada consumo del backend usando:

- Header `Authorization: Bearer <token>`
- Header `x-pdgibd-token: <token>`
- Socket.IO auth: `socket.handshake.auth.token`

En el frontend el token esta en:

```env
VITE_PDGIBD_FRONT_TOKEN=perusismico-dev-token
```

En el backend debe existir el mismo valor en una variable privada:

```env
PDGIBD_FRONT_TOKEN=perusismico-dev-token
```

Importante: todo valor `VITE_*` queda visible en el navegador. Este token sirve como una barrera simple para evitar consumos accidentales o no esperados, pero no reemplaza autenticacion real de usuarios ni reglas de red.

## Ruta requerida

El frontend consume:

```http
GET ${VITE_PDGIBD}/igp-data/sismos-geojson
```

Ejemplo actual:

```http
GET http://localhost:3000/api/igp-data/sismos-geojson
```

Si el backend usa prefijo global `/api`, configurar el frontend asi:

```env
VITE_PDGIBD=http://localhost:3000/api
VITE_SISMO_SOCKET_URL=http://localhost:3000
```

`VITE_PDGIBD` es para HTTP. `VITE_SISMO_SOCKET_URL` queda separado porque Socket.IO normalmente se conecta contra la raiz del backend, no contra `/api`.

Si el controller usa otra ruta, ajustar:

```env
VITE_IGP_SISMOS_GEOJSON_PATH=/igp-data/sismos-geojson
```

El error `404 Not Found` significa que la ruta no existe en el backend con esa URL exacta. El token no corrige un 404; primero debe existir el controller/ruta.

## Guard HTTP para token

Crear un guard, por ejemplo:

```ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class FrontTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
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

    return true;
  }
}
```

Usarlo en el controller IGP:

```ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FrontTokenGuard } from '../common/guards/front-token.guard';

@Controller('igp-data')
@UseGuards(FrontTokenGuard)
export class IgpDataController {
  @Get('sismos-geojson')
  async getSismosGeoJson(@Query() query: GetSismosGeoJsonQueryDto) {
    return this.igpDataService.getSismosGeoJson(query);
  }
}
```

## CORS

Permitir los headers enviados por el frontend:

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

## Socket.IO

El frontend envia el token en:

```ts
socket.handshake.auth.token
```

Validarlo en el gateway:

```ts
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: true,
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly configService: ConfigService) {}

  handleConnection(client: Socket) {
    const expectedToken = this.configService.get<string>('PDGIBD_FRONT_TOKEN');
    const token = client.handshake.auth?.token;

    if (!expectedToken || token !== expectedToken) {
      client.disconnect(true);
      return;
    }
  }

  sendEarthquakeNotification(payload: Record<string, unknown>) {
    this.server.emit('earthquake.new', payload);
  }
}
```

## Checklist backend

- Crear `PDGIBD_FRONT_TOKEN` con el mismo valor que `VITE_PDGIBD_FRONT_TOKEN`.
- Confirmar que exista `GET /igp-data/sismos-geojson`.
- Si existe prefijo global `/api`, el endpoint real sera `/api/igp-data/sismos-geojson`.
- Aplicar `FrontTokenGuard` al controller IGP.
- Permitir `Authorization` y `x-pdgibd-token` en CORS.
- Validar `socket.handshake.auth.token` en `EventsGateway`.
