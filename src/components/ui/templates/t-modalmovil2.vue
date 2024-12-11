<template>
  <div
    class="flex items-center px-4 sm:px-4 md:px-0 lg:px-4 xl:px-0 2xl:px-0 ml-0 sm:ml-0 md:ml-8 lg:ml-10 xl:ml-14 2xl:ml-20 justify-start z-10 scroll-auto select-none relative"
  >
    <!-- Panel de control -->

    <div
      class="fixed px-2 mt-3 grid grid-cols-12 bg-[#FCFDFF] rounded-2xl border border-b border-igp-blue shadow-[0px_4px_4px_0px_#00000024] w-[400px] sm:w-[400px] md:w-[400px] lg:w-[490px] xl:w-[490px] 2xl:w-[490px]"
      ref="draggableDiv"
      :class="{ 'transition-transform duration-300': isAnimating }"
    >
      <div
        class="h-1 rounded-xl bg-igp-muted cursor-pointer col-span-4 flex mt-3 col-start-5"
        @click="toggleOpen"
      ></div>
      <div class="grid grid-cols-12 col-span-12 mt-3">
        <div class="col-span-6">
          <!-- Botón Global -->
          <button
            :disabled="ableGlobal"
            @click="setActiveTab('global')"
            :class="{
              'bg-igp-blue text-igp-white font-semibold':
                activeTab === 'global',
              'bg-igp-white text-igp-muted-400 hover:text-igp-blue hover:font-medium  hover:border-igp-blue':
                activeTab !== 'global',
            }"
            class="flex items-center justify-center focus:outline-none w-full h-full py-3 border-y-2 border-l-2 rounded-l-3xl text-sm"
          >
            <iconworld class="h-5 mr-1"></iconworld>
            Global
          </button>
        </div>

        <div class="col-span-6 flex">
          <!-- Botón Perú -->
          <button
            :disabled="ablePeru"
            @click="setActiveTab('peru')"
            :class="{
              'bg-igp-blue text-igp-white font-semibold': activeTab === 'peru',
              'bg-igp-white text-igp-muted-400 hover:text-igp-blue hover:font-medium  hover:border-igp-blue':
                activeTab !== 'peru',
            }"
            class="flex items-center justify-center focus:outline-none w-full h-full py-3 border-y-2 border-r-2 rounded-r-3xl text-sm"
          >
            <iconperu class="absolute h-8 mr-14 mt-1"></iconperu>
            Perú
          </button>
        </div>
      </div>

      <span class="text-igp-dark-300 col-span-12 text-xs px-3 mt-3">
        Para visualizar los sismos, primero seleccione la región, el periodo de
        datos, el rango de magnitud y profundidad de los sismos.
      </span>

      <div
        v-if="activeTab === 'global'"
        class="grid grid-cols-1 md:grid-cols-12 col-span-12 mt-2"
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
          <template v-slot:name> Región o área de interés: </template>
          <template v-slot:error> {{ errContinente }} </template>
        </tSelect>
      </div>

      <div
        v-if="activeTab === 'peru'"
        class="grid grid-cols-1 md:grid-cols-12 col-span-12 mt-2"
      >
        <tSelect
          class="col-span-12 pl-3 mt-2"
          :state="statePeru"
          v-bind:modelValue="selPeru"
          v-on:update:modelValue="selPeru = $event"
          :groupOpcion="false"
          isRequired="reqPeru"
          :selectedItems="dataPeru"
        >
          <template v-slot:name> Seleccionar historial</template>
          <template v-slot:error> {{ errPeru }} </template>
        </tSelect>
      </div>

      <tLabel
        color="blue"
        size="md"
        weight="400"
        class="col-span-12 flex mt-4 ml-4"
      >
        <img
          :src="calendario"
          alt="img_calen"
          height="18"
          width="18"
          class="mr-[6px]"
        />
        Periodo de años
        <span class="text-xs text-center flex justify-center items-center ml-1"
          >(desde 1960 hasta la fecha)
        </span>
        :
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
            style="color: blue !important"
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
        <template v-slot:name> Fecha de fin </template>
        <template v-slot:error> {{ errEndDate }} </template>
      </tCalendar>

      <div class="grid grid-cols-12 col-span-12 border ml-2 py-3 rounded-lg">
        <div class="col-span-12 flex items-center">
          <tLabel
            color="blue"
            size="md"
            weight="400"
            class="flex items-center ml-2"
          >
            <img
              :src="magnitud"
              alt="img_mag"
              height="16"
              width="16"
              class="mr-2"
            />
            Rango de magnitud:
          </tLabel>
        </div>
        <!-- SELECCION DE CAPAS CHECK -->
        <div class="col-span-12 pl-1 mt-2">
          <div class="slider focus:outline-none">
            <Slider
              v-model:value="magnitudeRange"
              :marks="marks"
              :min="4"
              :max="9.5"
              :step="0.1"
              :tooltipFormatter="customTooltipFormatter"
              range
              :disabled="disabledSlider"
            />
          </div>
        </div>
        <div class="col-span-12 flex items-center justify-center mt-2">
          <button
            data-tooltip-target="tooltip-defaultP"
            type="button"
            class="border-2 mr-2 rounded-lg px-6 py-2 items-center"
            :class="
              statePlay === 'enable'
                ? ' text-igp-blue hover:text-igp-blue-500 border-igp-blue'
                : 'bg-gray-100 text-igp-dark-500 select-none cursor-not-allowed borde-igp-dark-500'
            "
            @click="togglePlay"
            :disabled="statePlay === 'disable'"
          >
            <iplay class="w-4 h-4"></iplay>
          </button>
          <div
            id="tooltip-defaultP"
            role="tooltip"
            class="absolute text-center z-10 invisible inline-block px-3 py-2 text-xs text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip"
          >
            Visualizar sismos
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
          <button
            data-tooltip-target="tooltip-defaultS"
            type="button"
            class="border-2 mr-2 rounded-lg px-6 py-2 items-center"
            :class="
              stateStop === 'enable'
                ? 'hover:bg-igp-white-100 text-igp-red hover:text-igp-red-500 border-igp-red'
                : 'bg-gray-100 text-igp-dark-500 select-none cursor-not-allowed borde-igp-dark-500'
            "
            @click="toggleStop"
            :disabled="stateStop === 'disable'"
          >
            <istop class="w-4 h-4"></istop>
          </button>
          <div
            id="tooltip-defaultS"
            role="tooltip"
            class="absolute text-center z-10 invisible inline-block px-3 py-2 text-xs text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip"
          >
            Parar visualización
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </div>

      <div
        class="grip grid-cols-12 col-span-12 border rounded-lg py-4 my-4 ml-2"
      >
        <tLabel
          color="blue"
          size="md"
          weight="400"
          class="col-span-12 flex pl-2"
        >
          <img
            :src="profundidad"
            alt="img_prof"
            height="20"
            width="18"
            class="mr-2"
          />
          Rango de profundidad:
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
                  class="mr-4 focus:outline-none"
                  :disabled="isDisabled(index)"
                  :class="{
                    'cursor-not-allowed': isDisabled(index),
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
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import tLabel from "@/components/ui/atoms/t-label.vue";
import tSelect from "@/components/ui/atoms/t-select.vue";
import profundidad from "@/assets/icons/profundidad.svg";
import magnitud from "@/assets/icons/magnitud.svg";
import calendario from "@/assets/icons/calendario.svg";
import iconworld from "@/assets/icons/world.vue";
import iconperu from "@/assets/icons/peru.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import tCalendar from "@/components/ui/atoms/t-calendar.vue";
import { Slider } from "ant-design-vue";
import { useGeojsonStore } from "@/stores/geojson";
import iplay from "@/assets/icons/iplay.vue";
import istop from "@/assets/icons/istop.vue";
import "flowbite";

