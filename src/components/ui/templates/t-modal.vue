<template>
  <div
    class="relative flex items-center pl-10 justify-start z-10 pt-[5.25rem] scroll-auto select-none"
  >
    <!-- Panel de control -->
    <div
  class="px-4 pt-2 grid grid-cols-1 md:grid-cols-12 bg-orange-50 rounded-2xl w-full max-w-full md:max-w-[450px] mt-4 mb-4 border border-orange-500"
>
<p class="col-span-12 font-light text-orange-600 text-base leading-[20px] px-3 py-2">
  <span class="font-semibold">Importante:</span> Configura libremente los
  parámetros sísmicos para ver los eventos en el visor.
</p>
</div>
    <div
      class="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-12 bg-white rounded-t-2xl w-full max-w-full md:max-w-[450px]"
    >
      <div class="col-span-1 sm:col-span-3 md:col-span-6 flex">
        <!-- Botón Global -->
        <button
          :disabled="ableGlobal"
          @click="setActiveTab('global')"
          :class="{
            'bg-white text-igp-blue font-semibold border-t border-l border-r':
              activeTab === 'global',
            'bg-igp-muted-100 text-igp-muted-400 border':
              activeTab !== 'global',
          }"
          class="flex items-center justify-center focus:outline-none w-full h-full py-5 rounded-tl-2xl"
        >
          <iconworld class="h-5 mr-1"></iconworld>
          Global
        </button>
      </div>

      <div class="col-span-1 sm:col-span-3 md:col-span-6 flex">
        <!-- Botón Perú -->
        <button
          :disabled="ablePeru"
          @click="setActiveTab('peru')"
          :class="{
            'bg-white text-igp-blue font-semibold border-t border-l border-r':
              activeTab === 'peru',
            'bg-igp-muted-100 text-igp-muted-400 border': activeTab !== 'peru',
          }"
          class="flex items-center justify-center focus:outline-none w-full h-full py-5 rounded-tr-2xl"
        >
          <iconworld class="h-5 mr-1"></iconworld>
          Perú
        </button>
      </div>
    </div>

    <div
      class="px-4 pt-3 grid grid-cols-1 md:grid-cols-12 bg-white rounded-b-2xl w-full max-w-full md:max-w-[450px]"
    >
        <tLabel
        v-if="activeTab === 'global'"
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex mt-2 ml-2"
      >
        <img :src="gps" alt="img_gps" height="20" width="20" class="mr-1" />
        Seleccione una ubicación:
      </tLabel>
      <tLabel
        v-if="activeTab === 'peru'"
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex mt-2 ml-2"
      >
        <img
          :src="idatabase"
          alt="img_db"
          height="20"
          width="20"
          class="mr-1"
        />
        Seleccione una base de datos sísmicos:
      </tLabel>

      <div
        v-if="activeTab === 'global'"
        class="grid grid-cols-1 md:grid-cols-12 col-span-12"
      >
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
          <template v-slot:error> {{ errContinente }} </template>
        </tSelect>
      </div>

      <div
        v-if="activeTab === 'peru'"
        class="grid grid-cols-1 md:grid-cols-12 col-span-12"
      >
        <tSelect
          class="col-span-12 pl-3 mt-2"
          :state="statePeru"
          v-bind:modelValue="selPeru"
          v-on:update:modelValue="selPeru = $event"
          :groupOpcion="false"
          isRequired="reqPeru"
          :selectedItems="dataPeru"
          @change="handleChangePE"
        >
          <template v-slot:name> Seleccionar historial</template>
          <template v-slot:error> {{ errPeru }} </template>
        </tSelect>
      </div>

      <tLabel
        v-if="activeTab === 'global'"
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex mt-4 ml-2"
      >
        <img
          :src="calendario"
          alt="img_calen"
          height="18"
          width="18"
          class="mr-1"
        />
        Seleccione un rango de años:
      </tLabel>

      <tCalendar
        v-if="activeTab === 'global'"
        class="col-span-6 mt-2 pl-4"
        :state="stateStartDate"
      >
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

      <tCalendar
        v-if="activeTab === 'global'"
        class="col-span-6 mt-2 pl-4"
        :state="stateEndDate"
      >
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
        <template v-slot:name> Fecha de fin </template>
        <template v-slot:error> {{ errEndDate }} </template>
      </tCalendar>

      <tLabel
        v-if="activeTab === 'peru'"
        color="darkMuted"
        size="md"
        weight="400"
        class="col-span-12 flex mt-4 ml-4"
      >
        <img
          :src="darkcalendario"
          alt="img_darkcalen"
          height="18"
          width="18"
          class="mr-1"
        />
        Seleccione un rango de años:
      </tLabel>

      <tCalendar
        v-if="activeTab === 'peru'"
        class="col-span-6 mt-2 pl-4"
        state="disable"
      >
        <template v-slot:calendar>
          <VueDatePicker
            v-model="startDate"
            format="MMM/yyyy"
            locale="es"
            :autoApply="true"
            :disabled="true"
            month-picker
          ></VueDatePicker>
        </template>
        <template v-slot:name> Fecha de inicio </template>
        <template v-slot:error> {{ errStartDate }} </template>
      </tCalendar>
      <tCalendar
        v-if="activeTab === 'peru'"
        class="col-span-6 mt-2 pl-4"
        state="disable"
      >
        <template v-slot:calendar>
          <VueDatePicker
            v-model="endDate"
            format="MMM/yyyy"
            locale="es"
            :autoApply="true"
            :disabled="true"
            month-picker
          ></VueDatePicker>
        </template>
        <template v-slot:name> Fecha de fín </template>
        <template v-slot:error> {{ errEndDate }} </template>
      </tCalendar>
      <tLabel
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex pt-2 items-center ml-4"
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
      <div class="col-span-12 pl-3">
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
                class="text-sm select-none font-light leading-6 text-igp-dark"
              >
                {{ item.name }}
                <span v-if="item.key === '1'" :style="redCircleStyle"></span>
                <span
                  v-else-if="item.key === '2'"
                  :style="greenCircleStyle"
                ></span>
                <span
                  v-else-if="item.key === '3'"
                  :style="blueCircleStyle"
                ></span>
              </label>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, watch, onMounted } from "vue";
