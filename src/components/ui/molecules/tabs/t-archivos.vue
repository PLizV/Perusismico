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
      class="w-full border-b border-igp-blue p-4"
    >
      <h1 class="text-igp-blue">1. {{ namecapa1 }}</h1>
      <ul
        class="mt-2"
        v-if="
          resultadoCapa1 &&
          resultadoCapa1.features &&
          resultadoCapa1.features.length
        "
      >
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa1 === 'vibracion ambiental' ||
              idcapa1 === 'MASW MAM' ||
              idcapa1 === 'tomografia electrica'
            "
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${linkcapa1}.zip`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo SHP
          </a>
          <a
            v-else-if="idcapa1 === 'zonificacion'"
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${linkcapa1}/zonificacion_sismica_geotecnica.zip`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo SHP
          </a>
          <a
            v-else
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${linkcapa1}/shp.zip`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo SHP
          </a>
        </li>
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa1 === 'vibracion ambiental' ||
              idcapa1 === 'MASW MAM' ||
              idcapa1 === 'tomografia electrica'
            "
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${linkcapa1}.kmz`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo KMZ
          </a>

          <a
            v-else
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${linkcapa1}/${resultadoCapa1.features[0].properties.archivo}.kmz`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo KMZ
          </a>
        </li>
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa1 === 'vibracion ambiental' ||
              idcapa1 === 'MASW MAM' ||
              idcapa1 === 'tomografia electrica' ||
              idcapa1 === 'zonificacion'
            "
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${tematico1}/${resultadoCapa1.features[0].properties.archivo}.webp`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar mapa Temático
          </a>
          <a
            v-else
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa1.features[0].properties.fecha}/${resultadoCapa1.features[0].properties.ciudad}/${linkcapa1}/${resultadoCapa1.features[0].properties.archivo}.pdf`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar mapa Temático
          </a>
        </li>
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa1 !== 'vibracion ambiental' &&
              idcapa1 !== 'MASW MAM' &&
              idcapa1 !== 'tomografia electrica'
            "
            class="underline flex items-center"
            target="_blank"
            :href="`https://ide.igp.gob.pe/geonetwork/srv/spa/catalog.search#/metadata/${resultadoCapa1.features[0].properties.metadata}`"
          >
            <vermas class="w-5 h-5 mr-2" />
            Ver en catálogo de metadatos
          </a>
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
      <ul
        class="mt-2"
        v-if="
          resultadoCapa2 &&
          resultadoCapa2.features &&
          resultadoCapa2.features.length
        "
      >
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa2 === 'vibracion ambiental' ||
              idcapa2 === 'MASW MAM' ||
              idcapa2 === 'tomografia electrica'
            "
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa2.features[0].properties.fecha}/${resultadoCapa2.features[0].properties.ciudad}/${linkcapa2}.zip`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo SHP
          </a>

          <a
            v-else
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa2.features[0].properties.fecha}/${resultadoCapa2.features[0].properties.ciudad}/${linkcapa2}/shp.zip`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo SHP
          </a>
        </li>
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa2 === 'vibracion ambiental' ||
              idcapa2 === 'MASW MAM' ||
              idcapa2 === 'tomografia electrica'
            "
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa2.features[0].properties.fecha}/${resultadoCapa2.features[0].properties.ciudad}/${linkcapa2}.kmz`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo KMZ
          </a>
          <a
            v-else
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa2.features[0].properties.fecha}/${resultadoCapa2.features[0].properties.ciudad}/${linkcapa2}/${resultadoCapa2.features[0].properties.archivo}.kmz`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar archivo KMZ
          </a>
        </li>
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa2 === 'vibracion ambiental' ||
              idcapa2 === 'MASW MAM' ||
              idcapa2 === 'tomografia electrica'
            "
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa2.features[0].properties.fecha}/${resultadoCapa2.features[0].properties.ciudad}/${tematico2}/${resultadoCapa2.features[0].properties.archivo}.webp`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar mapa Temático
          </a>
          <a
            v-else
            target="_blank"
            class="underline flex items-center"
            :href="`https://ide.igp.gob.pe/media/estudios_zonificacion/${resultadoCapa2.features[0].properties.fecha}/${resultadoCapa2.features[0].properties.ciudad}/${linkcapa2}/${resultadoCapa2.features[0].properties.archivo}.pdf`"
          >
            <carpeta class="w-5 h-5 mr-2" />
            Descargar mapa Temático
          </a>
        </li>
        <li class="mt-[8px]">
          <a
            v-if="
              idcapa2 !== 'vibracion ambiental' &&
              idcapa2 !== 'MASW MAM' &&
              idcapa2 !== 'tomografia electrica'
            "
            class="underline flex items-center"
            target="_blank"
            :href="`https://ide.igp.gob.pe/geonetwork/srv/spa/catalog.search#/metadata/${resultadoCapa2.features[0].properties.metadata}`"
          >
            <vermas class="w-5 h-5 mr-2" />
            Ver en catálogo de metadatos
          </a>
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
  </div>
