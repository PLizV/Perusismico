<template>
  <div>
    <div class="overflow-hidden fixed inset-0 bg-cover" id="map"></div>
    <!-- v-if="makerPopup" -->
  </div>
</template>

<script>
import axios from "axios";
import * as L from "leaflet/dist/leaflet-src.js";
import Papa from "papaparse";
import { DateTime } from "luxon";
import * as XLSX from "xlsx";
//import "leaflet.pattern";
import "leaflet/dist/leaflet.css";
import { useGeojsonStore } from "@/stores/geojson.js";

export default {
  data() {
    return {
      map: null,
      useGeojson: useGeojsonStore(),
      initialZoom: null,
      initialLatLeng: null,
      setData: null,
      csvLayer: null,
      flashInterval: null, // Para almacenar el intervalo de destello
      sumarProf: 0,
      intervalId: null,
      isGeoJSONProcessing: false,
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
    if (windowWidth <= 1920) {
      this.initialZoom = 2;
      this.initialLatLeng = [10, 0];
    } else {
      this.initialZoom = 3;
      this.initialLatLeng = [37, 0];
    }
    // Define límites (bounds) para evitar la repetición del mapa
    const southWest = L.latLng(-75, -270);
    const northEast = L.latLng(90, 210);
    const bounds = L.latLngBounds(southWest, northEast);
    // Inicializa el mapa
    this.map = L.map("map", {
      minZoom: this.initialZoom,
      maxZoom: 18,
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
    axios
      .get("/placas.json")

      .then((response) => {
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

    // Cargar el archivo CSV
    axios.get("/datas/data_noviembre.csv").then((response) => {
      Papa.parse(response.data, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const geoJSONData = this.convertCSVToGeoJSON(result.data);
          this.setData = result.data;
          this.addGeoJSONToMap(geoJSONData);
        },
      });
    });

    /*     axios
      .get("/datas/data_diciembre.xlsx", { responseType: "arraybuffer" })
      .then((response) => {
        const workbook = XLSX.read(response.data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(
          workbook.Sheets[firstSheetName]
        );
        console.log(sheetData);
        // Convertir `date` y `hour` a un formato ISO 8601 para la columna `time`
        const formattedData = sheetData.map((row) => {
          const { date, hour, ...rest } = row;
          const formattedTime = DateTime.fromFormat(
            `${date} ${hour}`,
            "dd/MM/yyyy HH:mm:ss"
          ).toISO();

          console.log(formattedData);
          return {
            ...rest,
            time: formattedTime,
          };
        });

        const geoJSONData = convertCSVToGeoJSON(formattedData); // Usa tu función existente
        this.setData = formattedData;
        this.addGeoJSONToMap(geoJSONData); // Usa tu lógica existente
      });

 */
  },
  watch: {
    "useGeojson.continente": "handleGeoJSONUpdate",
    "useGeojson.rangoFechas": "handleGeoJSONUpdate",
    "useGeojson.rangoMagnitud": "handleGeoJSONUpdate",
    "useGeojson.profundidad": "handleGeoJSONUpdate",
  },

  methods: {
    async handleGeoJSONUpdate() {
      if (this.isGeoJSONProcessing) return;
      this.isGeoJSONProcessing = true;

      const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
      this.addGeoJSONToMap(geoJSONData);

      // Reset after processing
      this.isGeoJSONProcessing = false;
    },
    convertCSVToGeoJSON(data) {
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

      // Filtrar por profunidad
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

      return {
        type: "FeatureCollection",
        features: filteredByDepth.map((row) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
          },
          properties: {
            mag: row.mag,
            place: row.place,
            time: row.time,
            depth: row.depth,
            magType: row.magType,
          },
        })),
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

      // Crear una nueva capa GeoJSON vacía
      this.csvLayer = L.geoJSON(null, {
        pointToLayer: (feature, latlng) => {
          // Definir el color basado en la profundidad
          let color = "#ff0000"; // Color por defecto RED

          if (feature.properties.depth > 300) {
            color = "#007aff"; // Profundos (> 300 km) BLUE
          } else if (
            feature.properties.depth >= 61 &&
            feature.properties.depth <= 300
          ) {
            color = "#39ff14"; // Intermedios (61 km - 300 km) GREEN
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
          } else if (magnitude > 7 && magnitude <= 9.5) {
            radius = 15;
          }

          return L.circleMarker(latlng, {
            className: "pulse",
            radius: radius + this.sumarProf,
            fillColor: color,
            /* CIRCULO COMPLETO
            opacity: 0.5,
            fillOpacity: 0.9,
            */
            /* CIRCULO HUECO */
            fillOpacity: 0,
            color: color,
          });
        },

        onEachFeature: (feature, layer) => {
          // Muestra un popup con la información del sismo
          layer.bindPopup(
            `Lugar: ${feature.properties.place}
            <br>
            Magnitud: ${feature.properties.mag} ${feature.properties.magType}
            <br>
            Profundidad: ${feature.properties.depth} km
            <br>
            Fecha: ${new Date(feature.properties.time).toLocaleString()}`
          );
        },
      }).addTo(this.map);

      // Ajustar el mapa a los límites definidos
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

      // Verifica si hay datos y ajusta el mapa a los límites
      if (geoJSON.features.length > 0) {
        this.map.fitBounds(bounds);
      }

      // Reiniciar `features` con los datos actuales
      const features = geoJSON.features; // Datos filtrados actuales
      const chunkSize = 1; // Tamaño del grupo - 10 en 10
      const segundos = 0.05; //cantidad de segundos - 1 segundo
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
    },

    /*  addGeoJSONToMap(geoJSON) {
      // Eliminar la capa CSV anterior si existe
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer);
      }

      // Crear un grupo de capas vacío para los puntos
      this.csvLayer = L.layerGroup().addTo(this.map);

      // Dividir los puntos en bloques de 10
      const features = geoJSON.features;
      const chunkSize = 1; // CANTIDAD DE PUNTOS APARECER
      let currentIndex = 0;

      const addChunk = () => {
        const chunk = features.slice(currentIndex, currentIndex + chunkSize);

        chunk.forEach((feature) => {
          const latlng = [
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
          ];

          // Definir el color basado en la profundidad
          let color = "#ff0000"; // Color por defecto RED
          if (feature.properties.depth > 300) {
            color = "#007aff"; // Profundos (> 300 km) BLUE
          } else if (
            feature.properties.depth >= 61 &&
            feature.properties.depth <= 300
          ) {
            color = "#39ff14"; // Intermedios (61 km - 300 km) GREEN
          } else if (feature.properties.depth <= 60) {
            color = "#ff0000"; // Superficiales (< 60 km) RED
          }

          // Definir el radio basado en la magnitud
          let radius = 1; // Radio por defecto
          const magnitude = feature.properties.mag;
          if (magnitude >= 4 && magnitude <= 5) {
            radius = 3.5;
          } else if (magnitude > 5 && magnitude <= 6) {
            radius = 4.5;
          } else if (magnitude > 6 && magnitude <= 7) {
            radius = 5.5;
          } else if (magnitude > 7 && magnitude <= 9.5) {
            radius = 13;
          }

          // Crear el marcador
          var marker = L.circleMarker(latlng, {
            radius: radius + this.sumarProf,
            fillColor: color,
            className: "pulse",
            color: "#000",
            weight: 0.5, // Borde
            opacity: 1,
            fillOpacity: 0.9,
          });
          // Agregar un popup
          marker.bindPopup(
            `Lugar: ${feature.properties.place}<br>Magnitud: ${
              feature.properties.mag
            }<br>Profundidad: ${
              feature.properties.depth
            } km<br>Fecha: ${new Date(
              feature.properties.time
            ).toLocaleString()}`
          );

          // Agregar el marcador al grupo
          this.csvLayer.addLayer(marker);
        });

        // Actualizar el índice y verificar si quedan más puntos
        currentIndex += chunkSize;
        if (currentIndex < features.length) {
          setTimeout(addChunk, 100); // CAMBIAR TIEMPO DE APARECION DE PUNTOS
        }
      };

      // Iniciar la animación
      addChunk();

      // Ajustar el mapa a los límites definidos
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

      if (features.length > 0) {
        this.map.fitBounds(bounds);
      }
    }, */
  },
  beforeUnmount() {
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
#map {
  width: 100%;
  width: 100%;
  z-index: 0;
}

.pulse {
  animation: pulsate 1s ease-out;
  opacity: 1;
  stroke-width: 0.04rem;
  /* stroke: white;  CIRCULO COMPLETO*/ 
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
</style>
