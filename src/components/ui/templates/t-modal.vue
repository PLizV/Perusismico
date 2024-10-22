<template>
  <div
    class="relative flex items-center pl-10 justify-start z-10 pt-[5.25rem] scroll-auto select-none"
  >
    <div class="px-4 pt-6 grid grid-cols-12 bg-white rounded-2xl w-[450px]">
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
      <div class="col-span-12 pl-3 pt-2">
        <div class="slider">
          <Slider
            v-model:value="magnitudeRange"
            :marks="marks"
            :min="4"
            :max="9.5"
            :step="0.1"
            :tooltipFormatter="customTooltipFormatter"
            range
            @change="handleChange"
          />
        </div>
      </div>

      <tLabel color="blue" size="md" weight="400" class="col-span-12 flex pl-4">
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
        <img
          :src="calendario"
          alt="img_calen"
          height="18"
          width="18"
          class="mr-1"
        />
        Seleccione un rango de años:
      </tLabel>

      <tCalendar class="col-span-6 mt-2 pl-4" :state="stateStartDate">
        <template v-slot:calendar>
          <VueDatePicker
            v-model="startDate"
            format="MMM/yyyy"
            locale="es"
            :autoApply="true"
            :disabled="disStartDate"
            month-picker
          ></VueDatePicker>
        </template>
        <template v-slot:name> Fecha de inicio </template>
        <template v-slot:error> {{ errStartDate }} </template>
      </tCalendar>
      <tCalendar class="col-span-6 mt-2 pl-4" :state="stateEndDate">
        <template v-slot:calendar>
          <VueDatePicker
            v-model="endDate"
            format="MMM/yyyy"
            locale="es"
            :autoApply="true"
            :disabled="disEndDate"
            month-picker
          ></VueDatePicker>
        </template>
        <template v-slot:name> Fecha de fín </template>
        <template v-slot:error> {{ errEndDate }} </template>
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
import tLabel from "@/components/ui/atoms/t-label.vue";
import tSelect from "@/components/ui/atoms/t-select.vue";
import profundidad from "@/assets/icons/profundidad.svg";
import gps from "@/assets/icons/gps.svg";
import magnitud from "@/assets/icons/magnitud.svg";
import calendario from "@/assets/icons/calendario.svg";
import VueDatePicker from "@vuepic/vue-datepicker";
import tCalendar from "@/components/ui/atoms/t-calendar.vue";
import { Slider } from "ant-design-vue";
const emit = defineEmits(["update-data"]);

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
const dataContinente = ref([
  { value: "suramerica", name: "America del sur" },
  { value: "centroamerica", name: "America central" },
  { value: "noramerica", name: "America del norte" },
  { value: "asia", name: "Ásia" },
  { value: "europa", name: "Europa" },
  { value: "africa", name: "Africa" },
  { value: "oceania", name: "Oceanía" },
]);
//MAGNITUD
const magnitudeRange = ref([4, 9.5]);
const marks = {
  4: "4",
  4.5: "4.5",
  5: "5",
  5.5: "5.5",
  6: "6",
  6.5: "6.5",
  7: "7",
  7.5: "7.5",
  8: "8",
  8.5: "8.5",
  9: "9",
  9.5: "9.5",
};
const handleChange = (value) => {
  console.log("Rango de magnitud actualizado:", value[0]);

  console.log(magnitudeRange.value);
  emit("update-data", {
    startDate: convertToDate(startDate.value),
    endDate: convertToDate(endDate.value),
    maxMag: value[0],
    minMag: value[1],
  });
};

const customTooltipFormatter = (value) => {
  return `M ${value.toFixed(1)}`; // Cambia el formato del tooltip
};

//FUNCION PARA CONVERTR FECHA
const convertToDate = (proxyObject) => {
  if (
    proxyObject &&
    proxyObject.month !== undefined &&
    proxyObject.year !== undefined
  ) {
    const date = new Date(proxyObject.year, proxyObject.month + 1);
    date.setDate(date.getDate() - 1);
    return date;
  }
  return null;
};

//StartDate
const startDate = ref({
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
});
const errStartDate = ref("Fecha inicio error");
const disStartDate = ref(false);
const stateStartDate = ref("enable");
watch(startDate, (newValue) => {
  const newStartDate = convertToDate(newValue);
  emit("update-data", {
    startDate: newStartDate,
    endDate: convertToDate(endDate.value),
    maxMag: magnitudeRange.value[0],
    minMag: magnitudeRange.value[1],
  });
});

//EndDate
const endDate = ref({
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
});
const errEndDate = ref("Fecha fin error");
const disEndDate = ref(false);
const stateEndDate = ref("enable");

watch(endDate, (newValue) => {
  const newEndDate = convertToDate(newValue);
  emit("update-data", {
    startDate: convertToDate(startDate.value),
    endDate: newEndDate,
    maxMag: magnitudeRange.value[0],
    minMag: magnitudeRange.value[1],
  });
});

//CHECK LIST
const items = ref([
  {
    key: "1",
    value: "Superficiales",
    name: "Superficiales (< 60km)🔴",
  },
  {
    key: "2",
    value: "Intermedios",
    name: "Intermedios (61km - 300km) 🟢",
  },
  {
    key: "3",
    value: "isDeep",
    name: "Profundos (> 300km) 🔵",
  },
]);
const checkedItems = ref([true, true, true]);
const maxSelection = ref(3);
const selectedCount = computed(
  () => checkedItems.value.filter((item) => item).length
);
const maxSelectionReached = computed(
  () => selectedCount.value >= maxSelection.value
);
const selectedItems = computed(() =>
  items.value.filter((item, index) => checkedItems.value[index])
);
const handleCheckboxChange = () => {
  const isSuperficial = checkedItems.value[0]; // Superficiales
  const isIntermediate = checkedItems.value[1]; // Intermedios
  const isDeep = checkedItems.value[2]; // Profundos

  // Imprimir en la consola los valores
  console.log("Superficiales:", isSuperficial);
  console.log("Intermedios:", isIntermediate);
  console.log("Profundos:", isDeep);

  // Emitir los valores dependiendo de lo seleccionado
  /*  emit("update-data", {
    startDate: convertToDate(startDate.value),
    endDate:  convertToDate(endDate.value),
    maxMag: magnitudeRange.value[0],
    minMag: magnitudeRange.value[1],
    isSuperficial, // Será true o false según el checkbox
    isIntermediate, // Será true o false según el checkbox
    isDeep, // Será true o false según el checkbox
  }); */
};
</script>
<style>
.ant-slider-mark {
  font-size: 5px; /* Cambia este valor para ajustar el tamaño de la fuente */
  color: #2f0f79; /* Cambia el color del texto */
}
.ant-slider-tooltip {
  font-size: 12px !important; /* Tamaño de la fuente */
}
.slider {
  width: 90%;
  max-width: 1000px;
  margin: 15px;
  padding: 6px 0;
  position: relative;
}

.slider input {
  --start: 10%;
  --stop: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: none;
  pointer-events: none;
  position: absolute;
  height: 4px;
  width: 100%;
}

.slider input:first-of-type {
  background-image: linear-gradient(
    to right,
    lightgrey var(--start),
    dodgerblue var(--start),
    dodgerblue var(--stop),
    lightgrey var(--stop)
  );
}

.slider ::-moz-range-thumb,
.slider ::-webkit-slider-thumb {
  cursor: pointer;
  pointer-events: auto;
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
