<template>
  <Teleport to="body">
    <Transition name="quake-toast">
      <section v-if="visible && lastQuake" class="quake-toast" role="status" aria-live="polite">
        <button class="quake-toast__main" type="button" aria-label="Centrar mapa en el epicentro"
          @click="focusEpicenter">
          <div class="quake-toast__icon" aria-hidden="true">
            <img :src="alertIcon" alt="" />
          </div>

          <div class="quake-toast__content">
            <p class="quake-toast__eyebrow">Alerta sísmica</p>
            <h2>Ocurrió un sismo</h2>

            <div class="quake-toast__grid">
              <span>
                <strong>Magnitud</strong>
                {{ magnitudeLabel }}
              </span>
              <span>
                <strong>Profundidad</strong>
                {{ depthLabel }}
              </span>
              <span v-if="coordinatesLabel" class="quake-toast__grid-item--wide">
                <strong>Epicentro</strong>
                {{ coordinatesLabel }}
              </span>
            </div>

            <p v-if="lastQuake.referencia" class="quake-toast__reference">
              {{ lastQuake.referencia }}
            </p>

            <p class="quake-toast__time">{{ formattedDate }}</p>
          </div>
        </button>

        <button class="quake-toast__close" type="button" aria-label="Cerrar notificación de sismo"
          @click.stop="dismiss">
          x
        </button>
      </section>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import alertIcon from "@/assets/icons/alerta.svg";
import { useDataStore } from "@/stores/data";
import {
  createSismoRealtimeSocket,
  isSismoSocketDebugEnabled,
} from "@/services/sismoSocket.service";

const dataStore = useDataStore();

const lastQuake = ref(null);
const visible = ref(false);

let cleanupSocket = null;
let hideTimer = null;

const shouldDebugSocket = isSismoSocketDebugEnabled();

const magnitudeLabel = computed(() => {
  const value = lastQuake.value?.magnitud ?? lastQuake.value?.magnitude;
  return value === undefined || value === null ? "No disponible" : value;
});

const depthLabel = computed(() => {
  const value = lastQuake.value?.profundidad ?? lastQuake.value?.depth;

  return value === undefined || value === null
    ? "No disponible"
    : `${value} km`;
});

const coordinatesLabel = computed(() => {
  const lat = lastQuake.value?.latitud;
  const lon = lastQuake.value?.longitud;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "";
  }

  return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
});