import tLabel from "@/components/ui/atoms/t-label.vue";
import tSelect from "@/components/ui/atoms/t-select.vue";
import profundidad from "@/assets/icons/profundidad.svg";
import gps from "@/assets/icons/gps.svg";
import magnitud from "@/assets/icons/magnitud.svg";
import calendario from "@/assets/icons/calendario.svg";
import darkcalendario from "@/assets/icons/mutedCalendario.svg";
import iconworld from "@/assets/icons/world.vue";
import idatabase from "@/assets/icons/database.svg";
import VueDatePicker from "@vuepic/vue-datepicker";
import tCalendar from "@/components/ui/atoms/t-calendar.vue";
import { Slider } from "ant-design-vue";
const emit = defineEmits(["update-data", "update-limits"]);

const ablePeru = ref(false);
const ableGlobal = ref(true);
const activeTab = ref("global");
// Estilos para los círculos personalizados
const redCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  backgroundColor: "#FF0000", // Rojo
  borderRadius: "50%",
  marginRight: "5px",
  border: "1px solid black", // Borde negro delgado
};

const greenCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  backgroundColor: "#009900", // Verde
  borderRadius: "50%",
  marginRight: "5px",
  border: "1px solid black", // Borde negro delgado
};

const blueCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  backgroundColor: "#0000FF", // Azul
  borderRadius: "50%",
  marginRight: "5px",
  border: "1px solid black", // Borde negro delgado
};
function setActiveTab(tab) {
  activeTab.value = tab;

  if (tab === "peru") {
    selPeru.value = "actual";
    ablePeru.value = true;
    ableGlobal.value = false;
    emit("update-limits", {
      minLatitude: -18.35,
      maxLatitude: -0.03,
      minLongitude: -81.33,
      maxLongitude: -68.65,
    });

    const act = {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    };
    emit("update-data", {
      startDate: convertToDate({ month: 0, year: 1960 }),
      endDate: convertToDate(act),
      maxMag: magnitudeRange.value[0],
      minMag: magnitudeRange.value[1],
      ...selectionState.value,
    });
  } else {
    ablePeru.value = false;
    ableGlobal.value = true;
    selContinente.value = "";
    emit("update-limits", {
      minLatitude: -55.0,
      maxLatitude: 81.0,
      minLongitude: -168.0,
      maxLongitude: 180.0,
    });

    emit("update-data", {
      startDate: convertToDate(startDate.value),
      endDate: convertToDate(endDate.value),
      maxMag: magnitudeRange.value[0],
      minMag: magnitudeRange.value[1],
      ...selectionState.value,
    });
  }
}
/* 
import { useGeojsonStore } from "@/stores/geojson.js";

const useGeojson = useGeojsonStore();
const setEnableRange = ref(true);
const rangeInput = ref(null);
const setDefaultValueRange = ref(0.8); */

