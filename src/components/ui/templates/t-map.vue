<template>
  <div class="relative">
    <div v-if="noDataMessage"
      class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-[99999999]">
      <div class="text-center flex flex-col items-center justify-center">
        <p style="color: #3388ff" class="text-lg font-semibold">
          No se han registrado sismos en esta área según los parámetros ingresados
        </p>
        <div class="no-data-message"></div>
      </div>
    </div>

    <div class="overflow-hidden inset-0 bg-cover absolute top-0 left-0 w-full h-screen z-1" id="map">
      <div v-if="isLoading"
        class="rounded-md absolute z-[99999999] bg-white bg-opacity-50 inset-0 flex items-center justify-center">
        <div class="text-center flex flex-col items-center justify-center">
          <p style="color: #3388ff" class="text-lg font-semibold">Cargando...</p>
          <div class="loader"></div>
        </div>
      </div>
    </div>

    <!-- Overlay SVG tal cual lo tenías -->
    <svg id="overlay-svg" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg"
      style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;">
      <path class="leaflet-interactive" stroke="#3388ff" stroke-opacity="1" stroke-width="3" stroke-linecap="round"
        stroke-linejoin="round" fill="#3388ff" fill-opacity="0.2" fill-rule="evenodd"
        d="M1118 422L1108 422L1106 424L1105 429L1101 430L1097 434L1095 442L1092 445L1093 448L1091 450L1090 449L1079 454L1075 458L1076 461L1072 465L1073 468L1077 470L1077 472L1074 473L1077 476L1078 473L1080 475L1079 480L1081 480L1085 486L1085 494L1087 494L1086 495L1089 498L1089 500L1092 502L1091 507L1092 506L1092 510L1095 515L1094 518L1098 522L1100 528L1107 537L1106 538L1108 540L1109 538L1113 538L1111 534L1113 532L1113 526L1120 528L1120 530L1116 532L1114 538L1116 536L1120 536L1118 538L1122 540L1121 548L1124 545L1130 545L1130 542L1135 537L1139 537L1140 532L1145 527L1147 527L1148 524L1152 524L1151 517L1153 517L1156 514L1156 510L1152 500L1150 498L1148 500L1145 495L1150 490L1150 486L1154 478L1155 477L1155 479L1158 482L1160 480L1160 476L1157 471L1150 469L1146 465L1144 465L1141 460L1140 461L1140 457L1136 453L1136 449L1134 449L1135 446L1131 442L1129 442L1126 433L1123 430L1121 430L1122 427L1120 427L1118 422z" />
    </svg>
  </div>
</template>

<script>
import axios from "axios";
import * as L from "leaflet/dist/leaflet-src.js";
import "leaflet/dist/leaflet.css";
import { useGeojsonStore } from "@/stores/geojson.js";
import { useDataStore } from "@/stores/data";
import { useConfigStore } from "@/stores/config";

const PERU_BOUNDS = {
  minLatitude: -18.35,
  maxLatitude: -0.03,
  minLongitude: -81.33,
  maxLongitude: -68.65,
};

