:
<template>
  <div class="max-h-40 overflow-y-auto" ref="tableWrapper">
    <!-- Añade una referencia a la tabla -->
    <tLabel
      v-if="
        !(departamento && distrito && capa1) ||
        (!departamento && !distrito && capa1) ||
        (departamento && !distrito && capa1)
      "
      color="blue"
      size="xs"
      weight="400"
      class="col-span-12 flex text-sm py-3 pl-3"
    >
      <template v-if="!departamento && !distrito && !capa1">
        Debe seleccionar el departamento, la ciudad y el tipo de estudio.
      </template>
      <template v-else-if="departamento && !distrito && !capa1">
        Falta seleccionar la ciudad y el tipo de estudio.
      </template>
      <template v-else-if="departamento && distrito && !capa1">
        Falta seleccionar el tipo de estudio.
      </template>
      <template v-else-if="!departamento && !distrito && capa1">
        Falta seleccionar la ciudad y el distrito.
      </template>
      <template v-else-if="departamento && !distrito && capa1">
        Falta seleccionar la ciudad.
      </template>
    </tLabel>
    <div
      v-if="departamento && distrito && capa1"
      class="border-b border-igp-blue p-4"
    >
      <h1 class="text-igp-blue">1. {{ namecapa1 }}</h1>
      <ul class="mt-2" v-if="jsonleyendacapa1">
        <li
          class="flex mt-[8px]"
          v-for="(color, key) in filteredJson"
          :key="key"
        >
          <template v-if="typeGeometry === 'polyline'">
            <div class="p-1">
              <div
                class="circle-pattern-1 circleclass"
                v-if="
                  key ===
                  'Zona con amplificaciones máximas relativas > 2.5 veces'
                "
              />
              <div
                v-else-if="
                  key ===
                  'Suelo Tipo S4 - 1: Condiciones excepcionales (Efectos topográficos)'
                "
                class="circle-pattern-2 circleclass"
              />
              <div
                v-else-if="
                  key ===
                  'Suelo Tipo S4 - 2: Condiciones excepcionales (Flujos de detritos)'
                "
                class="circle-pattern-3 circleclass"
              />
              <tcircle
                v-else
                class="h-4 w-4 mt-[-2px]"
                :style="{ color: `rgba(${color[0]})` }"
              />
            </div>
            <label
              class="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
            >
              {{ key }} <span v-if="color[2]" class=""> ({{ color[2] }})</span>
            </label>
          </template>
          <template v-if="typeGeometry === 'line'">
            <label
              class="flex items-center text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
            >
              <div class="p-1">
                <div
                  class="h-1 w-4 mr-1"
                  :style="{ backgroundColor: `rgba(${color[0]})` }"
                />
              </div>
              {{ inputTextByCape }}
            </label>
          </template>
          <template v-if="typeGeometry === 'point'">
            <label
              class="flex items-center text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
            >
              <div class="p-1">
                <div class="h-2 w-2 rounded-full bg-red-600 mr-1" />
              </div>
              {{ inputTextByCape }}
            </label>
          </template>
        </li>
        <li v-if="idcapa1 === 'vibracion ambiental'" class="mt-[4px]">
          <span class="text-xs text-igp-black-1000">
            Nota: Para visualizar las fichas, hacer click en cada punto.</span
          >
        </li>
        <li
          v-if="idcapa1 === 'MASW MAM' || idcapa1 === 'tomografia electrica'"
          class="mt-[4px]"
        >
          <span class="text-xs text-igp-black-1000">
            Nota: Para visualizar las fichas, hacer click sobre la linea.</span
          >
        </li>
      </ul>
    </div>

    <div
      v-if="departamento && distrito && capa2"
      class="w-full border-b border-igp-blue p-4"
    >
      <h1 class="text-igp-blue">2. {{ namecapa2 }}</h1>
      <ul class="mt-2" v-if="jsonleyendacapa2">
        <li
          class="mt-[8px] flex"
          v-for="(color, key) in filteredJson2"
          :key="key"
        >
          <template v-if="typeGeometry2 === 'polyline'">
            <div class="p-1">
              <div
                class="circle-pattern-1 circleclass"
                v-if="
                  key ===
                  'Zona con amplificaciones máximas relativas > 2.5 veces'
                "
              />
              <div
                v-else-if="
                  key ===
                  'Suelo Tipo S4 - 1: Condiciones excepcionales (Efectos topográficos)'
                "
                class="circle-pattern-2 circleclass"
              />
              <div
                v-else-if="
                  key ===
                  'Suelo Tipo S4 - 2: Condiciones excepcionales (Flujos de detritos)'
                "
                class="circle-pattern-3 circleclass"
              />
              <tcircle
                v-else
                class="h-4 w-4 mt-[-2px]"
                :style="{ color: `rgba(${color[0]})` }"
              />
            </div>
            <label
              class="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
            >
              {{ key }} <span v-if="color[2]" class=""> ({{ color[2] }})</span>
            </label>
          </template>
          <template v-if="typeGeometry2 === 'line'">
            <label
              class="flex items-center text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
            >
              <div class="p-1">
                <div
                  class="h-1 w-4 mr-1"
                  :style="{ backgroundColor: `rgba(${color[0]})` }"
                />
              </div>
              {{ inputTextByCape2 }}
            </label>
          </template>
          <template v-if="typeGeometry2 === 'point'">
            <label
              class="flex items-center text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
            >
              <div class="p-1">
                <div class="h-2 w-2 rounded-full bg-red-600 mr-1" />
              </div>
              {{ inputTextByCape2 }}
            </label>
          </template>
        </li>
        <li v-if="idcapa2 === 'vibracion ambiental'" class="mt-[4px]">
          <span class="text-xs text-igp-black-1000">
            Nota: Para visualizar las fichas, hacer click en cada punto.</span
          >
        </li>
        <li
          v-if="idcapa2 === 'MASW MAM' || idcapa2 === 'tomografia electrica'"
          class="mt-[4px]"
        >
          <span class="text-xs text-igp-black-1000">
            Nota: Para visualizar las fichas, hacer click sobre la linea.</span
          >
        </li>
      </ul>
    </div>
    <div class="w-full border-t border-igp-blue py-4 px-5 flex items-center">
      <div class="circle-pattern-4 circleclass mr-2" />

      <h4
        v-if="!useGeojson.mapDistrito"
        class="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
      >
        {{ textoZonaCiudad }}
      </h4>
      <h4
        v-else
        class="text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
      >
        {{ textoZonaEstudio }}
      </h4>
    </div>
  </div>
