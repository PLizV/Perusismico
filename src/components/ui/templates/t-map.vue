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
import { useGeojsonStore } from "@/stores/geojson.js";
import circulo from "@/assets/icons/icircle.vue";
import carpeta from "@/assets/icons/vermas.vue";
import "leaflet.markercluster/dist/MarkerCluster.css"; // Estilos de clustering
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster"; // Importar Leaflet MarkerCluster

export default {
  components: {
    circulo,
    carpeta,
  },
  props: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  data() {
    return {
      map: null,
      initialZoom: null,
      initialLatLeng: null,
      setData: null,
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
    this.initialZoom = windowWidth < 991 ? 5 : 6;
    this.initialLatLeng = windowWidth < 991 ? [-12.5, -76.0] : [-9.5, -76.0];

    // Define límites (bounds) para evitar la repetición del mapa
    const southWest = L.latLng(-75, -270);
    const northEast = L.latLng(90, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    // Inicializa el mapa
    this.map = L.map("map", {
      minZoom: 2,
      maxZoom: 18,
      center: this.initialLatLeng,
      zoom: this.initialZoom,
      layers: [luzNotable], // cambiar favorito
      fullscreenControlOptions: { position: "bottomright" },
      preferCanvas: true,
      maxBounds: bounds, // Fija los límites del mapa
      maxBoundsViscosity: 1.0,
    }).on("keydown", this.closePopupOnEscape);

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
    // Cada vez que startDate cambie
    startDate(newValue) {
      console.log("Fecha de inicio actualizada a:", newValue);
      this.convertCSVToGeoJSON(this.setData); // Llama a tu función de actualización
    },
    // Cada vez que endDate cambie
    endDate(newValue) {
      console.log("Fecha de fin actualizada a:", newValue);
      this.convertCSVToGeoJSON(this.setData); // Llama a tu función de actualización
    },
  },

  methods: {
    convertCSVToGeoJSON(data) {
      // Obtener la fecha de hace dos años
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const that = this;
      return {
        type: "FeatureCollection",
        features: data
          .filter((row) => {
            // Validar si la fecha es válida y está dentro de los últimos dos años
            const eventDate = new Date(row.time);
            return (
              !isNaN(row.latitude) &&
              !isNaN(row.longitude) &&
              row.latitude !== null &&
              row.longitude !== null &&
              eventDate >= that.startDate &&
              eventDate <= that.endDate
            );
          })
          .map((row) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(row.longitude),
                parseFloat(row.latitude),
              ],
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
    addGeoJSONToMap(geoJSON) {
      L.geoJSON(geoJSON, {
        pointToLayer: (feature, latlng) => {
          // Personalizar estilo según la profundidad
          let radius = 4;
          let color = "yellow"; // Color por defecto

          if (feature.properties.depth > 300) {
            radius = 4;
            color = "blue"; // Profundos (> 300 km)
          } else if (
            feature.properties.depth >= 61 &&
            feature.properties.depth <= 300
          ) {
            radius = 6;
            color = "green"; // Intermedios (61 km - 300 km)
          } else if (feature.properties.depth <= 60) {
            radius = 8;
            color = "red"; // Superficiales (< 60 km)
          }

          return L.circleMarker(latlng, {
            radius: radius,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
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
      }).addTo(this.map);
    },
  },
  beforeUnmount() {
    this.map.remove();
  },
};
</script>

<style>
#map {
  width: 100%;
  z-index: 0;
}
</style>