const formattedDate = computed(() => {
  const value = lastQuake.value?.fecha_hora;

  if (!value) {
    return "Fecha no disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
});

function numberOrNull(...values) {
  for (const value of values) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
}

function normalizeEarthquakePayload(data) {
  const payload = data?.payload || data?.data || data || {};
  const coordinates = payload.geometry?.coordinates;

  const latitude = numberOrNull(
    payload.latitud,
    payload.latitude,
    payload.lat,
    Array.isArray(coordinates) ? coordinates[1] : undefined
  );

  const longitude = numberOrNull(
    payload.longitud,
    payload.longitude,
    payload.lon,
    payload.lng,
    Array.isArray(coordinates) ? coordinates[0] : undefined
  );

  const depth = numberOrNull(
    payload.profundidad,
    payload.depth,
    Array.isArray(coordinates) ? coordinates[2] : undefined
  );

  return {
    ...payload,
    latitud: latitude,
    longitud: longitude,
    magnitud: payload.magnitud ?? payload.magnitude ?? payload.mag,
    profundidad: depth,
    referencia: payload.referencia ?? payload.place ?? payload.lugar,
    fecha_hora:
      payload.fecha_hora ??
      payload.fechalocal ??
      payload.time ??
      payload.createdAt,
  };
}

function showNotification(data) {
  const earthquake = normalizeEarthquakePayload(data);

  lastQuake.value = earthquake;
  visible.value = true;

  dataStore.setRealtimeEarthquake(earthquake);

  window.clearTimeout(hideTimer);

  hideTimer = window.setTimeout(() => {
    visible.value = false;
  }, 15000);
}

function dismiss() {
  visible.value = false;
  window.clearTimeout(hideTimer);
}

function logRealtimeEvent(eventName, ...payload) {
  if (shouldDebugSocket) {
    console.log("[sismos] evento recibido:", eventName, ...payload);
  }
}

function handleNewEarthquake(data) {
  showNotification(data);
}

function focusEpicenter() {
  if (!lastQuake.value) return;

  dataStore.focusRealtimeEarthquake(lastQuake.value);
}

onMounted(() => {
  const realtimeSocket = createSismoRealtimeSocket({
    onEarthquake: handleNewEarthquake,
    onAnyEvent: logRealtimeEvent,
  });

  cleanupSocket = realtimeSocket.cleanup;
});

onUnmounted(() => {
  window.clearTimeout(hideTimer);

  if (typeof cleanupSocket === "function") {
    cleanupSocket();
    cleanupSocket = null;
  }
});
</script>

<style scoped>
.quake-toast {
  align-items: flex-start;
  background: #ffffff;
  border: 1px solid rgba(255, 149, 0, 0.25);
  border-left: 5px solid #ff9500;
  border-radius: 8px;
  box-shadow: 0 18px 45px rgba(0, 13, 32, 0.22);
  color: #262626;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 1fr) auto;
  max-width: min(420px, calc(100vw - 2rem));
  padding: 1rem;
  position: fixed;
  right: 1rem;
  top: 5.25rem;
  width: 420px;
  z-index: 9999;
}

.quake-toast__main:focus-visible {
  outline: 3px solid rgba(51, 136, 255, 0.45);
  outline-offset: 3px;
}

.quake-toast__main {
  align-items: flex-start;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: auto minmax(0, 1fr);
  min-width: 0;
  padding: 0;
  text-align: left;
}

.quake-toast__icon {
  align-items: center;
  background: rgba(255, 149, 0, 0.1);
  border-radius: 999px;
  display: flex;
  height: 2.5rem;
  justify-content: center;
  width: 2.5rem;
}

.quake-toast__icon img {
  height: 1.5rem;
  width: 1.5rem;
}

.quake-toast__content {
  min-width: 0;
}

.quake-toast__eyebrow {
  color: #ff6a00;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.quake-toast h2 {
  color: #00214f;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 0;
}

.quake-toast__grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 0.75rem;
}

.quake-toast__grid span {
  background: #f6f6f7;
  border-radius: 6px;
  color: #333333;
  font-size: 0.8rem;
  line-height: 1.25;
  min-width: 0;
  padding: 0.55rem 0.65rem;
}

.quake-toast__grid strong {
  color: #656565;
  display: block;
  font-size: 0.64rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.quake-toast__grid-item--wide {
  grid-column: 1 / -1;
}

.quake-toast__reference {
  color: #333333;
  font-size: 0.86rem;
  line-height: 1.4;
  margin: 0.75rem 0 0;
  overflow-wrap: anywhere;
}

.quake-toast__time {
  color: #656565;
  font-size: 0.76rem;
  line-height: 1.3;
  margin: 0.35rem 0 0;
}

.quake-toast__close {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 999px;
  color: #656565;
  cursor: pointer;
  display: flex;
  font-size: 0.9rem;
  font-weight: 700;
  height: 1.75rem;
  justify-content: center;
  line-height: 1;
  padding: 0;
  width: 1.75rem;
}

.quake-toast__close:hover,
.quake-toast__close:focus-visible {
  background: #f6f6f7;
  color: #00214f;
  outline: none;
}

.quake-toast-enter-active,
.quake-toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.quake-toast-enter-from,
.quake-toast-leave-to {
  opacity: 0;
  transform: translate3d(1rem, -0.5rem, 0);
}

@media (max-width: 640px) {
  .quake-toast {
    grid-template-columns: minmax(0, 1fr) auto;
    right: 0.75rem;
    top: 4.5rem;
    width: calc(100vw - 1.5rem);
  }

  .quake-toast__grid {
    grid-template-columns: 1fr;
  }
}
</style>
