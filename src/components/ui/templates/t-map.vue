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
import "leaflet.pattern";
import "leaflet/dist/leaflet.css";
import circulo from "@/assets/icons/icircle.vue";
import carpeta from "@/assets/icons/vermas.vue";
import { useGeojsonStore } from "@/stores/geojson.js";

export default {
  components: {
    circulo,
    carpeta,
  },
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
        { attribution: attribution, noWrap: false }
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

    if (windowWidth < 991) {
      this.initialZoom = 2;
      this.initialLatLeng = [20, 0];
    } else {
      this.initialZoom = 3;
      this.initialLatLeng = [20, 0];
    }
    // Define límites (bounds) para evitar la repetición del mapa
    const southWest = L.latLng(-75, -270);
    const northEast = L.latLng(90, 210);
    const bounds = L.latLngBounds(southWest, northEast);
    // Inicializa el mapa
    this.map = L.map("map", {
      minZoom: 2,
      maxZoom: 18,
      center: this.initialLatLeng,
      zoom: this.initialZoom,
      layers: [luzNotable], // cambiar favorito
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
      .get(
        `${import.meta.env.VITE_LINK}:${import.meta.env.VITE_PORT}/placas.json`
      )

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
            style: function (feature) {
              return { color: "#fff" }; // Puedes personalizar el estilo aquí
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
    axios
      .get(`${import.meta.env.VITE_LINK}:${import.meta.env.VITE_PORT}/data.csv`)
      .then((response) => {
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
  },
  watch: {
    "useGeojson.continente": {
      async handler() {
        const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
        this.addGeoJSONToMap(geoJSONData);
      },
      deep: true,
    },
    "useGeojson.rangoFechas": {
      async handler() {
        const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
        this.addGeoJSONToMap(geoJSONData);
      },
      deep: true,
    },
    "useGeojson.rangoMagnitud": {
      async handler() {
        const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
        this.addGeoJSONToMap(geoJSONData);
      },
      deep: true,
    },
    "useGeojson.profundidad": {
      async handler() {
        const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
        this.addGeoJSONToMap(geoJSONData);
      },
      deep: true,
    },
  },

  methods: {
    convertCSVToGeoJSON(data) {
      console.log(this.useGeojson.continente);
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
          },
        })),
      };
    },
    /*     addGeoJSONToMap(geoJSON) {
      // Eliminar la capa CSV anterior si existe
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer); // Elimina la capa anterior del mapa
      }

      // Agregar la nueva capa al mapa
      this.csvLayer = L.geoJSON(geoJSON, {
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
            radius = 4.5;
          } else if (magnitude > 6 && magnitude <= 7) {
            radius = 5.5;
          } else if (magnitude > 7 && magnitude <= 9.5) {
            radius = 13;
          }

          return L.circleMarker(latlng, {
            className:'pulse',
            radius: radius + this.sumarProf,
            fillColor: color,
            opactiy: 0.5,
            color: "#000",
            weight: 0.5, //valor para el borde
            opacity: 1,
            fillOpacity: 0.9,
          });
        },

        onEachFeature: (feature, layer) => {
          // Muestra un popup con la información del sismo
          layer.bindPopup(
            `Lugar: ${feature.properties.place}<br>Magnitud: ${
              feature.properties.mag
            }<br>Profundidad: ${
              feature.properties.depth
            } km<br>Fecha: ${new Date(
              feature.properties.time
            ).toLocaleString()}`
          );
        },
      }).addTo(this.map); // Almacenar la nueva capa en this.csvLayer

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
    },
 */

    addGeoJSONToMap(geoJSON) {
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
    },
  },
  beforeUnmount() {
    // Limpiar el intervalo de destello al desmontar
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
    }
    this.map.remove();
  },
};
</script>

<style>
#map {
  width: 100%;
  z-index: 0;
}




.pulse{animation:flicker 1.5s linear infinite both} @keyframes flicker{0%,100%{opacity:1}41.99%{opacity:1}42%{opacity:0}43%{opacity:0}43.01%{opacity:1}47.99%{opacity:1}48%{opacity:0}49%{opacity:0}49.01%{opacity:1}}
</style>