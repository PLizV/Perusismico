<template>
  <div class="relative border-2 border-red-600">
    <div
      v-if="noDataMessage"
      class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-[99999999]"
    >
      <div class="text-center flex flex-col items-center justify-center">
        <p style="color: #3388ff" class="text-lg font-semibold">
          No se encuentran datos para mostrar
        </p>
        <div class="no-data-message"></div>
      </div>
    </div>
    <!-- <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
    >
      <div class="text-center flex flex-col items-center justify-center">
        <p style="color: #3388ff" class="text-lg font-semibold">Cargando...</p>
        <div class="loader"></div>
      </div>
    </div> -->
    <div
      class="overflow-hidden inset-0 bg-cover absolute top-0 left-0 w-full h-screen z-1"
      id="map"
    >
      <div
        v-if="isLoading"
        class="rounded-md absolute z-[99999999] bg-white bg-opacity-50 inset-0 flex items-center justify-center"
      >
        <div class="text-center flex flex-col items-center justify-center">
          <p style="color: #3388ff" class="text-lg font-semibold">
            Cargando...
          </p>
          <div class="loader"></div>
        </div>
      </div>
    </div>
    <!-- v-if="makerPopup" -->
    <!-- Insertamos el SVG directamente sobre el mapa -->
    <svg
      id="overlay-svg"
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10;
      "
    >
      <!-- Aquí va el código SVG del mapa sombreado -->
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
      ></path>
    </svg>
  </div>
