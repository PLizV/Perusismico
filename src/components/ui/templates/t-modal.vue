<template>
  <div
    class="relative flex items-center pl-10 justify-start z-10 pt-[5.25rem] scroll-auto select-none"
  >
    <div class="px-4 py-6 grid grid-cols-12 bg-white rounded-2xl w-[450px]">
      <p class="col-span-12 font-light text-xs leading-[18px] ml-2">
        <span class="font-semibold"> Importante:</span> Configura libremente los
        parámetros sísmicos para ver los eventos en el visor.
      </p>
      <tLabel
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex mt-2 ml-4"
      >
        <img :src="gps" alt="img_gps" height="20" width="20" class="mr-1" />
        Seleccione una ubicación:
      </tLabel>
      <!-- DEPARTAMENTO -->
      <div class="grid grid-cols-12 col-span-12">
        <tSelect
          class="col-span-12 pl-3 mt-2"
          :state="stateContinente"
          v-bind:modelValue="selContinente"
          v-on:update:modelValue="selContinente = $event"
          :groupOpcion="false"
          isRequired="reqContinente"
          :selectedItems="dataContinente"
        >
          <template v-slot:name> Seleccionar continente </template>
          <template v-slot:elvalor>Todos global </template>
          <template v-slot:error> {{ errContinente }} </template>
        </tSelect>
      </div>
      <tLabel
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex pt-4 items-center ml-4"
      >
        <img
          :src="magnitud"
          alt="img_mag"
          height="16"
          width="16"
          class="mr-2"
        />
        Defina un rango de magnitud:
      </tLabel>

      <!-- SELECCION DE CAPAS CHECK -->
      <div class="col-span-12 pl-3 pt-2">INTRODUCIR RANGOS AQUI</div>
      <tLabel
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex pt-4 pl-4"
      >
        <img
          :src="profundidad"
          alt="img_prof"
          height="20"
          width="18"
          class="mr-2"
        />
        Escoja un rango de profundidad:
      </tLabel>
      <div class="col-span-12 mt-2 p-0">
        <div class="flex flex-col justify-between mb-4">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="flex items-center ml-8"
          >
            <div class="flex">
              <input
                type="checkbox"
                :id="'checkbox-' + index"
                v-model="checkedItems[index]"
                class="mr-4"
                :disabled="maxSelectionReached && !checkedItems[index]"
                :class="{
                  'cursor-not-allowed':
                    maxSelectionReached && !checkedItems[index],
                }"
                @change="handleCheckboxChange"
              />
              <label
                :for="'checkbox-' + index"
                :class="{
                  'font-light': checkedItems[index],
                  'font-semibold': checkedItems[index],
                  'hover:font-semibold':
                    !checkedItems.some((item) => item) ||
                    checkedItems.filter((item) => item).length < 2,
                }"
                class="text-sm select-none font-light leading-6 text-igp-dark"
              >
                {{ item.name }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <tLabel color="blue" size="md" weight="400" class="col-span-12 flex ml-4">
        <img :src="calendario" alt="img_calen" height="18" width="18" class="mr-1" />
        Seleccione un rango de años:
      </tLabel>
      <!-- DEPARTAMENTO -->
      <tCalendar class="col-span-12 mt-2 pl-4" :state="stateAnalisis">
        <template v-slot:calendar>
          <VueDatePicker
            id="rangeTimeAnalisis"
            v-model="inpAnalisis"
            format="MMM/yyyy"
            range
            :multi-calendars="{ count: 2 }"
            hide-offset-dates
            locale="es"
            autoAppl
            :autoApply="true"
            :disabled="disabledRangeTiempo"
          ></VueDatePicker>
        </template>
        <template v-slot:name> Periodo de análisis </template>
        <template v-slot:error> {{ errAnalisis }} </template>
      </tCalendar>
      <!--  <div class="col-span-5 pt-4">
        <tButton
          @click="actCompartir"
          class="mx-3 mb-1 w-full"
          color="grayState"
          size="md"
          round="md"
        >
          <img :src="share" class="w-[18px] h-[18px]" alt="" />
          Compartir
        </tButton>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";
import tLabel from "@/components/ui/atoms/t-label.vue";
import tSelect from "@/components/ui/atoms/t-select.vue";
import profundidad from "@/assets/icons/profundidad.svg";
import gps from "@/assets/icons/gps.svg";
import magnitud from "@/assets/icons/magnitud.svg";
import calendario from "@/assets/icons/calendario.svg";
import VueDatePicker from "@vuepic/vue-datepicker";
import tCalendar from "@/components/ui/atoms/t-calendar.vue";
/* 
import { useGeojsonStore } from "@/stores/geojson.js";

const useGeojson = useGeojsonStore();
const setEnableRange = ref(true);
const rangeInput = ref(null);
const setDefaultValueRange = ref(0.8); */

//CONTINENTE
const selContinente = ref("");
const stateContinente = ref("enable");
const errContinente = ref("Continente error");

//PERIODO DE ANALISIS
const inpAnalisis = ref();
const errAnalisis = ref("Periodo de analisis error");
const disabledRangeTiempo = ref(false);
const stateAnalisis = ref("enable");

//CHECK LIST
const items = ref([
  {
    key: "1",
    value: "todos",
    name: "Todos 🔴🟢🔵",
  },
  {
    key: "2",
    value: "superficial",
    name: "Superficiales < 60km 🔴",
  },
  {
    key: "3",
    value: "intermedio",
    name: "Intermedios 61km> <300km 🟢",
  },
  {
    key: "4",
    value: "profundos",
    name: "Profundos >300km 🔵",
  },
]);
const checkedItems = ref([true, false, false, false]);
const maxSelection = ref(3);
const selectedCount = computed(
  () => checkedItems.value.filter((item) => item).length
);
const maxSelectionReached = computed(
  () => selectedCount.value >= maxSelection.value
);

const dataContinente = ref([
  { value: "suramerica", name: "America del sur" },
  { value: "centroamerica", name: "America central" },
  { value: "noramerica", name: "America del norte" },
  { value: "asia", name: "Ásia" },
  { value: "europa", name: "Europa" },
  { value: "africa", name: "Africa" },
  { value: "oceania", name: "Oceanía" },
]);
</script>
<style>
#rangeTimeAnalisis .dp__input_reg {
    width: auto !important;
}
.tooltipmodal {
  position: relative;
  display: inline-block;
}

.tooltipmodal .tooltiptextmodal {
  visibility: hidden;
  background-color: rgb(160, 160, 160);
  color: white;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  padding: 5px 5px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -25px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltipmodal:hover .tooltiptextmodal {
  visibility: visible;
  opacity: 1;
}
</style>