//////////////////////////////////////
import Hammer from "hammerjs";
const draggableDiv = ref(null);
let initialY = 0;
let currentY = 0;
let yOffset = 0;
let isDragging = false;
let isOpen = false; // Estado para trackear si el div está abierto o cerrado
const isAnimating = ref(false); // Estado para manejar la animación

const toggleOpen = () => {
  const maxTopOffset = 0; // Posición superior completamente visible
  const maxBottomOffset =
    window.innerHeight - draggableDiv.value.offsetHeight / 1; // Posición inferior oculta a la mitad

  if (isOpen) {
    // Ocultar el div hasta la mitad
    currentY = maxBottomOffset;
  } else {
    // Mostrar el div completamente
    currentY = maxTopOffset;
  }

  // Activar la animación y aplicar la transformación
  isAnimating.value = true;
  draggableDiv.value.style.transform = `translateY(${currentY}px)`;

  // Desactivar la animación después de que termine la transición
  setTimeout(() => {
    isAnimating.value = false;
    yOffset = currentY; // Actualizar yOffset después de la animación
  }, 300); // Duración de la transición en ms

  // Actualizar el estado
  isOpen = !isOpen;
};
const handleGesture = (event) => {
  const divHeight = draggableDiv.value.offsetHeight;
  const maxBottomOffset = 820; // El div puede ocultarse hasta la mitad

  switch (event.type) {
    case "panstart":
      isAnimating.value = false; // Desactivar la animación durante el arrastre
      isDragging = true;
      initialY = event.center.y;
      break;
    case "panmove":
      if (isDragging) {
        currentY = event.center.y - initialY + yOffset;
        // Permitir movimiento ilimitado hacia arriba y limitar hacia abajo
        currentY = Math.min(maxBottomOffset, currentY);
        draggableDiv.value.style.transform = `translateY(${currentY}px)`;
      }
      break;
    case "panend":
      yOffset = currentY;
      isDragging = false;
      break;
  }
};
onMounted(() => {
  const divHeight = draggableDiv.value.offsetHeight;
  const initialHiddenPosition = window.innerHeight - divHeight / 20;
  currentY = initialHiddenPosition;
  yOffset = currentY;
  draggableDiv.value.style.transform = `translateY(${currentY}px)`;

  const hammer = new Hammer(draggableDiv.value);
  hammer.get("pan").set({ direction: Hammer.DIRECTION_VERTICAL });

  hammer.on("panstart panmove panend", handleGesture);
});

