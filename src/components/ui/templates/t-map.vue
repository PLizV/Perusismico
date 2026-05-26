<template>
  <div class="relative border-2 border-red-600">
    <div
      v-if="noDataMessage"
      class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-[99999999]"
    >
      <div class="text-center flex flex-col items-center justify-center">
<<<<<<< HEAD
        <p style="color: #3388ff" class="text-lg font-semibold">
          No se han registrado sismos en esta área según los parámetros ingresados
        </p>
=======
        <p style="color: #3388ff" class="text-lg font-semibold"> "No se han registrado sismos en esta área segun los parámetros ingresados"</p>
>>>>>>> 350510e8528f2ac7c564b0429f1a08a7dff2c65e
        <div class="no-data-message"></div>
      </div>
    </div>

    <div class="overflow-hidden inset-0 bg-cover absolute top-0 left-0 w-full h-screen z-1" id="map">
      <div
        v-if="isLoading"
        class="rounded-md absolute z-[99999999] bg-white bg-opacity-50 inset-0 flex items-center justify-center"
      >
        <div class="text-center flex flex-col items-center justify-center">
          <p style="color: #3388ff" class="text-lg font-semibold">Cargando...</p>
          <div class="loader"></div>
        </div>
      </div>
    </div>

    <!-- Overlay SVG tal cual lo tenías -->
    <svg
      id="overlay-svg"
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;"
    >
      <path
        class="leaflet-interactive"
        stroke="#3388ff"
        stroke-opacity="1"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="#3388ff"
        fill-opacity="0.2"
        fill-rule="evenodd"
        d="M1118 422L1108 422L1106 424L1105 429L1101 430L1097 434L1095 442L1092 445L1093 448L1091 450L1090 449L1079 454L1075 458L1076 461L1072 465L1073 468L1077 470L1077 472L1074 473L1077 476L1078 473L1080 475L1079 480L1081 480L1085 486L1085 494L1087 494L1086 495L1089 498L1089 500L1092 502L1091 507L1092 506L1092 510L1095 515L1094 518L1098 522L1100 528L1107 537L1106 538L1108 540L1109 538L1113 538L1111 534L1113 532L1113 526L1120 528L1120 530L1116 532L1114 538L1116 536L1120 536L1118 538L1122 540L1121 548L1124 545L1130 545L1130 542L1135 537L1139 537L1140 532L1145 527L1147 527L1148 524L1152 524L1151 517L1153 517L1156 514L1156 510L1152 500L1150 498L1148 500L1145 495L1150 490L1150 486L1154 478L1155 477L1155 479L1158 482L1160 480L1160 476L1157 471L1150 469L1146 465L1144 465L1141 460L1140 461L1140 457L1136 453L1136 449L1134 449L1135 446L1131 442L1129 442L1126 433L1123 430L1121 430L1122 427L1120 427L1118 422z"
      />
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