export default {
  data() {
    return {
      isLoading: true,
      map: null,
      earthquakeRenderer: null,
      platesLayerGroup: null,
      useGeojson: useGeojsonStore(),
      dataStore: useDataStore(),
      configStore: useConfigStore(),
      initialCenter: [-9.3, -75.0],
      initialZoom: 1,
      initialLatLeng: null,
      setminzoom: null,
      setData: null,
      csvLayer: null,
      flashInterval: null,
      sumarProf: 0,
      intervalId: null,
      isGeoJSONProcessing: false,
      geoJSONLayerCapaDepartamento: null,
      noDataMessage: null,
      realtimeEpicenterMarker: null,
      realtimeEpicenterTimer: null,
      peruRefreshTimer: null,
      peruDataRequestId: 0,
      globalDataRequestId: 0,
      previousZoom: null,
      isMapZooming: false,
      entryAnimationMarkers: [],
    };
  },

  mounted() {
    const attribution = '&copy; <a href="httpS://osm.org/copyright">OpenStreetMap</a> contributors';

    //  const terreno = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", { attribution });
    const google = L.tileLayer("https://mt1.google.com/vt/lyrs=m@113&hl=en&&x={x}&y={y}&z={z}", { attribution });
    const openstreet = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution });
    const satelital = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community" }
    );
    const luzNotable = L.tileLayer("https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", { attribution });
    const viajero = L.tileLayer("https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png", { attribution });
    const gris = L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { attribution });
    const workstreet = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
    });
    const worktopo = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong)"
    });

    //  const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
    //    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //  });

    //const esriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    // { attribution: 'Tiles © Esri & contributors'});

    const workstreetVivo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri, etc.', maxNativeZoom: 19, maxZoom: 20, className: 'vivo' });

    const delimitaciones = L.tileLayer("https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { attribution });

    const windowWidth = window.innerWidth;
    if (windowWidth <= 600) {
      this.initialZoom = 4;
      this.setminzoom = 2;
      this.initialLatLeng = [-9.5, -76.0];
    } else if (windowWidth <= 1920) {
      this.setminzoom = 2;
      this.initialZoom = 6;
      this.initialLatLeng = [-9.3, -75.0];
    } else {
      this.setminzoom = 3;
      this.initialZoom = 6;
      this.initialLatLeng = [-9.3, -75.0];
    }

    const southWest = L.latLng(-90, -720);
    const northEast = L.latLng(90, 720);
    const bounds = L.latLngBounds(southWest, northEast);

    this.map = L.map("map", {
      minZoom: this.setminzoom,
      maxZoom: 19,
      center: this.initialLatLeng,
      zoom: this.initialZoom,
      layers: [workstreetVivo],
      preferCanvas: false,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      markerZoomAnimation: false,
    });

    this.map.removeControl(this.map.zoomControl);
    L.control.zoom({ position: "bottomright" }).addTo(this.map);
    this.earthquakeRenderer = L.canvas({ padding: 0.5 });
    this.map.on("zoomstart", this.handleMapZoomStart);
    this.map.on("zoomend", this.handleMapZoomEnd);
    L.control.layers(
      {
        Satélite: satelital,
        //   Terreno: terreno,
        "Google maps": google,
        OpenStreetMap: openstreet,
        "Luz Notable": luzNotable,
        "Lona gris claro": gris,
        Viajero: viajero,
        Workstreet: workstreet,
        WorkTopography: worktopo,
        // Noche: dark,
        WorkstreetVivo: workstreetVivo,
        //  esriTopo:esriTopo,    
        //  voyager: voyager,
      },
      { Delimitaciones: delimitaciones },
      { position: "bottomright" }
    ).addTo(this.map);

    // ⬇️ Cargar tus placas desde /placas1.json (JSONL de puntos) y dibujarlas de golpe
    this.loadPlateBoundaries("/placas1.json");

    this.getDataPeru();
    this.fetchDataCapaDepartamentosCenter("peru");

  },

  watch: {
    "configStore.switchStatus"(newValue) {
      if (newValue === "global") {
        this.useGeojson.continente = {
          minLatitude: -55.0,
          maxLatitude: 81.0,
          minLongitude: -168.0,
          maxLongitude: 180.0,
        };
        // isLoading será controlado por el watcher de dataStore.isLoadingUSGS
        this.$nextTick(() => {
          this.getDataGlobal();
        });
      } else if (newValue === "peru") {
        this.isLoading = true;
        this.getDataPeru();
      }
    },

    "useGeojson.continente": "handleGeoJSONUpdate",
    "useGeojson.rangoFechas": "handleGeoJSONUpdate",
    "useGeojson.rangoMagnitud": "handleGeoJSONUpdate",
    "useGeojson.profundidad": "handleGeoJSONUpdate",

    // Modo Global/Peru: reaccionar cuando el store termina el fetch de la USGS API
    "dataStore.dataUSGS"(newFeatures) {
      if (!Array.isArray(newFeatures)) return;

      // Si estamos en modo Perú con rango histórico (< 1960), ignorar cambios USGS
      if (this.configStore.switchStatus === "peru") {
        const endDate = this.useGeojson.rangoFechas.endDate;
        const endYear = endDate instanceof Date
          ? endDate.getFullYear()
          : new Date(endDate).getFullYear();
        if (Number.isFinite(endYear) && endYear < 1960) return;
      }

      if (newFeatures.length > 0) {
        this.renderGlobalFeatures(newFeatures);
      }
    },

    // Spinner mientras carga la USGS API
    "dataStore.isLoadingUSGS"(loading) {
      // No controlar spinner si estamos en modo histórico (CSV)
      if (this.configStore.switchStatus === "peru") {
        const endDate = this.useGeojson.rangoFechas.endDate;
        const endYear = endDate instanceof Date
          ? endDate.getFullYear()
          : new Date(endDate).getFullYear();
        if (Number.isFinite(endYear) && endYear < 1960) return;
      }

      if (loading) {
        this.isLoading = true;
      } else if (Array.isArray(this.dataStore.dataUSGS) && this.dataStore.dataUSGS.length === 0) {
        this.renderGlobalFeatures([]);
      }
    },

    // Error en la USGS API
    "dataStore.usgsError"(error) {
      if (error) {
        this.noDataMessage = error;
        this.isLoading = false;
      }
    },

    "dataStore.igpPeruError": function() {
      // IGP ya no se usa; watcher mantenido por compatibilidad
    },

    "dataStore.realtimeEarthquake"(earthquake) {
      if (earthquake) {
        this.showRealtimeEpicenter(earthquake);
      }
    },

    "dataStore.realtimeFocusRequest"(request) {
      if (request?.earthquake) {
        this.focusRealtimeEpicenter(request.earthquake);
      }
    },

    "useGeojson.setZoom"(newVal) {
      if (newVal) { this.zoomIn(); }
      else { this.zoomOut(); }
    },

    "useGeojson.departamento"(newVal) {
      this.clearDepartamentos();
      if (newVal !== "global") this.fetchDataCapaDepartamentosCenter(newVal);
    },
  },

  methods: {
    handleMapZoomStart() {
      this.isMapZooming = true;
      this.clearEntryAnimations();
    },

    handleMapZoomEnd() {
      this.isMapZooming = false;
    },

    clearCsvLayer() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.clearEntryAnimations();

      if (!this.csvLayer) return;

      this.csvLayer.clearLayers();
      if (this.map?.hasLayer(this.csvLayer)) {
        this.map.removeLayer(this.csvLayer);
      }
      this.csvLayer = null;
    },

    // ======== PLACAS: cargar JSON/JSONL de puntos -> LineStrings y dibujar ========
    async loadPlateBoundaries(url = "/placas1.json") {
      try {
        // Limpia capa previa
        if (this.platesLayerGroup) {
          this.platesLayerGroup.remove();
          this.platesLayerGroup = null;
        }

        const res = await axios.get(url, { responseType: "text" });
        const text = res.data;

        // 1) intenta JSON normal (FeatureCollection o array de Features)
        let points = null;
        try {
          const maybe = JSON.parse(text);
          if (maybe?.type === "FeatureCollection") {
            points = (maybe.features || []).filter(f => f?.geometry?.type === "Point");
          } else if (Array.isArray(maybe)) {
            points = maybe.filter(f => f?.type === "Feature" && f?.geometry?.type === "Point");
          } else if (maybe?.type === "Feature" && maybe?.geometry?.type === "Point") {
            points = [maybe];
          }
        } catch { /* si falla, seguramente es JSONL */ }

        // 2) si no era JSON válido, parsea como JSONL (una Feature por línea)
        if (!points) {
          points = [];
          for (const line of text.split(/\r?\n/)) {
            const s = line.trim();
            if (!s) continue;
            try {
              const f = JSON.parse(s);
              if (f?.type === "Feature" && f?.geometry?.type === "Point") points.push(f);
            } catch {
              // línea no válida -> se ignora
            }
          }
        }

        if (!points || points.length === 0) {
          console.warn("No se encontraron puntos en placas1.json");
          return;
        }

        // 3) convierte puntos a LineStrings agrupando por (Name, vertex_part)
        const fcLines = this.pointsToLineStrings(points);

        // 4) dibuja todo de golpe, sin popups, y repite en -360/0/+360
        this.drawPlatesOnce(fcLines);
      } catch (e) {
        console.error("Error cargando placas1.json:", e);
      }
    },

    pointsToLineStrings(points) {
      // agrupa por Name + vertex_part
      const groups = new Map();
      for (const f of points) {
        const p = f.properties || {};
        const name = p.Name || "Boundary";
        const part = p.vertex_part ?? 0;
        const key = `${name}|${part}`;

        const coords = f.geometry?.coordinates || [];
        // lon,lat (ignora altura)
        const lon = Number(coords[0]);
        const lat = Number(coords[1]);
        if (Number.isFinite(lon) && Number.isFinite(lat)) {
          const arr = groups.get(key) || [];
          arr.push({
            lon,
            lat,
            order: (p.vertex_part_index ?? p.vertex_index ?? 0)
          });
          groups.set(key, arr);
        }
      }

      const features = [];
      for (const [key, arr] of groups.entries()) {
        arr.sort((a, b) => a.order - b.order);
        const coords = arr.map(pt => [pt.lon, pt.lat]);
        const name = key.split("|")[0];
        features.push({
          type: "Feature",
          properties: { name },
          geometry: { type: "LineString", coordinates: coords }
        });
      }

      return {
        type: "FeatureCollection",
        name: "TectonicPlateBoundaries",
        crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        features
      };
    },

    shiftGeoJSONLon(geojson, delta) {
      const deep = (coords) => {
        if (typeof coords[0] === "number") {
          const out = coords.slice();
          out[0] = out[0] + delta; // solo longitud
          return out;
        }
        return coords.map(deep);
      };
      const clone = JSON.parse(JSON.stringify(geojson));
      for (const f of clone.features) {
        if (f.geometry?.coordinates) f.geometry.coordinates = deep(f.geometry.coordinates);
      }
      return clone;
    },

    drawPlatesOnce(fcLines) {
      // grupo para contener las 3 copias
      this.platesLayerGroup = L.layerGroup().addTo(this.map);
      const deltas = [-360, 0, 360];

      deltas.forEach((d) => {
        const fc = d === 0 ? fcLines : this.shiftGeoJSONLon(fcLines, d);
        const layer = L.geoJSON(fc, {
          style: { color: "#a35b5b", weight: 1.5, opacity: 0.95, fillOpacity: 0 },
          interactive: false // sin popups / clics
        });
        layer.addTo(this.platesLayerGroup);
      });
    },
    // ======== FIN PLACAS ========

    getRealtimeCoordinates(earthquake) {
      const coordinates = earthquake?.geometry?.coordinates;
      const latitude = Number(
        earthquake?.latitud ??
        earthquake?.latitude ??
        earthquake?.lat ??
        (Array.isArray(coordinates) ? coordinates[1] : undefined)
      );
      const longitude = Number(
        earthquake?.longitud ??
        earthquake?.longitude ??
        earthquake?.lon ??
        earthquake?.lng ??
        (Array.isArray(coordinates) ? coordinates[0] : undefined)
      );

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return { latitude, longitude };
    },

    createRealtimeStarIcon() {
      return L.divIcon({
        className: "realtime-epicenter-star",
        html: '<span aria-hidden="true">&#9733;</span>',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -18],
      });
    },

    escapePopupValue(value) {
      return String(value ?? "No disponible")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    formatRealtimeDate(value) {
      if (!value) return "No disponible";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;

      return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    },

    buildRealtimePopup(earthquake) {
      const magnitude = earthquake?.magnitud ?? earthquake?.magnitude ?? earthquake?.mag;
      const depth = earthquake?.profundidad ?? earthquake?.depth;
      const reference = earthquake?.referencia ?? earthquake?.place ?? earthquake?.lugar;
      const date = earthquake?.fecha_hora ?? earthquake?.fechalocal ?? earthquake?.time;

      return `
        <strong>Sismo reciente</strong>
        <br>Referencia: ${this.escapePopupValue(reference)}
        <br>Magnitud: ${this.escapePopupValue(magnitude)}
        <br>Profundidad: ${this.escapePopupValue(depth)} km
        <br>Fecha: ${this.escapePopupValue(this.formatRealtimeDate(date))}
      `;
    },

    clearRealtimeEpicenterMarker() {
      if (this.realtimeEpicenterMarker && this.map) {
        this.map.removeLayer(this.realtimeEpicenterMarker);
      }

      this.realtimeEpicenterMarker = null;
      window.clearTimeout(this.realtimeEpicenterTimer);
      this.realtimeEpicenterTimer = null;
    },

    showRealtimeEpicenter(earthquake) {
      if (!this.map) return;

      const coordinates = this.getRealtimeCoordinates(earthquake);
      if (!coordinates) return;

      this.clearRealtimeEpicenterMarker();
      this.realtimeEpicenterMarker = L.marker(
        [coordinates.latitude, coordinates.longitude],
        {
          icon: this.createRealtimeStarIcon(),
          interactive: true,
          zIndexOffset: 10000,
        }
      )
        .bindPopup(this.buildRealtimePopup(earthquake))
        .addTo(this.map);

      this.realtimeEpicenterTimer = window.setTimeout(() => {
        this.clearRealtimeEpicenterMarker();
      }, 30000);
    },

    focusRealtimeEpicenter(earthquake) {
      if (!this.map) return;

      const coordinates = this.getRealtimeCoordinates(earthquake);
      if (!coordinates) return;

      if (!this.realtimeEpicenterMarker) {
        this.showRealtimeEpicenter(earthquake);
      }

      const targetZoom = Math.max(this.map.getZoom(), 9);
      this.clearEntryAnimations();
      this.map.stop();
      this.map.flyTo([coordinates.latitude, coordinates.longitude], targetZoom, {
        duration: 1.1,
      });

      if (this.realtimeEpicenterMarker) {
        this.realtimeEpicenterMarker.openPopup();
      }
    },

    prepareMapZoomChange() {
      if (!this.map) return;

      this.clearEntryAnimations();
      this.map.stop();
      this.isMapZooming = true;
    },

    zoomIn() {
      if (this.map) {
        const currentZoom = this.map.getZoom();
        this.previousZoom = currentZoom;
        let newZoom = currentZoom + 2;
        newZoom = Math.min(newZoom, this.map.getMaxZoom());
        if (newZoom === currentZoom) return;
        this.prepareMapZoomChange();
        this.map.setZoom(newZoom);
      }
    },
    zoomOut() {
      if (this.map && this.previousZoom !== null) {
        if (this.previousZoom === this.map.getZoom()) return;
        this.prepareMapZoomChange();
        this.map.setZoom(this.previousZoom);
      }
    },
    async handleGeoJSONUpdate() {
      if (this.configStore.switchStatus === "global") return;
      this.schedulePeruDataRefresh();
    },

    schedulePeruDataRefresh() {
      window.clearTimeout(this.peruRefreshTimer);
      this.peruRefreshTimer = window.setTimeout(() => {
        this.getDataPeru();
      }, 180);
    },

    convertCSVToGeoJSON(data) {
      const repeatOffsets = [[0, 0], [360, 0], [-360, 0]];
      const filteredByCoordinates = data.filter((row) => {
        return (
          !isNaN(row.latitude) &&
          !isNaN(row.longitude) &&
          row.latitude !== null &&
          row.longitude !== null &&
          row.latitude >= this.useGeojson.continente.minLatitude &&
          row.latitude <= this.useGeojson.continente.maxLatitude &&
          row.longitude >= this.useGeojson.continente.minLongitude &&
          row.longitude <= this.useGeojson.continente.maxLongitude
        );
      });
      const filteredByMagnitude = filteredByCoordinates.filter((row) => {
        const mag = row.mag;
        return mag >= this.useGeojson.rangoMagnitud.maxMag && mag <= this.useGeojson.rangoMagnitud.minMag;
      });
      const filteredByDate = filteredByMagnitude.filter((row) => {
        const eventDate = new Date(row.time);
        return eventDate >= this.useGeojson.rangoFechas.startDate && eventDate <= this.useGeojson.rangoFechas.endDate;
      });
      const filteredByDepth = filteredByDate.filter((row) => {
        const depth = row.depth;
        if (this.useGeojson.profundidad.isSuperficial && depth <= 60) return true;
        if (this.useGeojson.profundidad.isIntermediate && depth > 60 && depth <= 300) return true;
        if (this.useGeojson.profundidad.isDeep && depth > 300) return true;
        return false;
      });

      const features = [];
      filteredByDepth.forEach((row) => {
        repeatOffsets.forEach((offset) => {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [parseFloat(row.longitude) + offset[0], parseFloat(row.latitude) + offset[1]],
            },
            properties: {
              mag: row.mag,
              place: row.place,
              time: row.time,
              depth: row.depth,
              magType: row.magType,
            },
          });
        });
      });
      return { type: "FeatureCollection", features };
    },

    shouldFetchIgpPeru() {
      // Método eliminado — ya no se usa IGP
      return false;
    },

    getDateYear(value) {
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.getFullYear();
    },

    getActiveGlobalBounds() {
      const params = this.dataStore.lastUsgsParams;

      if (
        params &&
        params.minlatitude !== undefined &&
        params.maxlatitude !== undefined &&
        params.minlongitude !== undefined &&
        params.maxlongitude !== undefined
      ) {
        return {
          minLatitude: Number(params.minlatitude),
          maxLatitude: Number(params.maxlatitude),
          minLongitude: Number(params.minlongitude),
          maxLongitude: Number(params.maxlongitude),
        };
      }

      return this.useGeojson.continente;
    },

    normalizeGeoJsonFeatureForMap(feature) {
      const coords = feature?.geometry?.coordinates || [];
      const longitude = Number(coords[0]);
      const latitude = Number(coords[1]);
      const depth = Number(
        feature?.properties?.depth ??
        feature?.properties?.profundidad ??
        coords[2] ??
        0
      );
      const magnitude = Number(
        feature?.properties?.mag ??
        feature?.properties?.magnitude ??
        feature?.properties?.magnitud
      );

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      if (!Number.isFinite(magnitude)) {
        return null;
      }

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            longitude,
            latitude,
            Number.isFinite(depth) ? depth : 0,
          ],
        },
        properties: {
          ...feature.properties,
          mag: magnitude,
          depth: Number.isFinite(depth) ? depth : 0,
          place:
            feature.properties?.place ??
            feature.properties?.referencia ??
            "-",
          time:
            feature.properties?.time ??
            feature.properties?.fechalocal ??
            feature.properties?.fecha_hora ??
            null,
          magType: feature.properties?.magType ?? feature.properties?.tipomagnitud ?? "IGP",
        },
      };
    },

    repeatGeoJsonFeatures(features) {
      const repeatOffsets = [[0, 0], [360, 0], [-360, 0]];
      const repeatedFeatures = [];

      features.forEach((feature) => {
        repeatOffsets.forEach(([offsetLon, offsetLat]) => {
          const coordinates = feature.geometry.coordinates;
          repeatedFeatures.push({
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: [
                coordinates[0] + offsetLon,
                coordinates[1] + offsetLat,
                coordinates[2],
              ],
            },
          });
        });
      });

      return repeatedFeatures;
    },

    normalizeBackendGeoJSONForMap(geoJSON) {
      const features = Array.isArray(geoJSON?.features)
        ? geoJSON.features
        : [];
      const normalizedFeatures = features
        .map((feature) => this.normalizeGeoJsonFeatureForMap(feature))
        .filter(Boolean);

      return {
        type: "FeatureCollection",
        features: this.repeatGeoJsonFeatures(normalizedFeatures),
      };
    },

    buildUsgsGeoJSONForMap(rawFeatures) {
      const repeatOffsets = [[0, 0], [360, 0], [-360, 0]];
      const features = [];

      rawFeatures.forEach((feature) => {
        const coords = feature.geometry?.coordinates || [];
        const lon = coords[0];
        const lat = coords[1];
        const depth = coords[2] ?? 0;
        const props = {
          mag: feature.properties?.mag ?? 0,
          place: feature.properties?.place ?? "-",
          time: feature.properties?.time ?? null,
          depth,
          magType: feature.properties?.magType ?? "-",
          source: "USGS",
        };

        repeatOffsets.forEach(([offsetLon]) => {
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lon + offsetLon, lat, depth] },
            properties: props,
          });
        });
      });

      return { type: "FeatureCollection", features };
    },

    shouldIncludeLocalPeruForGlobal() {
      const params = this.dataStore.lastUsgsParams;
      const startYear =
        this.getDateYear(params?.starttime) ??
        this.getDateYear(this.useGeojson.rangoFechas.startDate);

      return (
        Number.isFinite(startYear) &&
        startYear < IGP_MODERN_START_YEAR &&
        Boolean(this.getPeruBoundsForGlobalSelection())
      );
    },

    mergeGeoJSONCollections(...collections) {
      return {
        type: "FeatureCollection",
        features: collections.flatMap((collection) =>
          Array.isArray(collection?.features) ? collection.features : []
        ),
      };
    },

    getDepthColor(depth) {
      if (depth > 300) return "#002FEF";
      if (depth > 60) return "#0AB427";
      return "#ff0000";
    },

    getMagnitudeRadius(magnitude) {
      if (magnitude >= 4 && magnitude <= 4.9) return 3.5;
      if (magnitude >= 5 && magnitude <= 5.9) return 5.5;
      if (magnitude >= 6 && magnitude <= 6.9) return 9.5;
      if (magnitude >= 7 && magnitude <= 7.9) return 16;
      if (magnitude >= 8 && magnitude <= 9.5) return 23.5;
      return 3.5;
    },

    clearEntryAnimations() {
      this.entryAnimationMarkers.forEach((entry) => {
        window.clearTimeout(entry.timer);
        if (this.map?.hasLayer(entry.marker)) {
          this.map.removeLayer(entry.marker);
        }
      });
      this.entryAnimationMarkers = [];
    },

    removeEntryAnimation(entry) {
      window.clearTimeout(entry.timer);
      if (this.map?.hasLayer(entry.marker)) {
        this.map.removeLayer(entry.marker);
      }
      this.entryAnimationMarkers = this.entryAnimationMarkers.filter(
        (item) => item !== entry
      );
    },

    createEntryAnimationIcon(type, color, radius) {
      const size = Math.max(30, Math.min(82, radius * 3.6));

      return L.divIcon({
        className: `quake-entry-icon quake-entry-${type}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <span class="quake-entry-wrap" style="--quake-color: ${color}; --quake-size: ${size}px;">
            <span class="quake-entry-ring quake-entry-ring-a"></span>
            <span class="quake-entry-ring quake-entry-ring-b"></span>
            <span class="quake-entry-core"></span>
            <span class="quake-entry-orbit"></span>
          </span>
        `,
      });
    },

    showEntryAnimation(feature) {
      if (!this.map || !feature?.geometry?.coordinates) return;
      if (this.isMapZooming || this.map._animatingZoom) return;

      const [longitude, latitude] = feature.geometry.coordinates;
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (lng < -180 || lng > 180) return;

      const depth = Number(feature.properties?.depth ?? 0);
      const magnitude = Number(feature.properties?.mag ?? 4);
      const color = this.getDepthColor(depth);
      const radius = this.getMagnitudeRadius(magnitude);
      const type = /^[1-6]$/.test(String(this.useGeojson.animationType))
        ? String(this.useGeojson.animationType)
        : "1";

      const marker = L.marker([lat, lng], {
        icon: this.createEntryAnimationIcon(type, color, radius),
        interactive: false,
        keyboard: false,
        zIndexOffset: 7000,
      }).addTo(this.map);

      const entry = {
        marker,
        timer: window.setTimeout(() => {
          this.removeEntryAnimation(entry);
        }, 1200),
      };

      this.entryAnimationMarkers.push(entry);

      if (this.entryAnimationMarkers.length > 140) {
        this.removeEntryAnimation(this.entryAnimationMarkers[0]);
      }
    },

    addGeoJSONToMap(geoJSON) {
      if (!this.map) return;

      this.map.stop();
      this.isMapZooming = false;
      this.clearCsvLayer();

      if (geoJSON.features.length === 0) {
        this.noDataMessage = "No se encontraron datos para el rango de fecha solicitado.";
        return;
      } else {
        this.noDataMessage = null;
      }

      this.csvLayer = L.geoJSON(null, {
        renderer: this.earthquakeRenderer,
        pointToLayer: (feature, latlng) => {
          const depth = Number(feature.properties.depth ?? 0);
          const color = this.getDepthColor(depth);
          const radius = this.getMagnitudeRadius(Number(feature.properties.mag));

          return L.circleMarker(latlng, {
            className: "pulse",
            renderer: this.earthquakeRenderer,
            radius: radius + this.sumarProf,
            fillColor: color,
            fillOpacity: 0,
            color: color,
            weight: 1,
          });
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(
            `Lugar: ${feature.properties.place}
            <br>Magnitud: ${feature.properties.mag}
            <br>Profundidad: ${feature.properties.depth} km
            <br>Fecha: ${new Date(feature.properties.time).toLocaleString()} (GMT)`
          );
        },
      }).addTo(this.map);

      const bounds = L.latLngBounds(
        [this.useGeojson.continente.minLatitude, this.useGeojson.continente.minLongitude],
        [this.useGeojson.continente.maxLatitude, this.useGeojson.continente.maxLongitude]
      );
      if (this.configStore.switchStatus !== "global") {
        if (geoJSON.features.length > 0) this.map.fitBounds(bounds);
      }

      // Si quieres que los sismos también salgan de golpe:
      // this.csvLayer.addData(geoJSON); return;
      const features = geoJSON.features;
      const chunkSize = 4;
      const segundos = 0.002;
      let index = 0;
      const addPointsInChunks = () => {
        if (!this.map || !this.csvLayer || this.useGeojson.estadoPl === "disable") {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.useGeojson.estadoPl = "disable";
          return;
        }

        if (this.isMapZooming || this.map._animatingZoom) {
          return;
        }

        if (index >= features.length) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.useGeojson.estadoPl = "disable";
          return;
        }

        const chunk = features.slice(index, index + chunkSize);
        chunk.forEach((f) => {
          this.csvLayer.addData(f);
          this.showEntryAnimation(f);
        });
        index += chunkSize;
      };
      this.intervalId = setInterval(addPointsInChunks, segundos * 1000);

      if (
        this.useGeojson.continente.minLatitude === -55.0 &&
        this.useGeojson.continente.maxLatitude === 81.0 &&
        this.useGeojson.continente.minLongitude === -168.0 &&
        this.useGeojson.continente.maxLongitude === 180.0
      ) {
        const defaultCenter = [10, 0];  // Centro perfecto del mundo
        this.map.setView(defaultCenter, 2);
      } else {
        this.map.fitBounds(bounds);
      }
    },

    fetchDataCapaDepartamentosCenter(val) {
      let getApiGeoJson = null;
      if (val === "peru") {
        getApiGeoJson = "/datas/peru.geojson";
      } else {
        getApiGeoJson = `https://ide.igp.gob.pe/arcgis/rest/services/mapabase/MapaBase/MapServer/10/query?where=DEPARTAMEN+%3D+%27${val}%27&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson`;
      }
      axios
        .get(getApiGeoJson)
        .then((response) => {
          this.geoJSONLayerCapaDepartamento = L.geoJSON(response.data, {
            style: function () {
              return {
                color: "#3388ff",
                weight: 3,
                fillOpacity: 0,
              };
            },
          });
        })
        .then(() => {
          this.geoJSONLayerCapaDepartamento.addTo(this.map);
        })
        .catch((error) => {
          console.error("Error al obtener el GeoJSON:", error);
        });
    },
    clearDepartamentos() {
      if (this.geoJSONLayerCapaDepartamento) {
        this.map.removeLayer(this.geoJSONLayerCapaDepartamento);
        this.geoJSONLayerCapaDepartamento = null;
      }
    },

    async getDataPeru() {
      const requestId = ++this.peruDataRequestId;
      this.isLoading = true;

      try {
        const startDate = this.useGeojson.rangoFechas.startDate;
        const endDate = this.useGeojson.rangoFechas.endDate;

        const getYear = (val) => {
          const d = val instanceof Date ? val : new Date(val);
          return Number.isNaN(d.getTime()) ? null : d.getFullYear();
        };

        const endYear = getYear(endDate);

        // Si el rango es anterior a 1960, usar CSV histórico local
        if (endYear !== null && endYear < 1960) {
          if (this.dataStore.isLoadingPeru || this.dataStore.combinedData.length === 0) {
            await this.dataStore.fetchDataPeru();
          }
          if (requestId !== this.peruDataRequestId) return;

          const historicGeoJSON = this.convertCSVToGeoJSON(this.dataStore.combinedData);
          this.addGeoJSONToMap(historicGeoJSON);
          return;
        }

        // Desde 1960 en adelante → USGS API
        const prof = this.useGeojson.profundidad;
        const { mindepth, maxdepth } = (() => {
          const s = Boolean(prof.isSuperficial);
          const i = Boolean(prof.isIntermediate ?? prof.isIntermedio);
          const d = Boolean(prof.isDeep);
          if (s && i && d) return { mindepth: 0, maxdepth: 700 };
          if (s && i) return { mindepth: 0, maxdepth: 300 };
          if (s && d) return { mindepth: 0, maxdepth: 700 };
          if (i && d) return { mindepth: 61, maxdepth: 700 };
          if (s) return { mindepth: 0, maxdepth: 60 };
          if (i) return { mindepth: 61, maxdepth: 300 };
          if (d) return { mindepth: 301, maxdepth: 700 };
          return { mindepth: 0, maxdepth: 700 };
        })();

        const toDateStr = (val) => {
          const d = val instanceof Date ? val : new Date(val);
          if (Number.isNaN(d.getTime())) return undefined;
          return d.toISOString().slice(0, 10);
        };

        await this.dataStore.fetchDataUSGS({
          starttime: toDateStr(startDate),
          endtime: toDateStr(endDate),
          minmagnitude: this.useGeojson.rangoMagnitud.maxMag,
          maxmagnitude: this.useGeojson.rangoMagnitud.minMag,
          mindepth,
          maxdepth,
          minlatitude: this.useGeojson.continente.minLatitude,
          maxlatitude: this.useGeojson.continente.maxLatitude,
          minlongitude: this.useGeojson.continente.minLongitude,
          maxlongitude: this.useGeojson.continente.maxLongitude,
        });

        if (requestId !== this.peruDataRequestId) return;

        const usgsGeoJSON = this.buildUsgsGeoJSONForMap(this.dataStore.dataUSGS);
        this.addGeoJSONToMap(usgsGeoJSON);
      } catch (error) {
        console.error("Error fetching data for Peru:", error);
        if (requestId === this.peruDataRequestId) {
          this.noDataMessage = "No se pudieron cargar los sismos de Perú.";
        }
      } finally {
        if (requestId === this.peruDataRequestId) {
          this.isLoading = false;
        }
      }
    },

    async getDataGlobal() {
      // En modo Global el fetch lo inicia el botón Play del panel (via dataStore.fetchDataUSGS).
      // isLoading se controla con el watcher de dataStore.isLoadingUSGS.
    },

    /**
     * Transforma las features nativas de la USGS (depth en coordinates[2])
     * al formato que espera addGeoJSONToMap y las pinta.
     * @param {Array} rawFeatures - features de la USGS FeatureCollection
     */
    async renderGlobalFeatures(rawFeatures) {
      const requestId = ++this.globalDataRequestId;
      this.isLoading = true;

      try {
        const usgsGeoJSON = this.buildUsgsGeoJSONForMap(rawFeatures);

        if (requestId !== this.globalDataRequestId) return;

        this.addGeoJSONToMap(usgsGeoJSON);
      } finally {
        if (requestId === this.globalDataRequestId) {
          this.isLoading = false;
        }
      }
    },
  },

  beforeUnmount() {
    this.useGeojson.departamento = "peru";
    this.useGeojson.estadoPl = "enable";
    this.useGeojson.continente = {
      minLatitude: -18.35,
      maxLatitude: -0.03,
      minLongitude: -81.33,
      maxLongitude: -68.65,
    };
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    window.clearTimeout(this.peruRefreshTimer);
    this.clearCsvLayer();
    if (this.platesLayerGroup) {
      this.platesLayerGroup.remove();
      this.platesLayerGroup = null;
    }
    this.clearRealtimeEpicenterMarker();
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
  },
};
</script>