// PERU
const selPeru = ref("actual");
const statePeru = ref("enable");
const errPeru = ref("Peru error");
const dataPeru = ref([
  { value: "actual", name: "Sísmica actual 1960 - 2024" },
  { value: "historica", name: "Sísmica histórica 1471 - 1959" },
  { value: "amazonas", name: "Amazonas", boundaries: { minLatitude: -5.0, maxLatitude: -3.5, minLongitude: -78.5, maxLongitude: -76.5 } },
  { value: "ancash", name: "Áncash", boundaries: { minLatitude: -10.2, maxLatitude: -8.0, minLongitude: -78.5, maxLongitude: -76.5 } },
  { value: "apurimac", name: "Apurímac", boundaries: { minLatitude: -14.1, maxLatitude: -13.1, minLongitude: -74.2, maxLongitude: -72.5 } },
  { value: "arequipa", name: "Arequipa", boundaries: { minLatitude: -17.5, maxLatitude: -15.2, minLongitude: -73.0, maxLongitude: -71.0 } },
  { value: "ayacucho", name: "Ayacucho", boundaries: { minLatitude: -14.5, maxLatitude: -12.5, minLongitude: -75.0, maxLongitude: -73.0 } },
  { value: "cajamarca", name: "Cajamarca", boundaries: { minLatitude: -7.0, maxLatitude: -5.0, minLongitude: -79.5, maxLongitude: -77.5 } },
  { value: "callao", name: "Callao", boundaries: { minLatitude: -12.1, maxLatitude: -11.9, minLongitude: -77.3, maxLongitude: -77.1 } },
  { value: "cusco", name: "Cusco", boundaries: { minLatitude: -14.3, maxLatitude: -12.4, minLongitude: -73.4, maxLongitude: -70.6 } },
  { value: "huancavelica", name: "Huancavelica", boundaries: { minLatitude: -13.5, maxLatitude: -12.4, minLongitude: -75.5, maxLongitude: -74.2 } },
  { value: "huanuco", name: "Huánuco", boundaries: { minLatitude: -10.3, maxLatitude: -8.3, minLongitude: -76.5, maxLongitude: -74.0 } },
  { value: "ica", name: "Ica", boundaries: { minLatitude: -15.2, maxLatitude: -13.3, minLongitude: -76.7, maxLongitude: -75.0 } },
  { value: "junin", name: "Junín", boundaries: { minLatitude: -12.5, maxLatitude: -10.5, minLongitude: -76.8, maxLongitude: -74.9 } },
  { value: "la_libertad", name: "La Libertad", boundaries: { minLatitude: -8.5, maxLatitude: -6.8, minLongitude: -80.5, maxLongitude: -77.8 } },
  { value: "lambayeque", name: "Lambayeque", boundaries: { minLatitude: -7.0, maxLatitude: -5.5, minLongitude: -80.6, maxLongitude: -79.2 } },
  { value: "lima", name: "Lima", boundaries: { minLatitude: -12.9, maxLatitude: -10.6, minLongitude: -77.8, maxLongitude: -76.3 } },
  { value: "loreto", name: "Loreto", boundaries: { minLatitude: -5.3, maxLatitude: -0.0, minLongitude: -76.6, maxLongitude: -70.2 } },
  { value: "madre_de_dios", name: "Madre de Dios", boundaries: { minLatitude: -13.2, maxLatitude: -10.5, minLongitude: -70.8, maxLongitude: -68.7 } },
  { value: "moquegua", name: "Moquegua", boundaries: { minLatitude: -17.6, maxLatitude: -15.8, minLongitude: -71.8, maxLongitude: -70.4 } },
  { value: "pasco", name: "Pasco", boundaries: { minLatitude: -11.1, maxLatitude: -9.6, minLongitude: -76.8, maxLongitude: -75.1 } },
  { value: "piura", name: "Piura", boundaries: { minLatitude: -5.9, maxLatitude: -4.0, minLongitude: -81.1, maxLongitude: -79.3 } },
  { value: "puno", name: "Puno", boundaries: { minLatitude: -17.2, maxLatitude: -13.3, minLongitude: -70.0, maxLongitude: -68.6 } },
  { value: "san_martin", name: "San Martín", boundaries: { minLatitude: -8.8, maxLatitude: -6.0, minLongitude: -77.8, maxLongitude: -75.5 } },
  { value: "tacna", name: "Tacna", boundaries: { minLatitude: -18.0, maxLatitude: -16.2, minLongitude: -70.6, maxLongitude: -69.4 } },
  { value: "tumbes", name: "Tumbes", boundaries: { minLatitude: -4.3, maxLatitude: -3.2, minLongitude: -80.9, maxLongitude: -80.3 } },
  { value: "ucayali", name: "Ucayali", boundaries: { minLatitude: -10.6, maxLatitude: -7.0, minLongitude: -75.6, maxLongitude: -72.4 } },
]);