export default {
  data() {
    return {
      isLoading: true,
      map: null,
      platesLayerGroup: null, // ⬅️ grupo de placas
      useGeojson: useGeojsonStore(),
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
      dataStore: useDataStore(),
      configStore: useConfigStore(),
    };
  },

  mounted() {
    const attribution = '&copy; <a href="httpS://osm.org/copyright">OpenStreetMap</a> contributors';

  //  const terreno = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", { attribution });
    const google   = L.tileLayer("https://mt1.google.com/vt/lyrs=m@113&hl=en&&x={x}&y={y}&z={z}", { attribution });
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
    });

    this.map.removeControl(this.map.zoomControl);
    L.control.zoom({ position: "bottomright" }).addTo(this.map);
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
    this.isLoading = true;

    if (newValue === "global") {
      this.useGeojson.continente = {
        minLatitude: -55.0,
        maxLatitude: 81.0,
        minLongitude: -168.0,
        maxLongitude: 180.0,
      };

      this.$nextTick(() => {
        this.getDataGlobal();
      });

    } else if (newValue === "peru") {
      this.getDataPeru();
    }
  },  // ← ESTA COMA ES OBLIGATORIA

  "useGeojson.continente": "handleGeoJSONUpdate",
  "useGeojson.rangoFechas": "handleGeoJSONUpdate",
  "useGeojson.rangoMagnitud": "handleGeoJSONUpdate",
  "useGeojson.profundidad": "handleGeoJSONUpdate",

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

    zoomIn() {
      if (this.map) {
        this.previousZoom = this.map.getZoom();
        let newZoom = this.previousZoom + 2;
        newZoom = Math.min(newZoom, this.map.getMaxZoom());
        this.map.setZoom(newZoom);
      }
    },
    zoomOut() {
      if (this.map && this.previousZoom !== null) {
        this.map.setZoom(this.previousZoom);
      }
    },
    async handleGeoJSONUpdate() {
      if (this.isGeoJSONProcessing) return;
      this.isGeoJSONProcessing = true;
      const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
      this.addGeoJSONToMap(geoJSONData);
      this.isGeoJSONProcessing = false;
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

    addGeoJSONToMap(geoJSON) {
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer);
        this.csvLayer = null;
      }
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (geoJSON.features.length === 0) {
        this.noDataMessage = "No se encontraron datos para el rango de fecha solicitado.";
        return;
      } else {
        this.noDataMessage = null;
      }

      this.csvLayer = L.geoJSON(null, {
        pointToLayer: (feature, latlng) => {
          let color = "#ff0000";
          if (feature.properties.depth > 300) color = "#002FEF";
          else if (feature.properties.depth > 60 && feature.properties.depth <= 300) color = "#0AB427";
          else if (feature.properties.depth <= 60) color = "#ff0000";

          let radius = 1;
          const m = feature.properties.mag;
          if (m >= 4 && m <= 4.9) radius = 3.5;
          else if (m >= 5 && m <= 5.9) radius = 5.5;
          else if (m >= 6 && m <= 6.9) radius = 9.5;
          else if (m >= 7 && m <= 7.9) radius = 16;
          else if (m >= 8 && m <= 9.5) radius = 23.5;

          return L.circleMarker(latlng, {
            className: "pulse",
            radius: radius + this.sumarProf,
            fillColor: color,
            fillOpacity: 0,
            color: color,
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
        if (index >= features.length || this.useGeojson.estadoPl === "disable") {
          clearInterval(this.intervalId);
          this.useGeojson.estadoPl = "disable";
          return;
        }
        const chunk = features.slice(index, index + chunkSize);
        chunk.forEach((f) => this.csvLayer.addData(f));
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
      this.isLoading = true;
      if (!this.dataStore.isLoadingPeru) {
        const storeCombined = this.dataStore.combinedData;
        const storeGeoJSONData = this.convertCSVToGeoJSON(storeCombined);
        this.setData = storeCombined;
        this.addGeoJSONToMap(storeGeoJSONData);
        this.isLoading = this.dataStore.isLoadingPeru;
      } else {
        this.dataStore
          .fetchDataPeru()
          .then(() => {
            const storeCombined = this.dataStore.combinedData;
            const storeGeoJSONData = this.convertCSVToGeoJSON(storeCombined);
            this.setData = storeCombined;
            this.addGeoJSONToMap(storeGeoJSONData);
            this.isLoading = this.dataStore.isLoadingPeru;
          })
          .catch((error) => {
            console.error("Error fetching data for Peru:", error);
            this.isLoading = this.dataStore.isLoadingPeru;
          });
      }
    },

    async getDataGlobal() {
      this.isLoading = true;
      if (!this.dataStore.isLoadingGlobal) {
        await this.dataStore.fetchDataGlobal();
        const globalData = this.dataStore.dataGlobal;
        const globalGeoJSONData = this.convertCSVToGeoJSON(globalData);
        this.setData = globalData;
        this.addGeoJSONToMap(globalGeoJSONData);
        this.isLoading = this.dataStore.isLoadingGlobal;
      } else {
        this.dataStore
          .fetchDataGlobal()
          .then(() => {
            const globalData = this.dataStore.dataGlobal;
            const globalGeoJSONData = this.convertCSVToGeoJSON(globalData);
            this.setData = globalData;
            this.addGeoJSONToMap(globalGeoJSONData);
            this.isLoading = this.dataStore.isLoadingGlobal;
          })
          .catch((error) => {
            console.error("Error fetching data for Global:", error);
            this.isLoading = this.dataStore.isLoadingGlobal;
          });
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
    if (this.csvLayer) {
      this.map.removeLayer(this.csvLayer);
      this.csvLayer = null;
    }
    if (this.platesLayerGroup) {
      this.platesLayerGroup.remove();
      this.platesLayerGroup = null;
    }
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
  color: red;              /* como en tu ejemplo */
  text-shadow: 1px 1px 2px white;
  pointer-events: none;    /* evita bloquear clics en el mapa */
}

.leaflet-tile-pane .vivo {
  filter: hue-rotate(0deg) saturate(1.5) brightness(0.9) contrast(1.1);
}
@media (max-width: 600px) 
{ 
  #map { height: 100vh; } 
}
.pulse 
{ 
  animation: pulsate 1s ease-out; opacity: 1; stroke-width: 2px; 
}
@keyframes pulsate { 
  0% { 
    fill: white; 
    opacity: 1; 
    stroke-width: 30px; 
    stroke: white; } 
  50% { 
    opacity: 0; 
  } 
  100% { 
    opacity: 1; } 
}
.loader { width: 50px; aspect-ratio: 1; display: grid; border: 4px solid #0000; border-radius: 50%; border-color: #ccc #0000; animation: l16 1s infinite linear; }
.loader::before, .loader::after { content: ""; grid-area: 1/1; margin: 2px; border: inherit; border-radius: 50%; }
.loader::before { border-color: #3388ff #0000; animation: inherit; animation-duration: .5s; animation-direction: reverse; }
.loader::after { margin: 8px; }
@keyframes l16 { 100% { transform: rotate(1turn); } }
</style>