onBeforeUnmount(() => {
  if (draggableDiv.value) {
    const hammer = new Hammer(draggableDiv.value);
    hammer.off("panstart panmove panend", handleGesture);
  }
});
//////////////////////////////////////
const useGeojson = useGeojsonStore();
const stateStop = ref("enable");
const statePlay = ref("disable");

const ablePeru = ref(false);
const ableGlobal = ref(true);
const activeTab = ref("global");

// Estilos para los círculos personalizados
const redCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  backgroundColor: "#ff0000", // Rojo
  borderRadius: "50%",
  marginRight: "5px",
  border: "1px solid #ff0000", // Borde negro delgado
};

const greenCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  backgroundColor: "#39ff14", // Verde
  borderRadius: "50%",
  marginRight: "5px",
  border: "1px solid #39ff14", // Borde negro delgado
};

const blueCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  backgroundColor: "#007aff", // Azul
  borderRadius: "50%",
  marginRight: "5px",
  border: "1px solid #007aff", // Borde negro delgado
};

function setActiveTab(tab) {
  activeTab.value = tab; // quitar si en caso no quiere que cuando se cambie a peru, se ponga play solo

  togglePlay();
  if (tab === "peru") {
    stateStartDate.value = "disable";
    disStartDate.value = true;
    stateEndDate.value = "disable";
    disEndDate.value = true;
    selPeru.value = "";
    ablePeru.value = true;
    ableGlobal.value = false;
    useGeojson.continente = {
      minLatitude: -18.35,
      maxLatitude: -0.03,
      minLongitude: -81.33,
      maxLongitude: -68.65,
    };
  } else {
    ablePeru.value = false;
    ableGlobal.value = true;
    selContinente.value = "";
    useGeojson.continente = {
      minLatitude: -55.0,
      maxLatitude: 81.0,
      minLongitude: -168.0,
      maxLongitude: 180.0,
    };
  }
}

