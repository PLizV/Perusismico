<template>
  <div
    class="flex items-center px-4 sm:px-4 md:px-0 lg:px-0 xl:px-0 2xl:px-0 ml-0 sm:ml-0 md:ml-8 lg:ml-10 xl:ml-14 2xl:ml-20 justify-start z-10 scroll-auto select-none absolute mt-16"
  >
    <!-- Panel de control -->
    <div
      v-if="muestraModal"
      class="px-4 p-3 grid grid-cols-1 md:grid-cols-12 bg-[#FCFDFF] rounded-2xl w-[490px] border border-b border-igp-blue shadow-[0px_4px_4px_0px_#00000024]"
    >
      <button
        class="ml-auto col-span-12"
        data-tooltip-target="tooltip-right"
        data-tooltip-placement="right"
        type="button"
        @click="cerrarModal"
      >
        <img :src="shared" alt="img_share" height="18" width="16" />
      </button>
      <div
        id="tooltip-right"
        role="tooltip"
        class="absolute z-10 invisible inline-block text-xs px-3 py-2 font-medium text-white bg-gray-600 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
      >
        Minimizar
        <div class="tooltip-arrow" data-popper-arrow></div>
      </div>
      <div class="grid grid-cols-12 col-span-12 mt-3">
        <div class="col-span-1 sm:col-span-3 md:col-span-6 flex">
          <!-- Botón Perú -->
          <button
            :disabled="ablePeru"
            @click="setActiveTab('peru')"
            :class="{
              'bg-igp-blue text-igp-white font-semibold': activeTab === 'peru',
              'bg-igp-white text-igp-muted-400 hover:text-igp-blue hover:font-medium  hover:border-igp-blue':
                activeTab !== 'peru',
            }"
            class="flex items-center justify-center focus:outline-none w-full h-full py-3 border-y-2 border-l-2 rounded-l-3xl text-sm"
          >
            <iconperu class="absolute h-8 mr-14 mt-1"></iconperu>
            Perú
          </button>
        </div>
        <div class="col-span-1 sm:col-span-3 md:col-span-6 flex">
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
            class="flex items-center justify-center focus:outline-none w-full h-full py-3 border-y-2 border-r-2 rounded-r-3xl text-sm"
          >
            <iconworld class="h-5 mr-1"></iconworld>
            Global
          </button>
        </div>
      </div>
      <span class="text-igp-black-1000 col-span-12 text-sm px-4 mt-3">
        Para visualizar los sismos, primero seleccione la región, el periodo en
        años, el rango de magnitud y la profundidad de los sismos.
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
          <template v-slot:name> Seleccionar región o departamento</template>
          <template v-slot:error> {{ errPeru }} </template>
        </tSelect>
      </div>
      <div
        class="grid grid-cols-12 col-span-12 border ml-4 py-1 my-4 rounded-lg"
        translate="no"
      >
        <tLabel
          color="blue"
          size="md"
          weight="400"
          class="col-span-12 flex mt-2 ml-4"
        >
          <img
            :src="calendario"
            alt="img_calen"
            height="18"
            width="18"
            class="mr-[6px]"
          />
          Periodo de años:
        </tLabel>
        <tCalendar class="col-span-5 mt-2 pl-5 mb-0" :state="stateStartDate">
          <template v-slot:calendar>
            <VueDatePicker
              v-model="startDate"
              :format="capitalizeMonth"
              :format-locale="es"
              :autoApply="true"
              :disabled="disStartDate"
              :min-date="new Date(1960, 0, 1)"
              :year-range="[1960, new Date().getFullYear()]"
              month-picker
              style="color: blue !important"
            ></VueDatePicker>
          </template>
          <template v-slot:name> Fecha de inicio </template>
          <template v-slot:error> {{ errStartDate }} </template>
        </tCalendar>
        <tCalendar class="col-span-6 mt-2 pl-12" :state="stateEndDate">
          <template v-slot:calendar>
            <VueDatePicker
              v-model="endDate"
              :format="capitalizeMonth"
              :format-locale="es"
              :autoApply="true"
              :disabled="disEndDate"
              month-picker
              :min-date="new Date(1960, 0, 1)"
              :year-range="[1960, new Date().getFullYear()]"
            ></VueDatePicker>
          </template>
          <template v-slot:name> Fecha de fin </template>
          <template v-slot:error> {{ errEndDate }} </template>
        </tCalendar>
        <!--Se asigno id -->
        <span
          id="span"
          class="col-span-5 text-xs text-center ml-1 text-igp-dark-400 mb-2"
          >(*) desde 1960 hasta la fecha
        </span>
      </div>
      <div class="grid grid-cols-12 col-span-12 border ml-4 py-3 rounded-lg">
        <div class="col-span-12 flex items-center">
          <tLabel
            color="blue"
            size="md"
            weight="400"
            class="flex items-center ml-4"
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
        <div class="col-span-12 pl-3 mt-2">
          <div class="slider">
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
        <div class="col-span-12 flex items-center justify-center outline-none">
          <button
            type="button"
            class="border-2 mr-2 rounded-full px-6 py-2 items-center"
            :class="
              statePlay === 'enable'
                ? ' text-igp-white border-igp-white bg-igp-blue hover:bg-igp-white hover:text-igp-blue hover:border-igp-blue'
                : 'bg-gray-100 text-igp-dark-500 select-none cursor-not-allowed borde-igp-dark-500'
            "
            @click="togglePlay"
            :disabled="statePlay === 'disable'"
          >
            <iplay class="w-4 h-4"></iplay>
          </button>
          <button
            type="button"
            class="border-2 mr-2 rounded-full px-6 py-2 items-center outline-none"
            :class="
              stateStop === 'enable'
                ? 'hover:bg-igp-white hover:border-[#04B29E] text-igp-white hover:text-[#04B29E] border-[#04B29E] bg-[#04B29E] '
                : 'bg-gray-100 text-igp-dark-500 select-none cursor-not-allowed borde-igp-dark-500'
            "
            @click="toggleStop"
            :disabled="stateStop === 'disable'"
          >
            <istop class="w-4 h-4"></istop>
          </button>
          <button class="ml-3 relative" type="button" @mouseenter="showTooltip">
            <img :src="qst" alt="question_img" height="20" width="18" />
            <div
              v-if="tooltipVisible"
              :class="[
                'tooltip',
                tooltipVisible ? 'opacity-100 visible' : 'opacity-0 invisible',
              ]"
              class="tooltip absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 text-xs font-medium text-white bg-igp-blue rounded-lg shadow-sm w-50 text-start w-60"
            >
              Presiona Play o Stop para controlar la animación de sismos.
            </div>
          </button>
        </div>
        <div
          class="grid-cols-12 col-span-11 border rounded-lg py-2 mt-4 mx-4 bg-gray-50 translate-x-6"
        >
          <div class="flex px-6 col-span-12 mt-2 p-1 justify-around">
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <div
                  class="w-3 h-3 rounded-full border-2 border-igp-muted bg-transparent"
                ></div>
              </div>
              <p class="text-xs text-igp-black-1000 text-center">
                M4.0 a<br />M5.0
              </p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <div
                  class="w-5 h-5 rounded-full border-2 border-igp-muted bg-transparent"
                ></div>
              </div>
              <p class="text-xs text-igp-black-1000 text-center">
                M>5 a<br />M6.0
              </p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <div
                  class="w-6 h-6 rounded-full border-2 border-igp-muted bg-transparent"
                ></div>
              </div>
              <p class="text-xs text-igp-black-1000 text-center">
                M>6.0 a<br />M7.0
              </p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <div
                  class="w-8 h-8 rounded-full border-2 border-igp-muted bg-transparent"
                ></div>
              </div>
              <p class="text-xs text-igp-black-1000 text-center">
                M>7.0 a<br />M8.0
              </p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="w-12 h-12 flex items-center justify-center">
                <div
                  class="w-11 h-11 rounded-full border-2 border-igp-muted bg-transparent"
                ></div>
              </div>
              <p class="text-xs text-igp-black-1000 text-center">
                M>8.0 a<br />M9.5
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="grip grid-cols-12 col-span-12 border rounded-lg py-4 my-4 ml-4"
      >
        <tLabel
          color="blue"
          size="md"
          weight="400"
          class="col-span-12 flex pl-4"
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
                  class="mr-4"
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
    <button
      v-else
      class="px-4 py-3 font-medium text-sm text-igp-blue flex items-center bg-[#FCFDFF] rounded-2xl w-[330px] border border-b border-igp-blue shadow-[0px_4px_4px_0px_#00000024]"
      @click="cerrarModal"
    >
      Ver Panel de ajuste sísmico
      <img
        :src="share"
        class="ml-auto"
        alt="img_share"
        height="18"
        width="16"
      />
    </button>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import tLabel from "@/components/ui/atoms/t-label.vue";
