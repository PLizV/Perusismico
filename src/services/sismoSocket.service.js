import { io } from "socket.io-client";

const DEFAULT_SOCKET_URL = "https://perusismico.igp.gob.pe";
const DEFAULT_SOCKET_PATH = "/pdig/api/socket.io";

function getViteEnv() {
  return import.meta.env || {};
}

function normalizeEnvUrl(value, fallback) {
  const url = String(value || "").trim().replace(/\/+$/, "");
  return url || fallback;
}

function normalizeSocketPath(value, fallback) {
  const path = String(value || "").trim() || fallback;
  return path.startsWith("/") ? path : `/${path}`;
}

function parseList(value, fallback) {
  const list = String(value || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return list.length ? list : String(fallback).split(",");
}

function getSocketUrl() {
  const env = getViteEnv();

  return normalizeEnvUrl(
    env.VITE_WS_URI || env.VITE_SISMO_SOCKET_URL,
    DEFAULT_SOCKET_URL
  );
}

function getSocketPath() {
  const env = getViteEnv();

  return normalizeSocketPath(
    env.VITE_WS_PATH || env.VITE_SISMO_SOCKET_PATH,
    DEFAULT_SOCKET_PATH
  );
}

function getSocketTransports() {
  const env = getViteEnv();
  const transports = parseList(
    env.VITE_WS_TRANSPORTS || env.VITE_SISMO_SOCKET_TRANSPORTS,
    "polling,websocket"
  );

  return transports.filter((transport) =>
    ["polling", "websocket"].includes(transport)
  );
}

function shouldUpgradeSocket(transports) {
  const env = getViteEnv();

  if (env.VITE_WS_UPGRADE === "false" || env.VITE_SISMO_SOCKET_UPGRADE === "false") {
    return false;
  }

  return transports.includes("websocket");
}

function getSecurityToken() {
  return String(
    import.meta.env.VITE_PDGIBD_FRONT_TOKEN ||
      import.meta.env.VITE_PDGIBD_TOKEN ||
      ""
  ).trim();
}

export function isSismoSocketDebugEnabled() {
  return import.meta.env.VITE_SISMO_SOCKET_DEBUG === "true";
}

export function getSismoSocketConfig() {
  const events = (
    import.meta.env.VITE_SISMO_EVENT_NAMES ||
    "earthquake.new,earthquake.notification,earthquake"
  )
    .split(",")
    .map((eventName) => eventName.trim())
    .filter(Boolean);
  const transports = getSocketTransports();

  return {
    url: getSocketUrl(),
    path: getSocketPath(),
    transports,
    upgrade: shouldUpgradeSocket(transports),
    events,
    token: getSecurityToken(),
    debug: isSismoSocketDebugEnabled(),
  };
}

export function createSismoRealtimeSocket({ onEarthquake, onAnyEvent } = {}) {
  const config = getSismoSocketConfig();

  console.info("[sismos] Config socket usada:", {
    url: config.url,
    path: config.path,
    transports: config.transports,
    upgrade: config.upgrade,
  });

  const auth = config.token
    ? {
        token: config.token,
        pdgibdToken: config.token,
      }
    : undefined;

  const socket = io(config.url, {
    path: config.path,
    withCredentials: true,
    transports: config.transports,
    upgrade: config.upgrade,
    forceNew: true,
    multiplex: false,
    auth,
  });

  socket.on("connect", () => {
    console.info("[sismos] Socket conectado:", {
      id: socket.id,
      url: config.url,
      path: config.path,
    });
  });

  socket.on("connect_error", (error) => {
    console.error("[sismos] Error de conexión Socket.IO:", error?.message || error, {
      url: config.url,
      path: config.path,
    });
  });

  socket.on("disconnect", (reason) => {
    if (config.debug) {
      console.warn("[sismos] Socket desconectado:", reason);
    }
  });

  if (typeof onAnyEvent === "function") {
    socket.onAny(onAnyEvent);
  }

  if (typeof onEarthquake === "function") {
    config.events.forEach((eventName) => {
      socket.on(eventName, onEarthquake);
    });
  }

  function cleanup() {
    if (typeof onAnyEvent === "function") {
      socket.offAny(onAnyEvent);
    }

    if (typeof onEarthquake === "function") {
      config.events.forEach((eventName) => {
        socket.off(eventName, onEarthquake);
      });
    }

    socket.off("connect");
    socket.off("connect_error");
    socket.off("disconnect");
    socket.disconnect();
  }

  return {
    socket,
    cleanup,
    config,
  };
}
