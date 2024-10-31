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

export default {
  components: {
    circulo,
    carpeta,
  },
  props: {
    alldata: {
      type: Object,
      required: true,
      default: () => ({
        startDate: null,
        endDate: null,
        maxMag: null,
        minMag: null,
        isSuperficial: null,
        isIntermediate: null,
        isDeep: null,
      }),
    },
    setlimits: {
      type: Object,
      required: true,
      default: () => ({
        minLatitude: null,
        maxLatitude: null,
        minLongitude: null,
        maxLongitude: null,
      }),
    },
  },
  data() {
    return {
      map: null,
      initialZoom: null,
      initialLatLeng: null,
      setData: null,
      csvLayer: null,
      flashInterval: null, // Para almacenar el intervalo de destello
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
      preferCanvas: true,
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
    // Observa el objeto dates completamente
    alldata: {
      async handler(newDates) {
        const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
        this.addGeoJSONToMap(geoJSONData);
      },
      deep: true,
    },
    setlimits: {
      async handler(newDates) {
        console.log("aaaa");
        const geoJSONData = await this.convertCSVToGeoJSON(this.setData);
        this.addGeoJSONToMap(geoJSONData);
      },
      deep: true,
    },
  },

  methods: {
    waveCircle(circleMarker, magnitude) {
      const originalRadius = circleMarker.options.radius; // Almacena el radio original
      let scale = 1; // Escala inicial
      let increasing = true; // Estado de crecimiento

      // Determinar el incremento de escala basado en la magnitud
      let scaleIncrement;
      if (magnitude >= 5.5 && magnitude < 7) {
        scaleIncrement = 0.025; // Menos intensidad para magnitudes entre 5.5 y 6.9
      } else if (magnitude >= 4 && magnitude < 5.5) {
        scaleIncrement = 0.015; // Mucho menos intensidad para magnitudes entre 4 y 5.4
      } else {
        scaleIncrement = 0.05; // Intensidad normal para magnitudes mayores o iguales a 7
      }

      this.waveInterval = setInterval(() => {
        if (increasing) {
          scale += scaleIncrement; // Aumentar la escala
          if (scale >= 1.4) { // Cambiar a decreciente
            increasing = false;
          }
        } else {
          scale -= scaleIncrement; // Disminuir la escala
          if (scale <= 1) { // Volver a la escala original
            increasing = true; // Cambiar a creciente
          }
        }

        // Aplicar el nuevo tamaño al círculo
        circleMarker.setStyle({
          radius: originalRadius * scale,
        });
      }, 200); // Intervalo para actualizar la animación
    },

    convertCSVToGeoJSON(data) {
      // Filtrar primero por latitud y longitud
      const filteredByCoordinates = data.filter((row) => {
        return (
          !isNaN(row.latitude) &&
          !isNaN(row.longitude) &&
          row.latitude !== null &&
          row.longitude !== null &&
          row.latitude >= this.setlimits.minLatitude &&
          row.latitude <= this.setlimits.maxLatitude &&
          row.longitude >= this.setlimits.minLongitude &&
          row.longitude <= this.setlimits.maxLongitude
        );
      });

      // Luego, filtrar por magnitud
      const filteredByMagnitude = filteredByCoordinates.filter((row) => {
        const mag = row.mag;
        return mag >= this.alldata.maxMag && mag <= this.alldata.minMag;
        
      });

      // Finalmente, filtrar por fecha
      const filteredByDate = filteredByMagnitude.filter((row) => {
        const eventDate = new Date(row.time);
        return (
          eventDate >= this.alldata.startDate &&
          eventDate <= this.alldata.endDate
        );
      });
      const filteredByDepth = filteredByDate.filter((row) => {
        const depth = row.depth;

        if (this.alldata.isSuperficial && depth <= 60) {
          return true;
        }
        if (this.alldata.isIntermediate && depth > 60 && depth <= 300) {
          return true;
        }
        if (this.alldata.isDeep && depth > 300) {
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
    addGeoJSONToMap(geoJSON) {
      // Eliminar la capa CSV anterior si existe
      if (this.csvLayer) {
        this.map.removeLayer(this.csvLayer); // Elimina la capa anterior del mapa
      }

      // Agregar la nueva capa al mapa
      this.csvLayer = L.geoJSON(geoJSON, {
        pointToLayer: (feature, latlng) => {
          // Definir el color basado en la profundidad
          let color = "red"; // Color por defecto

          if (feature.properties.depth > 300) {
            color = "blue"; // Profundos (> 300 km)
          } else if (
            feature.properties.depth >= 61 &&
            feature.properties.depth <= 300
          ) {
            color = "green"; // Intermedios (61 km - 300 km)
          } else if (feature.properties.depth <= 60) {
            color = "red"; // Superficiales (< 60 km)
          }

          // Definir el radio basado en la magnitud
          let radius = 4; // Radio por defecto
          const magnitude = feature.properties.mag;

          if (magnitude >= 4 && magnitude <= 5) {
            radius = 4;
          } else if (magnitude > 5 && magnitude <= 6) {
            radius = 6;
          } else if (magnitude > 6 && magnitude <= 7) {
            radius = 8;
          } else if (magnitude > 7 && magnitude <= 9.5) {
            radius = 15;
          }
          const circleMarker = L.circleMarker(latlng, {
            radius: radius,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
          if (magnitude >= 4) {
            this.waveCircle(circleMarker);
          }

          return circleMarker;
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
        [this.setlimits.minLatitude, this.setlimits.minLongitude],
        [this.setlimits.maxLatitude, this.setlimits.maxLongitude],
      ]);

      // Verifica si hay datos y ajusta el mapa a los límites
      if (geoJSON.features.length > 0) {
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
</style>
 