import tSelect from "@/components/ui/atoms/t-select.vue";
import profundidad from "@/assets/icons/profundidad.svg";
import shared from "@/assets/icons/shared.svg";
import share from "@/assets/icons/share.svg";
import magnitud from "@/assets/icons/magnitud.svg";
import calendario from "@/assets/icons/calendario.svg";
import iconworld from "@/assets/icons/world.vue";
import iconperu from "@/assets/icons/peru.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import tCalendar from "@/components/ui/atoms/t-calendar.vue";
import { Slider } from "ant-design-vue";
import { useGeojsonStore } from "@/stores/geojson";
import iplay from "@/assets/icons/iplay.vue";
import istop from "@/assets/icons/istop.vue";
import qst from "@/assets/icons/question.svg";
import "flowbite";
function capitalizeMonth(date) {
  if (!date) return "";
  const formattedDate = format(date, "MMM/yyyy", { locale: es });
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}
const useGeojson = useGeojsonStore();
const stateStop = ref("enable");
const statePlay = ref("disable");
//const ablePeru = ref(false);
//const ableGlobal = ref(true);
const ablePeru = ref(true);
const ableGlobal = ref(false);
//const activeTab = ref("global");
const activeTab = ref("peru");
const muestraModal = ref(true);
// Función para cerrar el modal
function cerrarModal() {
  muestraModal.value = !muestraModal.value;
  useGeojson.setZoom = !useGeojson.setZoom;
}
// Estilos para los círculos personalizados
const redCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  marginRight: "5px",
  border: "2px solid #ff0000", // Borde negro delgado
};
const greenCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  marginRight: "5px",
  border: "2px solid #0AB427", // Borde negro delgado
};
const blueCircleStyle = {
  display: "inline-block",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  marginRight: "5px",
  border: "2px solid #002FEF", // Borde negro delgado
};
function setActiveTab(tab) {
  activeTab.value = tab; // quitar si en caso no quiere que cuando se cambie a peru, se ponga play solo
  useGeojson.departamento = tab;
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
// Variable para controlar la visibilidad del tooltip
const tooltipVisible = ref(true);
// Variable para almacenar el temporizador
let hideTimeout;
// Configurar el temporizador para cerrar el tooltip automáticamente después de 5 segundos al montar el componente
onMounted(() => {
  hideTimeout = setTimeout(() => {
    tooltipVisible.value = false;
  }, 2000); // 2000 milisegundos = 2 segundos
});
// Función para mostrar el tooltip al pasar el mouse
const showTooltip = () => {
  // Si ya hay un temporizador activo, lo limpiamos
  clearTimeout(hideTimeout);
  // Mostramos el tooltip
  tooltipVisible.value = true;
  // Configuramos el temporizador para ocultar el tooltip después de 5 segundos
  hideTimeout = setTimeout(() => {
    tooltipVisible.value = false;
  }, 2000);
};
// PERU
const selPeru = ref("");
const statePeru = ref("disable");
const errPeru = ref("Peru error");
const dataPeru = ref([
  {
    value: "historica1",
    send: "peru",
    name: "Sísmica historica 1471 - 1900",
    boundaries: {
      minLatitude: -18.85, // Reduje un poco más el valor de la latitud mínima
      maxLatitude: 0.17, // Aumenté un poco la latitud máxima
      minLongitude: -81.83, // Aumenté un poco más la longitud mínima
      maxLongitude: -68.15, // Aumenté más la longitud máxima
    },
  },
  {
    value: "historica2",
    send: "peru",
    name: "Sísmica historica 1901 - 1959",
    boundaries: {
      minLatitude: -18.85, // Reduje un poco más el valor de la latitud mínima
      maxLatitude: 0.17, // Aumenté un poco la latitud máxima
      minLongitude: -81.83, // Aumenté un poco más la longitud mínima
      maxLongitude: -68.15, // Aumenté más la longitud máxima
    },
  },
  
  {
    value: "",
    send: "peru",
    name: "Perú",
    boundaries: {
      minLatitude: -18.35,
      maxLatitude: -0.03,
      minLongitude: -81.33,
      maxLongitude: -68.65,
    },
  },
  {
    value: "amazonas",
    send: "AMAZONAS",
    name: "Amazonas",
    boundaries: {
      minLatitude: -7.5, // Mantiene la extensión al sur
      maxLatitude: -2.7, // Mantiene la extensión al norte
      minLongitude: -78.9, // Ampliado hacia el oeste para incluir más de Cajamarca
      maxLongitude: -77.3, // Mantiene el límite al este
    },
  },
  {
    value: "ancash",
    send: "ANCASH",
    name: "Áncash",
    boundaries: {
      minLatitude: -10.9,
      maxLatitude: -8.1,
      minLongitude: -79.9,
      maxLongitude: -76.5,
    },
  },
  {
    value: "apurimac",
    send: "APURIMAC",
    name: "Apurímac",
    boundaries: {
      minLatitude: -14.8, // Reducido hacia el norte para limitar el sur
      maxLatitude: -13.0, // Mantiene la extensión al norte
      minLongitude: -73.9, // Mantiene el límite al oeste
      maxLongitude: -72.0, // Mantiene el límite al este
    },
  },
  {
    value: "arequipa",
    send: "AREQUIPA",
    name: "Arequipa",
    boundaries: {
      minLatitude: -17.5, // Reducido hacia el norte para limitar el sur
      maxLatitude: -14.5, // Mantiene la extensión hacia el norte
      minLongitude: -75, // Mantiene el límite hacia el oeste
      maxLongitude: -70.8, // Mantiene el límite hacia el este
    },
  },
  {
    value: "ayacucho",
    send: "AYACUCHO",
    name: "Ayacucho",
    boundaries: {
      minLatitude: -15.7, // Mantiene la extensión al sur
      maxLatitude: -12.0, // Ampliado hacia el norte
      minLongitude: -75.2, // Mantiene el límite al oeste
      maxLongitude: -72.5, // Mantiene el límite al este
    },
  },
  {
    value: "cajamarca",
    send: "CAJAMARCA",
    name: "Cajamarca",
    boundaries: {
      minLatitude: -7.7, // Mantiene la extensión hacia el sur
      maxLatitude: -4.5, // Ampliado más hacia el norte
      minLongitude: -79.5, // Mantiene el límite hacia el oeste
      maxLongitude: -77.8, // Mantiene el límite hacia el este
    },
  },
  /*  {
    value: "callao",
    send: "LIMA",
    name: "Callao",
    boundaries: {
      minLatitude: -12.3, // Ampliado más hacia el sur
      maxLatitude: -11.8, // Ampliado más hacia el norte
      minLongitude: -77.5, // Ampliado más hacia el oeste
      maxLongitude: -77.0, // Ampliado más hacia el este
    },
  }, */
  {
    value: "cusco",
    send: "CUSCO",
    name: "Cusco",
    boundaries: {
      minLatitude: -15.5, // Extendido más al sur
      maxLatitude: -11.0, // Extendido más al norte
      minLongitude: -73.5, // Extendido más al oeste
      maxLongitude: -70.0, // Extendido más al este
    },
  },
  {
    value: "huancavelica",
    send: "HUANCAVELICA",
    name: "Huancavelica",
    boundaries: {
      minLatitude: -14.1, // Ajustado hacia el norte para reducir el sur
      maxLatitude: -11.9, // Ajustado hacia el sur para reducir el norte
      minLongitude: -75.8, // Mantiene el límite al oeste
      maxLongitude: -74.2, // Mantiene el límite al este
    },
  },
  {
    value: "huanuco",
    send: "HUANUCO",
    name: "Huánuco",
    boundaries: {
      minLatitude: -10.3, // Mantiene la extensión al sur
      maxLatitude: -8.3, // Mantiene la extensión al norte
      minLongitude: -77.3, // Ampliado hacia el oeste para incluir más cerca del mar
      maxLongitude: -74.5, // Mantiene el límite al este
    },
  },
  {
    value: "ica",
    send: "ICA",
    name: "Ica",
    boundaries: {
      minLatitude: -15.7, // Ampliado hacia el sur
      maxLatitude: -13.0, // Ampliado hacia el norte
      minLongitude: -76.7, // Mantiene el límite al oeste
      maxLongitude: -74.7, // Mantiene el límite al este
    },
  },
  {
    value: "junin",
    send: "JUNIN",
    name: "Junín",
    boundaries: {
      minLatitude: -12.8,
      maxLatitude: -10.7,
      minLongitude: -76.5,
      maxLongitude: -73.3,
    },
  },
  {
    value: "la_libertad",
    send: "LA LIBERTAD",
    name: "La Libertad",
    boundaries: {
      minLatitude: -9.0, // Mantiene la extensión al sur
      maxLatitude: -7.0, // Mantiene la extensión al norte
      minLongitude: -81.1, // Mantiene el límite al oeste
      maxLongitude: -76.8, // Ampliado hacia el este
    },
  },
  {
    value: "lambayeque",
    send: "LAMBAYEQUE",
    name: "Lambayeque",
    boundaries: {
      minLatitude: -7.3,
      maxLatitude: -5.4,
      minLongitude: -80.7,
      maxLongitude: -79.1,
    },
  },
  {
    value: "lima",
    send: "LIMA",
    name: "Lima",
    boundaries: {
      minLatitude: -13.7, // Extiende el sur de Lima
      maxLatitude: -10.0, // Extiende el norte de Lima
      minLongitude: -79.0, // Extiende el oeste hacia el mar
      maxLongitude: -75.6, // Extiende el este hacia la sierra
    },
  },
  {
    value: "loreto",
    send: "LORETO",
    name: "Loreto",
    boundaries: {
      minLatitude: -9.0, // Ampliado más hacia el sur
      maxLatitude: -0.0, // Ampliado más hacia el norte
      minLongitude: -78.0, // Ampliado más hacia el oeste
      maxLongitude: -68.5, // Ampliado más hacia el este
    },
  },
  {
    value: "madre_de_dios",
    send: "MADRE DE DIOS",
    name: "Madre de Dios",
    boundaries: {
      minLatitude: -13.5, // Mantiene la extensión al sur
      maxLatitude: -9.8, // Reducido hacia el sur para limitar el norte
      minLongitude: -72.5, // Mantiene el límite al oeste
      maxLongitude: -65.5, // Mantiene el límite al este
    },
  },
  {
    value: "moquegua",
    send: "MOQUEGUA",
    name: "Moquegua",
    boundaries: {
      minLatitude: -17.9, // Ampliado más hacia el sur
      maxLatitude: -16.0, // Ampliado más hacia el norte
      minLongitude: -72.0, // Ampliado más hacia el oeste
      maxLongitude: -70.0, // Ampliado más hacia el este
    },
  },
  {
    value: "pasco",
    send: "PASCO",
    name: "Pasco",
    boundaries: {
      minLatitude: -11.1, // Mantiene la extensión hacia el sur
      maxLatitude: -9.6, // Mantiene la extensión hacia el norte
      minLongitude: -76.8, // Mantiene el límite al oeste
      maxLongitude: -74.3, // Ampliado hacia el este
    },
  },
  {
    value: "piura",
    send: "PIURA",
    name: "Piura",
    boundaries: {
      minLatitude: -6.4, // Ampliado hacia el sur
      maxLatitude: -4.1, // Mantiene el límite hacia el norte
      minLongitude: -81.7, // Mantiene el límite al oeste
      maxLongitude: -79.0, // Mantiene el límite al este
    },
  },
  {
    value: "puno",
    send: "PUNO",
    name: "Puno",
    boundaries: {
      minLatitude: -17.3, // Reducido hacia el norte para limitar el sur
      maxLatitude: -12.6, // Mantiene la extensión hacia el norte
      minLongitude: -71.2, // Mantiene el límite hacia el oeste
      maxLongitude: -68.5, // Mantiene el límite hacia el este
    },
  },
  {
    value: "san_martin",
    send: "SAN MARTIN",
    name: "San Martín",
    boundaries: {
      minLatitude: -8.8,
      maxLatitude: -5.3,
      minLongitude: -77.8,
      maxLongitude: -75.5,
    },
  },
  {
    value: "tacna",
    send: "TACNA",
    name: "Tacna",
    boundaries: {
      minLatitude: -18.5, // Mantiene la extensión hacia el sur
      maxLatitude: -16.6, // Mantiene la extensión hacia el norte
      minLongitude: -71.5, // Mantiene el límite hacia el oeste
      maxLongitude: -69.4, // Reducido hacia el oeste para limitar el este
    },
  },
  {
    value: "tumbes",
    send: "TUMBES",
    name: "Tumbes",
    boundaries: {
      minLatitude: -4.3, // Reducido hacia el norte para limitar el sur
      maxLatitude: -3.3, // Mantiene la extensión hacia el norte
      minLongitude: -81.9, // Mantiene el límite hacia el oeste
      maxLongitude: -80.0, // Mantiene el límite hacia el este
    },
  },
  {
    value: "ucayali",
    send: "UCAYALI",
    name: "Ucayali",
    boundaries: {
      minLatitude: -11.5, // Ampliado más hacia el sur
      maxLatitude: -7.1, // Mantiene la extensión hacia el norte
      minLongitude: -76.0, // Mantiene el límite hacia el oeste
      maxLongitude: -70.5, // Ampliado más hacia el este
    },
  },
]);
function getValPeru() {
  if (
    selPeru.value === "actual" ||
    selPeru.value === "historica1" ||
    selPeru.value === "historica2"
  ) {
    stateStartDate.value = "disable";
    disStartDate.value = true;
    stateEndDate.value = "disable";
    disEndDate.value = true;
    // Oculta el elemento con el id "span"
    document.getElementById("span").style.display = "none";
  } else {
    stateStartDate.value = "enable";
    disStartDate.value = false;
    stateEndDate.value = "enable";
    disEndDate.value = false;
    // Muestra el elemento con el id "span"
    document.getElementById("span").style.display = "inline";
  }
}
watch(selPeru, (newValue) => {
  const depSeleccionado = dataPeru.value.find(
    (departamento) => departamento.value === newValue
  );
  getValPeru();
  useGeojson.departamento = depSeleccionado.send;
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
    name: "Global",
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
      minLatitude: 15.0,
      maxLatitude: 72.0,
      minLongitude: -168.0,
      maxLongitude: -53.0,
    },
  },
  {
    value: "centroamerica",
    name: "América Central",
    boundaries: {
      minLatitude: 5.0,
      maxLatitude: 25.0,
      minLongitude: -95.0,
      maxLongitude: -60.0,
    },
  },
  {
    value: "asia",
    name: "Asia",
    boundaries: {
      minLatitude: -11.0,
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
const continente = () => {
  watch(selContinente, (newValue) => {
    const continenteSeleccionado = dataContinente.value.find(
      (continente) => continente.value === newValue
    );
    if (continenteSeleccionado) {
      const boundaries = continenteSeleccionado.boundaries;
      useGeojson.continente = boundaries;

      // Verifica si la pestaña activa es "global"
      if (activeTab.value === "global") {
        document.getElementById("span").style.display = "inline";
      }
    }
  });
};
// Llama a la función continente
continente();
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

const convertToDateStart = (proxyObject) => {
  if (
    proxyObject &&
    proxyObject.month !== undefined &&
    proxyObject.year !== undefined
  ) {
    const date = new Date(proxyObject.year, proxyObject.month);
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
        startDate: convertToDateStart({ month: 0, year: 1960 }),
        endDate: convertToDate(act),
      };
    } else if (selPeru.value === "historica1") {
      useGeojson.rangoFechas = {
        startDate: convertToDateStart({ month: 0, year: 1471 }),
        endDate: convertToDate({ month: 11, year: 1900 }),
      };
    } else if (selPeru.value === "historica2") {
      // Agrega una nueva condición para "transicional":
      useGeojson.rangoFechas = {
        startDate: convertToDateStart({ month: 0, year: 1901 }),
        // Asigna como fecha de inicio enero del año 1901.
        endDate: convertToDate({ month: 11, year: 1959 }),
        // Asigna como fecha de fin diciembre del año 1959 (mes 11).
      };
    } else {
      useGeojson.rangoFechas = {
        startDate: convertToDateStart(startDate.value),
        endDate: convertToDate(endDate.value),
      };
    }
  } else {
    useGeojson.rangoFechas = {
      startDate: convertToDateStart(startDate.value),
      endDate: convertToDate(endDate.value),
    };
  }
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
.ant-slider-mark-text.ant-slider-mark-text-active {
  font-size: 12px;
}
.tooltip {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
/* Mostrar el tooltip cuando el botón se encuentre en hover */
.tooltip.opacity-100.visible {
  opacity: 1;
  visibility: visible;
}
</style>