<style>
.plate-label {
  font-size: 16px;
  font-weight: bold;
  color: red;
  /* como en tu ejemplo */
  text-shadow: 1px 1px 2px white;
  pointer-events: none;
  /* evita bloquear clics en el mapa */
}

.leaflet-tile-pane .vivo {
  filter: hue-rotate(0deg) saturate(1.5) brightness(0.9) contrast(1.1);
}

.quake-entry-icon {
  background: transparent;
  border: 0;
  pointer-events: none;
}

.quake-entry-wrap,
.quake-entry-core,
.quake-entry-ring,
.quake-entry-orbit {
  display: block;
  position: absolute;
}

.quake-entry-wrap {
  height: var(--quake-size);
  left: 0;
  top: 0;
  width: var(--quake-size);
}

.quake-entry-core {
  background: var(--quake-color);
  border: 2px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 12px var(--quake-color);
  height: 10px;
  left: 50%;
  margin-left: -5px;
  margin-top: -5px;
  top: 50%;
  width: 10px;
}

.quake-entry-ring {
  border: 2px solid var(--quake-color);
  border-radius: 999px;
  inset: 0;
  opacity: 0;
}

.quake-entry-orbit {
  border-radius: 999px;
  inset: 0;
  opacity: 0;
}

.quake-entry-orbit::after {
  background: #ffffff;
  border: 2px solid var(--quake-color);
  border-radius: 999px;
  box-shadow: 0 0 10px var(--quake-color);
  content: "";
  height: 8px;
  left: 50%;
  margin-left: -4px;
  position: absolute;
  top: -1px;
  width: 8px;
}