</template>
<script>
import eye from "@/assets/icons/eye.vue";
import tLabel from "@/components/ui/atoms/t-label.vue";
import carpeta from "@/assets/icons/carpeta.vue";
import vermas from "@/assets/icons/vermas.vue";
import { useGeojsonStore } from "@/stores/geojson.js";

export default {
  data() {
    return {
      dataDepartamentos: [],
      useGeojson: useGeojsonStore(),
      isTableScrolled: false,
      resultadoCapa1: null,
      resultadoCapa2: null,
      colorFeature: null,
    };
  },
  props: {
    departamento: String,
    distrito: String,
    capa1: String,
    idcapa1: String,
    namecapa1: String,
    capa2: String,
    namecapa2: String,
    idcapa2: String,
    linkcapa1: String,
    linkcapa2: String,
    tematico1: String,
    tematico2: String,
  },
  components: {
    eye,
    tLabel,
    carpeta,
    vermas,
  },
  computed: {
    filteredData() {
      return this.datajson[this.departamento].sort((a, b) => a.ano - b.ano);
    },
  },
  watch: {
    departamento: function () {
      this.isTableScrolled = false;
    },

    departamento(newDepartamento, oldDepartamento) {
      this.ejecutarListGeojson();
      if (this.capa2) {
        this.ejecutarListGeojsonCapa2();
      }
    },
    distrito(newDistrito, oldDistrito) {
      this.ejecutarListGeojson();
      if (this.capa2) {
        this.ejecutarListGeojsonCapa2();
      }
    },
    capa1(newCapa1, oldCapa1) {
      this.ejecutarListGeojson();
    },
    capa2(newCapa2, oldCapa2) {
      this.ejecutarListGeojsonCapa2();
    },
  },
  updated() {
    if (this.$refs.tableWrapper.scrollTop > 0 && !this.isTableScrolled) {
      this.$refs.tableWrapper.scrollTop = 0;
      this.isTableScrolled = true;
    }
  },
  methods: {
    async ejecutarListGeojson() {
      if (this.departamento && this.distrito && this.capa1) {
        const resultado = await this.useGeojson.listGeojson(
          this.capa1,
          this.toUpperCase(this.departamento),
          this.distrito
        );
        this.resultadoCapa1 = resultado;
      }
    },
    async ejecutarListGeojsonCapa2() {
      if (this.departamento && this.distrito && this.capa2) {
        const resultado = await this.useGeojson.listGeojson(
          this.capa2,
          this.toUpperCase(this.departamento),
          this.distrito
        );
        this.resultadoCapa2 = resultado;
      }
    },
    quitarTildes(texto) {
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    toUpperCase(texto) {
      return texto.toUpperCase();
    },
  },
  mounted() {
    this.ejecutarListGeojson();
    this.ejecutarListGeojsonCapa2();
  },
};
</script>