</template>
<script>
import eye from "@/assets/icons/eye.vue";
import tLabel from "@/components/ui/atoms/t-label.vue";
import tcircle from "@/assets/icons/icircle.vue";

import { useGeojsonStore } from "@/stores/geojson.js";

export default {
  data() {
    return {
      dataDepartamentos: [],
      useGeojson: useGeojsonStore(),
      resultadoCapa1: null,
      resultadoCapa2: null,
      colorFeature: null,
      typeGeometry: null,
      typeGeometry2: null,
      inputTextByCape: null,
      inputTextByCape2: null,
      textoZonaCiudad: "Distritos de estudio",
      textoZonaEstudio: "Zona de estudio",
    };
  },
  props: {
    departamento: String,
    distrito: String,
    idcapa1: String,
    capa1: String,
    namecapa1: String,
    idcapa2: String,
    capa2: String,
    namecapa2: String,
    jsonleyendacapa1: Object,
    jsonleyendacapa2: Object,
  },
  components: {
    eye,
    tLabel,
    tcircle,
  },
  computed: {
    filteredJson() {
      const { geometria, ...rest } = this.jsonleyendacapa1;
      switch (geometria) {
        case "esriGeometryPolygon":
          this.typeGeometry = "polyline";
          break;
        case "esriGeometryPolyline":
          this.typeGeometry = "line";
          if (this.capa1 === "7") {
            this.inputTextByCape = "Ubicación de línea sísmica";
          } else if (this.capa1 === "8") {
            this.inputTextByCape = "Ubicación de línea eléctrica";
          }
          break;
        case "esriGeometryPoint":
          this.typeGeometry = "point";
          this.inputTextByCape = "Ubicación de registros";
          break;
        default:
          console.log("error");
          break;
      }
      const sortedKeys = Object.keys(rest).sort();
      const sortedJson = {};
      sortedKeys.forEach((key) => {
        sortedJson[key] = rest[key];
      });
      return sortedJson;
    },
    filteredJson2() {
      const { geometria, ...rest } = this.jsonleyendacapa2;
      switch (geometria) {
        case "esriGeometryPolygon":
          this.typeGeometry2 = "polyline";
          break;
        case "esriGeometryPolyline":
          this.typeGeometry2 = "line";
          if (this.capa2 === "7") {
            this.inputTextByCape2 = "Ubicación de línea sísmica";
          } else if (this.capa2 === "8") {
            this.inputTextByCape2 = "Ubicación de línea eléctrica";
          }
          break;
        case "esriGeometryPoint":
          this.typeGeometry2 = "point";
          this.inputTextByCape2 = "Ubicación de registros";
          break;
        default:
          console.log("error");
          break;
      }
      const sortedKeys = Object.keys(rest).sort();
      const sortedJson = {};
      sortedKeys.forEach((key) => {
        sortedJson[key] = rest[key];
      });
      return sortedJson;
    },
  },
  watch: {},
  updated() {},
  methods: {},
  mounted() {},
};
</script>
<style>
.circleclass {
  height: 14px;
  width: 14px;
  border-radius: 100%;
  border: 1px solid #457898;
}

.circle-pattern-1 {
  background-image: repeating-linear-gradient(
    135deg,
    #f21c1e 0,
    #f21c1e 1px,
    transparent 0,
    transparent 50%
  );
  background-size: 5px 5px;
  background-color: #ffffff;
}

.circle-pattern-2 {
  background-image: linear-gradient(#f21c1e 1px, transparent 1px),
    linear-gradient(to right, #f21c1e 1px, transparent 1px);
  background-size: 5px 5px;
  background-color: #ffffff;
  transform: rotate(45deg);
}

.circle-pattern-3 {
  background-image: radial-gradient(#f21c1e 2px, transparent 2px);
  background-size: 5px 5px;
  background-color: #ffffff;
}
.circle-pattern-4 {
  border: 2px solid #373fff;
  background-color: #ffffff;
}
</style>