.quake-entry-1 .quake-entry-core {
  animation: quake-entry-core-pop 900ms ease-out both;
}

.quake-entry-1 .quake-entry-ring-a {
  animation: quake-entry-ripple 980ms ease-out both;
}

.quake-entry-2 .quake-entry-core {
  animation: quake-entry-core-pop 950ms ease-out both;
}

.quake-entry-2 .quake-entry-ring-a {
  animation: quake-entry-ripple 950ms ease-out both;
}

.quake-entry-2 .quake-entry-ring-b {
  animation: quake-entry-ripple 950ms ease-out 170ms both;
}

.quake-entry-3 .quake-entry-core {
  animation: quake-entry-bounce 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.quake-entry-3 .quake-entry-ring-a {
  animation: quake-entry-soft-ring 900ms ease-out both;
}

.quake-entry-4 .quake-entry-core {
  animation: quake-entry-flash-core 850ms ease-out both;
}

.quake-entry-4 .quake-entry-ring-a {
  border-color: #ffffff;
  animation: quake-entry-flash-ring 850ms ease-out both;
}

.quake-entry-5 .quake-entry-ring-a {
  animation: quake-entry-radar 1050ms ease-out both;
  border-style: dashed;
}

.quake-entry-5 .quake-entry-ring-b {
  animation: quake-entry-radar 1050ms ease-out 180ms both;
  border-style: dotted;
}

.quake-entry-5 .quake-entry-core {
  animation: quake-entry-core-pop 900ms ease-out both;
}

.quake-entry-6 .quake-entry-core {
  animation: quake-entry-core-pop 850ms ease-out both;
}

.quake-entry-6 .quake-entry-ring-a {
  animation: quake-entry-soft-ring 1050ms ease-out both;
}

.quake-entry-6 .quake-entry-orbit {
  animation: quake-entry-orbit 1050ms ease-out both;
  opacity: 1;
}

@keyframes quake-entry-ripple {
  0% {
    opacity: 0.9;
    transform: scale(0.12);
  }

  100% {
    opacity: 0;
    transform: scale(1.45);
  }
}

@keyframes quake-entry-soft-ring {
  0% {
    opacity: 0.7;
    transform: scale(0.2);
  }

  70% {
    opacity: 0.18;
  }

  100% {
    opacity: 0;
    transform: scale(1.18);
  }
}

@keyframes quake-entry-core-pop {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }

  35% {
    opacity: 1;
    transform: scale(1.45);
  }

  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes quake-entry-bounce {
  0% {
    opacity: 0;
    transform: scale(0.1);
  }

  45% {
    opacity: 1;
    transform: scale(1.7);
  }

  68% {
    transform: scale(0.75);
  }

  100% {
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes quake-entry-flash-core {
  0% {
    background: #ffffff;
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.8), 0 0 22px #ffffff;
    opacity: 1;
    transform: scale(1.7);
  }

  45% {
    background: var(--quake-color);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.45), 0 0 18px var(--quake-color);
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.75);
  }
}