// PERU
const selPeru = ref("");
const statePeru = ref("disable");
const errPeru = ref("Peru error");
const dataPeru = ref([
  {
    value: "",
    name: "Todo el Perú",
    boundaries: {
      minLatitude: -18.35,
      maxLatitude: -0.03,
      minLongitude: -81.33,
      maxLongitude: -68.65,
    },
  },
  {
    value: "amazonas",
    name: "Amazonas",
    boundaries: {
    minLatitude: -5.3,
    maxLatitude: -4.5,
    minLongitude: -78.5,
    maxLongitude: -76.5
    },
  },
  {
    value: "ancash",
    name: "Áncash",
    boundaries: {
      minLatitude: -10.6,
      maxLatitude: -8.1,
      minLongitude: -78.5,
      maxLongitude: -76.5,
    },
  },
  {
    value: "apurimac",
    name: "Apurímac",
    boundaries: {
      minLatitude: -14.1,
      maxLatitude: -13.1,
      minLongitude: -74.2,
      maxLongitude: -72.5,
    },
  },
  {
    value: "arequipa",
    name: "Arequipa",
    boundaries: {
     minLatitude: -17.8,
     maxLatitude: -14.8,
     minLongitude: -74.3,
     maxLongitude: -71.5
    },
  },
  {
    value: "ayacucho",
    name: "Ayacucho",
    boundaries: {
      minLatitude: -14.5,
      maxLatitude: -12.5,
      minLongitude: -75.0,
      maxLongitude: -73.0,
    },
  },
  {
  value: "cajamarca",
  name: "Cajamarca",
  boundaries: {
    minLatitude: -7.6,
    maxLatitude: -5.8,
    minLongitude: -79.6,
    maxLongitude: -77.5
    },
  },
  {
    value: "callao",
    name: "Callao",
    boundaries: {
      minLatitude: -12.1,
      maxLatitude: -11.9,
      minLongitude: -77.3,
      maxLongitude: -77.1,
    },
  },
  {
    value: "cusco",
    name: "Cusco",
    boundaries: {
      minLatitude: -14.3,
      maxLatitude: -12.4,
      minLongitude: -72.6,
      maxLongitude: -70.6,
    },
  },
  {
    value: "huancavelica",
    name: "Huancavelica",
    boundaries: {
      minLatitude: -13.5,
      maxLatitude: -12.4,
      minLongitude: -75.5,
      maxLongitude: -74.2,
    },
  },
  {
    value: "huanuco",
    name: "Huánuco",
    boundaries: {
      minLatitude: -10.3,
      maxLatitude: -8.3,
      minLongitude: -76.6,
      maxLongitude: -74.0,
    },
  },
  {
    value: "ica",
    name: "Ica",
    boundaries: {
      minLatitude: -15.2,
      maxLatitude: -13.3,
      minLongitude: -76.7,
      maxLongitude: -75.0,
    },
  },
  {
    value: "junin",
    name: "Junín",
    boundaries: {
    minLatitude: -12.5,
    maxLatitude: -10.9,
    minLongitude: -76.2,
    maxLongitude: -74.0
    },
  },
  {
    value: "la_libertad",
    name: "La Libertad",
    boundaries: {
    minLatitude: -9.0,
    maxLatitude: -7.0,
    minLongitude: -81.1,
    maxLongitude: -78.8
    },
  },
  {
    value: "lambayeque",
    name: "Lambayeque",
    boundaries: {
      minLatitude: -7.3,
      maxLatitude: -5.2,
      minLongitude: -80.7,
      maxLongitude: -79.1,

    },
  },
  {
    value: "lima",
    name: "Lima",
    boundaries: {
      minLatitude: -12.9,
      maxLatitude: -10.6,
      minLongitude: -77.8,
      maxLongitude: -76.3,
    },
  },
  {
    value: "loreto",
    name: "Loreto",
    boundaries: {
      minLatitude: -5.3,
      maxLatitude: -0.0,
      minLongitude: -76.6,
      maxLongitude: -70.2,
    },
  },
  {
    value: "madre_de_dios",
    name: "Madre de Dios",
    boundaries: {
      minLatitude: -13.2,
      maxLatitude: -10.5,
      minLongitude: -70.8,
      maxLongitude: -68.7,
    },
  },
  {
    value: "moquegua",
    name: "Moquegua",
    boundaries: {
      minLatitude: -17.9,  // Ligeramente más al sur
  maxLatitude: -16.5,  // Ligeramente más al norte
  minLongitude: -71.5, // Ligeramente más al oeste
  maxLongitude: -70.6, // Ligeramente más al este
    },
  },
  {
    value: "pasco",
    name: "Pasco",
    boundaries: {
      minLatitude: -11.1,
      maxLatitude: -9.6,
      minLongitude: -76.8,
      maxLongitude: -75.1,
    },
  },
  {
    value: "piura",
    name: "Piura",
    boundaries: {
      minLatitude: -6.2,
      maxLatitude: -4.0,
      minLongitude: -81.7,
      maxLongitude: -79.0
    },
  },
  {
    value: "puno",
    name: "Puno",
    boundaries: {
      minLatitude: -17.2,
      maxLatitude: -13.3,
      minLongitude: -70.0,
      maxLongitude: -68.6,
    },
  },
  {
    value: "san_martin",
    name: "San Martín",
    boundaries: {
      minLatitude: -8.8,
      maxLatitude: -6.0,
      minLongitude: -77.8,
      maxLongitude: -75.5,
    },
  },
  {
    value: "tacna",
    name: "Tacna",
    boundaries: {
    minLatitude: -18.3,
    maxLatitude: -16.9,
    minLongitude: -70.8,
    maxLongitude: -69.6
    },
  },
  {
    value: "tumbes",
    name: "Tumbes",
    boundaries: {
      minLatitude: -4.5,
      maxLatitude: -3.3,
      minLongitude: -81.9,
      maxLongitude: -80.3   
    },
  },
  {
    value: "ucayali",
    name: "Ucayali",
    boundaries: {
    minLatitude: -10.9,
    maxLatitude: -7.7,
    minLongitude: -75.7,
    maxLongitude: -73.0
    },
  },
  {
    value: "historica",
    name: "Sísmica historica 1471 - 1959",
    boundaries: {
      minLatitude: -18.35,
      maxLatitude: -0.03,
      minLongitude: -81.33,
      maxLongitude: -68.65,
    },
  },
]);
function getValPeru() {
  if (selPeru.value === "actual" || selPeru.value === "historica") {
    stateStartDate.value = "disable";
    disStartDate.value = true;
    stateEndDate.value = "disable";
    disEndDate.value = true;
  } else {
    stateStartDate.value = "enable";
    disStartDate.value = false;
    stateEndDate.value = "enable";
    disEndDate.value = false;
  }
}

