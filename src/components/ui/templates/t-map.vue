<template>
  <div>
    <div class="overflow-hidden fixed inset-0 bg-cover" id="map"></div>
    <!-- v-if="makerPopup" -->
  </div>
</template>

<script>
import axios from "axios";
import * as L from "leaflet/dist/leaflet-src.js";
import "leaflet.pattern";
import "leaflet/dist/leaflet.css";
import { useGeojsonStore } from "@/stores/geojson.js";
import circulo from "@/assets/icons/icircle.vue";
import carpeta from "@/assets/icons/vermas.vue";

export default {
  components: {
    circulo,
    carpeta,
  },
  data() {
    return {
      map: null,

      geoJSONLayer: null,
      prioGeoJSONLayer: null,
      geoLabelLayer: null,
      punto: null,
      anho: null,
      makerPopup: false,

      geoJSONLayer2: null,
      prioGeoJSONLayer2: null,
      geoLabelLayer2: null,
      punto2: null,
      anho2: null,
      makerPopup2: false,

      geoJSONLayerCapaZona: null,
      geoJSONLayerCapaDepartamento: null,
      useGeojson: useGeojsonStore(),
      capa1: "",
      capa2: "",
      departamento: "",
      ciudad: "",
      setZonaEstudio: false,
      markerIcon: null,
      prePunto: null,
      subcapamaker: null,
      defin: null,
      colorWhiteRed1: null,
      shape: null,
      colorWhiteRed2: null,
      Cpatter: null,
      circleRed: null,
      geoJSONLayerCapaLocalidades: null,
      geoJSONLayerCapaCiudades: null,

      initialZoom: null,
      initialLatLeng: null,
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
    axios.get("http://localhost:5173/placas.json").then((response) => {
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
  },
  watch: {},
  methods: {},
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