@keyframes quake-entry-flash-ring {
  0% {
    opacity: 1;
    transform: scale(0.25);
  }

  100% {
    opacity: 0;
    transform: scale(1.7);
  }
}

@keyframes quake-entry-radar {
  0% {
    opacity: 0.9;
    transform: rotate(0deg) scale(0.2);
  }

  100% {
    opacity: 0;
    transform: rotate(220deg) scale(1.35);
  }
}

@keyframes quake-entry-orbit {
  0% {
    opacity: 0;
    transform: rotate(0deg) scale(0.45);
  }

  20% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: rotate(320deg) scale(1.05);
  }
}

.realtime-epicenter-star {
  background: transparent;
  border: 0;
}

.realtime-epicenter-star span {
  align-items: center;
  animation: realtime-star-pulse 1.15s ease-in-out infinite;
  color: #ffb000;
  display: flex;
  filter: drop-shadow(0 4px 7px rgba(0, 0, 0, 0.35));
  font-size: 42px;
  height: 44px;
  justify-content: center;
  line-height: 1;
  text-shadow:
    0 0 0 #7a2300,
    0 0 8px rgba(255, 176, 0, 0.9),
    0 0 18px rgba(255, 106, 0, 0.5);
  width: 44px;
}

@keyframes realtime-star-pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.22);
  }
}

@media (max-width: 600px) {
  #map {
    height: 100vh;
  }
}

.pulse {
  animation: pulsate 1s ease-out;
  opacity: 1;
  stroke-width: 2px;
}

@keyframes pulsate {
  0% {
    fill: white;
    opacity: 1;
    stroke-width: 30px;
    stroke: white;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.loader {
  width: 50px;
  aspect-ratio: 1;
  display: grid;
  border: 4px solid #0000;
  border-radius: 50%;
  border-color: #ccc #0000;
  animation: l16 1s infinite linear;
}

.loader::before,
.loader::after {
  content: "";
  grid-area: 1/1;
  margin: 2px;
  border: inherit;
  border-radius: 50%;
}

.loader::before {
  border-color: #3388ff #0000;
  animation: inherit;
  animation-duration: .5s;
  animation-direction: reverse;
}

.loader::after {
  margin: 8px;
}

@keyframes l16 {
  100% {
    transform: rotate(1turn);
  }
}
</style>