watch(selPeru, (newValue) => {
  const depSeleccionado = dataPeru.value.find(
    (departamento) => departamento.value === newValue
  );

  getValPeru();

  if (depSeleccionado) {
    const boundaries = depSeleccionado.boundaries;
    useGeojson.continente = boundaries;
  }
});

//CONTINENTE
const selContinente = ref("");
const stateContinente = ref("disable");
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
    useGeojson.continente = boundaries;
  }
});

//MAGNITUD
const magnitudeRange = ref([4, 9.5]);
const disabledSlider = ref(true);
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
const disStartDate = ref(true);
const stateStartDate = ref("disable");

//EndDate
const endDate = ref({
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
});
const errEndDate = ref("Fecha fin error");
const disEndDate = ref(true);
const stateEndDate = ref("disable");

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
const stateCheckList = ref("disable");

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
};

const isDisabled = (index) => {
  if (stateCheckList.value === "disable") {
    // Si el estado es 'disable', el checkbox no puede ser modificado
    return checkedItems.value[index] ? true : false;
  }
  return false; // Si está habilitado, el checkbox se comporta normalmente
};

watch(
  () => useGeojson.estadoPl, // Observar la propiedad estadoPl
  (newValue) => {
    if (newValue === "enable") {
      statePlay.value = "disable";
      stateStop.value = "enable";
    } else if (newValue === "disable") {
      toggleStop();
      stateStop.value = "disable";
      statePlay.value = "enable";
    }
  }
);

const togglePlay = () => {
  if (activeTab.value === "peru") {
    if (selPeru.value === "actual") {
      const act = {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
      };
      useGeojson.rangoFechas = {
        startDate: convertToDate({ month: 0, year: 1960 }),
        endDate: convertToDate(act),
      };
    } else if (selPeru.value === "historica") {
      useGeojson.rangoFechas = {
        startDate: convertToDate({ month: 0, year: 1471 }),
        endDate: convertToDate({ month: 11, year: 1959 }),
      };
    } else {
      useGeojson.rangoFechas = {
        startDate: convertToDate(startDate.value),
        endDate: convertToDate(endDate.value),
      };
    }
  }
  useGeojson.rangoFechas = {
    startDate: convertToDate(startDate.value),
    endDate: convertToDate(endDate.value),
  };
  useGeojson.estadoPl = "enable";
  statePeru.value = "disable";
  stateStartDate.value = "disable";
  disStartDate.value = true;
  stateEndDate.value = "disable";
  disEndDate.value = true;
  stateContinente.value = "disable";
  stateCheckList.value = "disable";
  disabledSlider.value = true;

  useGeojson.rangoMagnitud = {
    maxMag: magnitudeRange.value[0],
    minMag: magnitudeRange.value[1],
  };

  useGeojson.profundidad = selectionState.value;
};

const toggleStop = () => {
  useGeojson.estadoPl = "disable";
  disabledSlider.value = false;
  statePeru.value = "enable";
  stateContinente.value = "enable";
  stateCheckList.value = "enable";
  if (activeTab.value === "peru") {
    getValPeru();
  } else {
    stateStartDate.value = "enable";
    disStartDate.value = false;
    stateEndDate.value = "enable";
    disEndDate.value = false;
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
  margin-left: 15px;
  margin-right: 15px;
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
  font-size: 8px;
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

.ant-slider-mark-text.ant-slider-mark-text-active {
  font-size: 12px;
}
</style>
  