</template>
<script>
import axios from "axios";
import * as L from "leaflet/dist/leaflet-src.js";
import Papa from "papaparse";
/*import { DateTime } from "luxon";*/
/*import * as XLSX from "xlsx";*/
//import "leaflet.pattern";
import "leaflet/dist/leaflet.css";
import { useGeojsonStore } from "@/stores/geojson.js";
import { useDataStore } from "@/stores/data";
import { useConfigStore } from "@/stores/config";
export default {
  data() {
    return {
      isLoading: true,
      map: null,
      useGeojson: useGeojsonStore(),
      initialCenter: [-9.3, -75.0], // Coordenadas iniciales
      //initialCenter: [10, 0], // Coordenadas iniciales
      initialZoom: 1, // Zoom inicial*/
      /*initialZoom: null,*/
      initialLatLeng: null,
      setminzoom: null,
      setData: null,
      csvLayer: null,
      flashInterval: null, // Para almacenar el intervalo de destello
      sumarProf: 0,
      intervalId: null,
      isGeoJSONProcessing: false,
      geoJSONLayerCapaDepartamento: null,
      noDataMessage: null, // Nuevo estado para el mensaje
      dataStore: useDataStore(), // DATA FROM STORE
      configStore: useConfigStore(), // switch from store
    };
  },
  mounted() {
    var attribution =
      '&copy; <a href="httpS://osm.org/copyright">OpenStreetMap</a> contributors';
    var terreno = L.tileLayer(
        "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      google = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=m@113&hl=en&&x={x}&y={y}&z={z}",
        {
          attribution: attribution,
        }
      ),
      openstreet = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      satelital = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ),
      luzNotable = L.tileLayer(
        "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      viajero = L.tileLayer(
        "https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
        { attribution: attribution }
      ),
      gris = L.tileLayer(
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        { attribution: attribution }
      ),
      workstreet = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
        }
      ),
      worktopo = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
        }
      ),
      dark = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ),
      delimitaciones = L.tileLayer(
        "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: attribution }
      );
    const windowWidth = window.innerWidth;
    if (windowWidth <= 600) {
      this.initialZoom = 4;
      this.setminzoom = 2;
      this.initialLatLeng = [-9.5, -76.0]; // O cualquier otra coordenada que desees para esta condición
      //this.initialLatLeng = [10, 0]; // O cualquier otra coordenada que desees para esta condición
    } else if (windowWidth <= 1920) {
      this.setminzoom = 2;
      this.initialZoom = 6;
      this.initialLatLeng = [-9.3, -75.0];
      //this.initialLatLeng = [10, 0];
    } else {
      this.setminzoom = 3;
      this.initialZoom = 6;
      this.initialLatLeng = [-9.3, -75.0];
    }
    // Define límites (bounds) para evitar la repetición del mapa
    const southWest = L.latLng(-75, -720);
    const northEast = L.latLng(90, 720);
    const bounds = L.latLngBounds(southWest, northEast);
    // Inicializa el mapa
    this.map = L.map("map", {
      minZoom: this.setminzoom,
      maxZoom: 16,
      center: this.initialLatLeng,
      zoom: this.initialZoom,
      layers: [gris], // cambiar favorito
      fullscreenControlOptions: { position: "bottomright" },
      preferCanvas: false,
      maxBounds: bounds, // Fija los límites del mapa
      maxBoundsViscosity: 1.0,
    });
    const that = this;
    this.map.removeControl(this.map.zoomControl);
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(this.map);
    L.control
      .layers(
        {
          Satélite: satelital,
          Terreno: terreno,
          "Google maps": google,
          OpenStreetMap: openstreet,
          "Luz Notable": luzNotable,
          "Lona gris claro": gris,
          Viajero: viajero,
          Workstreet: workstreet,
          WorkTopography: worktopo,
          Noche: dark,
        },
        { Delimitaciones: delimitaciones },
        { position: "bottomright" }
      )
      .addTo(this.map);
    // Cargar el archivo GeoJSON usando axios
    axios.get("/placas.json").then((response) => {
      // Crear clones del GeoJSON para simular repetición
      const repeatOffsets = [
        [0, -360],
        [0, 360],
        [0, 0],
        [360, 0],
        [-360, 0], // Estas son longitudes para replicar el GeoJSON (puedes ajustar más offsets)
      ];
      repeatOffsets.forEach((offset) => {
        const geoJSONLayerClone = L.geoJSON(response.data, {
          style: function () {
            return {
              color: "#fff", // Color del borde
              weight: 0.5, // Grosor del borde más delgado (ajústalo a tu gusto)
              opacity: 1, // Opacidad del borde
              fillOpacity: 0.5, // Opacidad del relleno (ajústalo si lo deseas)
            };
          },
          onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(feature.properties.name); // Muestra un popup con la propiedad 'name'
            }
          },
        }).addTo(that.map);
        // Mueve el clon de la capa por las coordenadas
        geoJSONLayerClone.eachLayer((layer) => {
          layer.setLatLngs(
            layer.getLatLngs().map((point) => [
              point.lat,
              point.lng + offset[0], // Desplaza longitudinalmente para repetir
            ])
          );
        });
      });
    });

    this.getDataPeru();
    this.fetchDataCapaDepartamentosCenter("peru");
  },
  watch: {
    "configStore.switchStatus"(newValue) {
      this.isLoading = true;
      if (newValue) {
        if (this.configStore.switchStatus === "global") {
          this.isLoading = true;
          this.getDataGlobal();
        } else if (this.configStore.switchStatus === "peru") {
          this.isLoading = true;
          this.getDataPeru();
        }
      }
    },
    "useGeojson.continente": "handleGeoJSONUpdate",
    "useGeojson.rangoFechas": "handleGeoJSONUpdate",
    "useGeojson.rangoMagnitud": "handleGeoJSONUpdate",
    "useGeojson.profundidad": "handleGeoJSONUpdate",
    "useGeojson.setZoom": function (newVal) {
      if (newVal) {
        // Cuando setZoom es true, aumenta el zoom y guarda el valor previo
        this.zoomIn();
      } else {
        // Cuando setZoom es false, regresa al zoom previo
        this.zoomOut();
      }
    },
    "useGeojson.departamento": function (newVal) {
      this.clearDepartamentos();
      if (newVal !== "global") {
        this.fetchDataCapaDepartamentosCenter(newVal);
      }
    },
  },
  methods: {
    zoomIn() {
      if (this.map) {
        // Guardamos el zoom actual antes de aumentar el zoom
        this.previousZoom = this.map.getZoom();
        // Aumentamos el zoom en 2 niveles
        let newZoom = this.previousZoom + 1; // CAMBIAR AQUI LA CANTIDAD DEL ZOOM
        // Asegurarse de no exceder el zoom máximo
        newZoom = Math.min(newZoom, this.map.getMaxZoom());
        // Establecemos el nuevo zoom
        this.map.setZoom(newZoom);
      }
    },
    zoomOut() {
      if (this.map && this.previousZoom !== null) {
        // Si existe un zoom previo, regresamos a ese valor
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
      const repeatOffsets = [
        [0, -360],
        [0, 360],
        [0, 0],
        [360, 0],
        [-360, 0],
      ];

      // Filtrar por latitud y longitud
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

      // Filtrar por magnitud
      const filteredByMagnitude = filteredByCoordinates.filter((row) => {
        const mag = row.mag;
        return (
          mag >= this.useGeojson.rangoMagnitud.maxMag &&
          mag <= this.useGeojson.rangoMagnitud.minMag
        );
      });

      // Filtrar por fecha
      const filteredByDate = filteredByMagnitude.filter((row) => {
        const eventDate = new Date(row.time);
        return (
          eventDate >= this.useGeojson.rangoFechas.startDate &&
          eventDate <= this.useGeojson.rangoFechas.endDate
        );
      });

      // Filtrar por profundidad
      const filteredByDepth = filteredByDate.filter((row) => {
        const depth = row.depth;
        if (this.useGeojson.profundidad.isSuperficial && depth <= 60) {
          return true;
        }
        if (
          this.useGeojson.profundidad.isIntermediate &&
          depth > 60 &&
          depth <= 300
        ) {
          return true;
        }
        if (this.useGeojson.profundidad.isDeep && depth > 300) {
          return true;
        }
        return false; // No cumple con las condiciones de profundidad
      });

      // Aplicar los offsets a los datos filtrados
      let features = [];

      filteredByDepth.forEach((row) => {
        repeatOffsets.forEach((offset) => {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(row.longitude) + offset[0], // Aplicar desplazamiento en longitud
                parseFloat(row.latitude) + offset[1], // Aplicar desplazamiento en latitud
              ],
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

      return {
        type: "FeatureCollection",
        features: features,
      };
    },
    addGeoJSONToMap(geoJSON) {
      // Eliminar la capa CSV anterior si existe
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer); // Elimina la capa anterior
        this.csvLayer = null; // Limpia la referencia
      }
      // Detener cualquier intervalo en ejecución
      if (this.intervalId) {
        clearInterval(this.intervalId); // Detener el intervalo anterior
        this.intervalId = null; // Reiniciar la variable
      }
      // Verificar si hay datos
      if (geoJSON.features.length === 0) {
        // Mostrar mensaje de "No se encontraron datos"
        this.noDataMessage =
          "No se encontraron datos para el rango de fecha solicitado.";
        return; // Salir del método si no hay datos
      } else {
        // Ocultar el mensaje si hay datos
        this.noDataMessage = null;
      }

      // Crear una nueva capa GeoJSON vacía
      this.csvLayer = L.geoJSON(null, {
        pointToLayer: (feature, latlng) => {
          // Definir el color basado en la profundidad
          let color = "#ff0000"; // Color por defecto RED
          if (feature.properties.depth > 300) {
            color = "#002FEF"; // Profundos (> 300 km) BLUE
          } else if (
            feature.properties.depth > 60 &&
            feature.properties.depth <= 300
          ) {
            color = "#0AB427"; // Intermedios (61 km - 300 km) GREEN
          } else if (feature.properties.depth <= 60) {
            color = "#ff0000"; // Superficiales (< 60 km) RED
          }
          // Definir el radio basado en la magnitud
          let radius = 1; // Radio por defecto
          const magnitude = feature.properties.mag;

          if (magnitude >= 4 && magnitude <= 5) {
            radius = 3.5;
          } else if (magnitude > 5 && magnitude <= 6) {
            radius = 5.5;
          } else if (magnitude > 6 && magnitude <= 7) {
            radius = 8.5;
          } else if (magnitude > 7 && magnitude <= 8) {
            radius = 15;
          } else if (magnitude > 8 && magnitude <= 9.5) {
            radius = 23;
          }
          return L.circleMarker(latlng, {
            className: "pulse",
            radius: radius + this.sumarProf,
            fillColor: color,
            /* CIRCULO COMPLETO
            opacity: 0.5,
            fillOpacity: 0.9,*/
            /* CIRCULO HUECO  */
            fillOpacity: 0,
            color: color,
          });
        },
        onEachFeature: (feature, layer) => {
          // Muestra un popup con la información del sismo
          layer.bindPopup(
            `Lugar: ${feature.properties.place}
            <br>
            Magnitud: ${feature.properties.mag}
            <br>
            Profundidad: ${feature.properties.depth} km
            <br>
            Fecha: ${new Date(feature.properties.time).toLocaleString()} (GMT)`
          );
        },
      }).addTo(this.map);
      // Establecer los límites
      const bounds = L.latLngBounds([
        [
          this.useGeojson.continente.minLatitude,
          this.useGeojson.continente.minLongitude,
        ],
        [
          this.useGeojson.continente.maxLatitude,
          this.useGeojson.continente.maxLongitude,
        ],
      ]);

      // Comprobar si los límites corresponden con los valores dados

      // Verifica si hay datos y ajusta el mapa a los límites
      if (geoJSON.features.length > 0) {
        this.map.fitBounds(bounds);
      }
      // Reiniciar `features` con los datos actuales
      const features = geoJSON.features; // Datos filtrados actuales
      const chunkSize = 1; // Tamaño del grupo - 10 en 10
      const segundos = 0.002; //cantidad de segundos - 1 segundo
      let index = 0; // Índice inicial
      // Añadir los puntos en intervalos
      const addPointsInChunks = () => {
        if (
          index >= features.length ||
          this.useGeojson.estadoPl === "disable"
        ) {
          clearInterval(this.intervalId); // Detener el intervalo al finalizar
          this.useGeojson.estadoPl = "disable";
          return;
        }
        // Seleccionar el siguiente grupo de puntos
        const chunk = features.slice(index, index + chunkSize);
        chunk.forEach((feature) => {
          this.csvLayer.addData(feature); // Agregar los puntos al mapa
        });
        index += chunkSize; // Avanzar el índice
      };
      // Iniciar un nuevo intervalo
      this.intervalId = setInterval(addPointsInChunks, segundos * 1000);
      if (
        this.useGeojson.continente.minLatitude === -55.0 &&
        this.useGeojson.continente.maxLatitude === 81.0 &&
        this.useGeojson.continente.minLongitude === -168.0 &&
        this.useGeojson.continente.maxLongitude === 180.0
      ) {
        const defaultCenter = [20.0, -190.0]; // Centro predefinido
        this.map.setView(defaultCenter, 2); // Mantener el zoom actual
      } else {
        // Si los límites no son los esperados, ajusta el mapa a los límites definidos
        this.map.fitBounds(bounds);
      }
    },
    fetchDataCapaDepartamentosCenter(val) {
      let getApiGeoJson = null;
      if (val === "peru") {
        // getApiGeoJson = "/datas/departamentos.geojson";
        getApiGeoJson = "/datas/peru.geojson";
      } else {
        getApiGeoJson = `https://ide.igp.gob.pe/arcgis/rest/services/mapabase/MapaBase/MapServer/10/query?where=DEPARTAMEN+%3D+%27${val}%27&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson`;
      }
      // https://ide.igp.gob.pe/arcgis/rest/services/mapabase/MapaBase/MapServer/10/query?where=DEPARTAMEN+%3D+%27TUMBES%27+OR++DEPARTAMEN+%3D+%27LIMA%27++OR++DEPARTAMEN+%3D+%27UCAYALI%27+OR++DEPARTAMEN+%3D+%27TACNA%27+OR++DEPARTAMEN+%3D+%27PUNO%27++OR++DEPARTAMEN+%3D+%27PASCO%27++OR++DEPARTAMEN+%3D+%27LORETO%27++OR++DEPARTAMEN+%3D+%27LORETO%27++OR++DEPARTAMEN+%3D+%27LAMBAYEQUE%27++OR++DEPARTAMEN+%3D+%27JUNIN%27++OR++DEPARTAMEN+%3D+%27ICA%27++OR++DEPARTAMEN+%3D+%27HUANCAVELICA%27++OR++DEPARTAMEN+%3D+%27CUSCO%27++OR++DEPARTAMEN+%3D+%27CUSCO%27++OR++DEPARTAMEN+%3D+%27MADRE DE DIOS%27++OR++DEPARTAMEN+%3D+%27CAJAMARCA%27++OR++DEPARTAMEN+%3D+%27AYACUCHO%27++OR++DEPARTAMEN+%3D+%27AREQUIPA%27++OR++DEPARTAMEN+%3D+%27APURIMAC%27++OR++DEPARTAMEN+%3D+%27ANCASH%27++OR++DEPARTAMEN+%3D+%27PIURA%27++OR++DEPARTAMEN+%3D+%27AMAZONAS%27++OR++DEPARTAMEN+%3D+%27LA LIBERTAD%27++OR++DEPARTAMEN+%3D+%27MOQUEGUA%27++OR++DEPARTAMEN+%3D+%27SAN MARTIN%27++OR++DEPARTAMEN+%3D+%27HUANUCO%27&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson
      axios
        .get(getApiGeoJson)
        .then((response) => {
          this.geoJSONLayerCapaDepartamento = L.geoJSON(response.data, {
            style: function () {
              return {
                color: "#3388ff", // Color de los bordes
                weight: 3, // Grosor de los bordes
                fillOpacity: 0, // Sin color de fondo (transparente)
              };
            },
          });
          // this.map.fitBounds(this.geoJSONLayerCapaDepartamento.getBounds());
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
            // Asumimos que fetchDataPeru actualiza los datos en `dataStore` de alguna manera.
            const storeCombined = this.dataStore.combinedData;
            const storeGeoJSONData = this.convertCSVToGeoJSON(storeCombined);
            this.setData = storeCombined;
            this.addGeoJSONToMap(storeGeoJSONData);
            this.isLoading = this.dataStore.isLoadingPeru;
          })
          .catch((error) => {
            console.error("Error fetching data for Peru:", error);
            this.isLoading = this.dataStore.isLoadingPeru; // Asegúrate de marcarlo como no cargando, incluso si hay un error.
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
            this.isLoading = this.dataStore.isLoadingGlobal; // Asegúrate de marcarlo como no cargando, incluso si hay un error.
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
    // Detener cualquier intervalo en ejecución al desmontar
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Eliminar capas del mapa si es necesario
    if (this.csvLayer) {
      this.map.removeLayer(this.csvLayer);
      this.csvLayer = null;
    }
    // Limpiar el mapa
    if (this.map) {
      this.map.off(); // Desvincula todos los eventos
      this.map.remove(); // Elimina el mapa
      this.map = null;
    }
  },
};
</script>
<style>
@media (max-width: 600px) {
  #map {
    height: 70vh;
  }
}
.pulse {
  animation: pulsate 1s ease-out;
  opacity: 1;
  stroke-width: 1px;
  /*stroke: white;  CIRCULO COMPLETO*/
}
@keyframes pulsate {
  0% {
    fill: white;
    opacity: 1;
    stroke-width: 15px;
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
  animation-duration: 0.5s;
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