const handleChangePE = () => {
  const selectedDepartment = dataPeru.value.find(dept => dept.value === selPeru.value);

  if (selectedDepartment && selectedDepartment.boundaries) {
    emit("update-limits", selectedDepartment.boundaries);
  } else if (selPeru.value === "historica") {
    emit("update-data", {
      startDate: convertToDate({ month: 0, year: 1471 }),
      endDate: convertToDate({ month: 11, year: 1959 }),
    });
  } else if (selPeru.value === "actual") {
    const act = {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    };
    emit("update-data", {
      startDate: convertToDate({ month: 0, year: 1960 }),
      endDate: convertToDate(act),
    });
  }
};
//CONTINENTE
const selContinente = ref("");
const stateContinente = ref("enable");
const errContinente = ref("Continente error");
const dataContinente = ref([
  {
    value: "",
    name: "Todos Global",
    boundaries: {
      minLatitude: -55.0,
      maxLatitude: 81.0,
      minLongitude: -168.0,
      maxLongitude: 180.0,
    },
  },
  {
    value: "suramerica",
    name: "América del Sur",
    boundaries: {
      minLatitude: -55.0,
      maxLatitude: 12.0,
      minLongitude: -81.0,
      maxLongitude: -34.0,
    },
  },
  {
    value: "noramerica",
    name: "América del Norte",
    boundaries: {
      minLatitude: 23.0,
      maxLatitude: 50.0,
      minLongitude: -168.0,
      maxLongitude: -53.0,
    },
  },
  {
    value: "centroamerica",
    name: "América Central",
    boundaries: {
      minLatitude: 7.0,
      maxLatitude: 20.0,
      minLongitude: -92.0,
      maxLongitude: -77.0,
    },
  },
  {
    value: "asia",
    name: "Asia",
    boundaries: {
      minLatitude: 1.0,
      maxLatitude: 81.0,
      minLongitude: 26.0,
      maxLongitude: 169.0,
    },
  },
  {
    value: "europa",
    name: "Europa",
    boundaries: {
      minLatitude: 35.0,
      maxLatitude: 71.0,
      minLongitude: -31.0,
      maxLongitude: 50.0,
    },
  },
  {
    value: "africa",
    name: "África",
    boundaries: {
      minLatitude: -35.0,
      maxLatitude: 37.0,
      minLongitude: -17.0,
      maxLongitude: 51.0,
    },
  },
  {
    value: "oceania",
    name: "Oceanía",
    boundaries: {
      minLatitude: -55.0,
      maxLatitude: 0.0,
      minLongitude: 110.0,
      maxLongitude: 180.0,
    },
  },
]);

