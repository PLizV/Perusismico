<template>
  <div class="tabs relative flex flex-col text-sm">
    <div class="flex justify-between">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="py-1 px-6 outline-none text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm 2xl:text-sm"
        :class="{
          'border-t border-l border-r border-igp-blue bg-igp-blue-100 text-igp-blue':
            activeTab === index,
          'border-transparent text-igp-dark-600': activeTab !== index,
        }"
        @click="activeTab = index"
      >
        <!-- Imprime el nombre de la pestaña -->
        {{ tab }}
        <!-- Si la pestaña actual es "Informes", imprime la cantidad de informes -->
        <span v-if="index === 0"> {{ cantinfo }}</span>
      </button>
    </div>
    <div class="tab-content border border-igp-blue w-full">
      <slot :name="tabs[activeTab]"></slot>
    </div>
  </div>
</template>
<script>
import { useGeojsonStore } from "@/stores/geojson.js";
export default {
  data() {
    return {
      useGeojson: useGeojsonStore(),
      activeTab: 0,
      tabs: ["Informes", "Leyenda", "Archivos"],
    };
  },
  props: {
    cantinfo: String,
  },
  watch: {
    "useGeojson.mapCapa1": {
      handler(newVal) {
        this.activeTab = 1;
      },
      deep: true,
    },
  },
};
</script>