watch(selContinente, (newValue) => {
  const continenteSeleccionado = dataContinente.value.find(
    (continente) => continente.value === newValue
  );

  if (continenteSeleccionado) {
    const boundaries = continenteSeleccionado.boundaries;
    emit("update-limits", boundaries);
  }
});

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
let timeoutId = null;

const handleChange = (value) => {
  // Cancelar el timeout anterior si existe
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Configurar un nuevo timeout
  timeoutId = setTimeout(
    () => {
      if (activeTab.value === "global") {
        emit("update-data", {
          startDate: convertToDate(startDate.value),
          endDate: convertToDate(endDate.value),
          maxMag: value[0],
          minMag: value[1],
          ...selectionState.value,
        });
      } else if (activeTab.value === "peru") {
        handleChangePE();
      }
    },

    2000
  ); // Esperar 2 segundos
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
  year: new Date().getFullYear() - 2,
});
const errStartDate = ref("Fecha inicio error");
const disStartDate = ref(false);
const stateStartDate = ref("enable");

//EndDate
const endDate = ref({
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
});
const errEndDate = ref("Fecha fin error");
const disEndDate = ref(false);
const stateEndDate = ref("enable");

watch([startDate, endDate], ([newStartDate, newEndDate]) => {
  emit("update-data", {
    startDate: convertToDate(newStartDate),
    endDate: convertToDate(newEndDate),
    maxMag: magnitudeRange.value[0],
    minMag: magnitudeRange.value[1],
    ...selectionState.value,
  });
});

//CHECK LIST
const items = ref([
  {
    key: "1",
    value: "Superficiales",
    name: "Superficiales (< 60km)",
  },
  {
    key: "2",
    value: "Intermedios",
    name: "Intermedios (61km - 300km) ",
  },
  {
    key: "3",
    value: "isDeep",
    name: "Profundos (> 300km) ",
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
const selectionState = ref({
  isSuperficial: true,
  isIntermediate: true,
  isDeep: true,
});
const handleCheckboxChange = () => {
  const isSuperficial = checkedItems.value[0];
  const isIntermediate = checkedItems.value[1];
  const isDeep = checkedItems.value[2];

  // Actualizar el estado de selección
  selectionState.value = {
    isSuperficial,
    isIntermediate,
    isDeep,
  };

  // Emitir los valores dependiendo de lo seleccionado
  if (activeTab.value === "global") {
    emit("update-data", {
      startDate: convertToDate(startDate.value),
      endDate: convertToDate(endDate.value),
      maxMag: value[0],
      minMag: value[1],
      ...selectionState.value,
    });
  } else if (activeTab.value === "peru") {
    handleChangePE();
  }
};
</script>
<style>
.ant-slider-mark {
  font-size: 5px;
  /* Cambia este valor para ajustar el tamaño de la fuente */
  color: #2f0f79;
  /* Cambia el color del texto */
}

.ant-slider-tooltip {
  font-size: 12px !important;
  /* Tamaño de la fuente */
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