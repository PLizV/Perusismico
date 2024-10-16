<template>
  <div
    class="relative flex items-center pl-10 justify-start z-10 pt-[5.25rem] scroll-auto select-none"
  >
    <div class="px-12 py-6 grid grid-cols-12 bg-white rounded-2xl w-[510px]">
      <tLabel color="blue" size="lg" weight="400" class="col-span-12 flex">
        <img :src="filter" alt="filter" height="14" width="12" class="mr-3" />
        Filtrar visor por:
      </tLabel>
      <!-- DEPARTAMENTO -->
      <form class="grid grid-cols-12 col-span-12" method="dialog">
        <tSelect
          class="col-span-12 pl-3 mt-2"
          :state="stateDepartamento"
          v-bind:modelValue="selDepartamento"
          v-on:update:modelValue="selDepartamento = $event"
          :groupOpcion="false"
          isRequired="reqDepartamento"
          :selectedItems="dataDepartamento"
        >
          <template v-slot:name> Seleccionar Departamento </template>
          <template v-slot:elvalor>Ver todos</template>
          <template v-slot:error> {{ errDepartamento }} </template>
        </tSelect>
        <!-- DISTRITO -->
        <tSelect
          class="col-span-12 pl-3 mt-3"
          :state="stateDistrito"
          v-bind:modelValue="selDistrito"
          v-on:update:modelValue="selDistrito = $event"
          :groupOpcion="false"
          isRequired="reqDistrito"
          :selectedItems="dataDistrito"
        >
          <template v-slot:name>Seleccionar Distrito</template>
          <template v-slot:elvalor>{{ mensajeDistrito }}</template>
          <template v-slot:error> {{ errDistrito }} </template>
        </tSelect>
        <div class="col-span-5 mt-3">
          <tButton
            @click="actVisualizar"
            type="sumit"
            class="mx-3 mb-1 w-full"
            color="skyBlue"
            size="md"
            round="md"
          >
            Visualizar
          </tButton>
        </div>
      </form>
      <tLabel
        color="blue"
        size="lg"
        weight="400"
        class="col-span-12 flex pt-3 items-center"
      >
        <img :src="selec" alt="filter" height="18" width="18" class="mr-3" />
        Seleccionar tipo de estudio
        <a class="ml-auto text-sm">{{ selectedCount }}/2</a>
      </tLabel>
      <p class="col-span-12 font-light text-xs leading-[18px] ml-8">
        Para una mejor visualización de información, puede elegir y comparar
        hasta dos capas de todas las disponibles.
      </p>
      <!-- SELECCION DE CAPAS CHECK -->
      <div class="col-span-12 pt-2">
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
                  'text-igp-muted': !checkedItems[index] && maxSelectionReached,
                  'text-gray-500 cursor-not-allowed text-sm':
                    maxSelectionReached && !checkedItems[index],
                  'text-igp-dark': checkedItems[index],
                  'font-light': checkedItems[index],
                  'font-semibold': checkedItems[index],
                  'hover:font-semibold':
                    !checkedItems.some((item) => item) ||
                    checkedItems.filter((item) => item).length < 2,
                }"
                class="text-sm select-none font-light leading-6"
              >
                {{ item.name }}
              </label>
            </div>
            <div class="tooltipmodal flex ml-auto">
              <input
                :disabled="!checkedItems[index]"
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                :value="setDefaultValueRange"
                @input="setRangeSlide(item.key, $event)"
                ref="rangeInput"
                class="h-[4px] w-[50px] bg-gray-200 range-xl rounded-lg appearance-none cursor-pointer"
                :class="{
                  'accent-igp-muted cursor-not-allowed': !checkedItems[index],
                  'accent-igp-sky-blue-750 cursor-pointer': checkedItems[index],
                  hidden: index >= 5 && index <= 7,
                }"
              />

              <span class="tooltiptextmodal" v-if="checkedItems[index]"
                >Ajusta transparencia de capa</span
              >
              <span class="tooltiptextmodal" v-if="!checkedItems[index]"
                >Activar capa</span
              >
            </div>
            <!-- :title="setDefaultValueRange[item.key]" -->
          </div>
        </div>
      </div>
      <tLabel color="blue" size="lg" weight="400" class="col-span-12 flex">
        <img :src="infoload" alt="filter" height="18" width="18" class="mr-3" />
        Información complementaria
      </tLabel>
      <!-- SELECCION DE TABS -->
      <div class="col-span-12 mt-4 p-0">
        <tTab :cantinfo="filteredData">
          <template v-slot:Informes>
            <!-- Contenido de la pestaña Informes -->
            <tInformes
              :departamento="selDepartamento"
              :distrito="selDistrito"
              :datajson="jsonData"
              :selecteditems="selectedItems"
            />
          </template>
          <template v-slot:Leyenda>
            <!-- Contenido de la pestaña Leyenda -->
            <tLeyenda
              :departamento="selDepartamento"
              :distrito="selDistrito"
              :idcapa1="selectedItemsId[0]"
              :capa1="selectedItems[0]"
              :namecapa1="selectedItemsName[0]"
              :idcapa2="selectedItemsId[1]"
              :capa2="selectedItems[1]"
              :namecapa2="selectedItemsName[1]"
              :jsonleyendacapa1="jsonleyendaCapa1"
              :jsonleyendacapa2="jsonleyendaCapa2"
            />
          </template>
          <template v-slot:Archivos>
            <!-- Contenido de la pestaña Archivos -->
            <tArchivos
              :departamento="selDepartamento"
              :distrito="selDistrito"
              :capa1="selectedItems[0]"
              :namecapa1="selectedItemsName[0]"
              :idcapa1="selectedItemsId[0]"
              :linkcapa1="selectedItemsLink[0]"
              :tematico1="selectedItemsLinkT[0]"
              :capa2="selectedItems[1]"
              :namecapa2="selectedItemsName[1]"
              :idcapa2="selectedItemsId[1]"
              :linkcapa2="selectedItemsLink[1]"
              :tematico2="selectedItemsLinkT[1]"
            />
          </template>
        </tTab>
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
import { ref, computed, watch } from "vue";
import axios from "axios";
import tTab from "@/components/ui/molecules/t-tab.vue";
import tLabel from "@/components/ui/atoms/t-label.vue";
import tSelect from "@/components/ui/atoms/t-select.vue";
import infoload from "@/assets/icons/infoload.svg";
import filter from "@/assets/icons/filter.svg";
import share from "@/assets/icons/share.svg";
import selec from "@/assets/icons/select.svg";
import tButton from "@/components/ui/atoms/t-button.vue";
import tLeyenda from "@/components/ui/molecules/tabs/t-leyenda.vue";
import tArchivos from "@/components/ui/molecules/tabs/t-archivos.vue";
import tInformes from "@/components/ui/molecules/tabs/t-informes.vue";
import tAlerta from "@/assets/icons/alerta.svg";
import { useGeojsonStore } from "@/stores/geojson.js";

const useGeojson = useGeojsonStore();
const setEnableRange = ref(true);
const rangeInput = ref(null);
const setDefaultValueRange = ref(0.8);

//DEPARTAMENTO
const selDepartamento = ref("");
const stateDepartamento = ref("enable");
//DISTRITO
const selDistrito = ref("");
const stateDistrito = ref("enable");
const mensajeDistrito = ref("Seleccionar departamento");

//CHECK LIST
const items = ref([
  {
    key: "1",
    link: "geomorfologia",
    tematico: "geomorfologia",
    id: "geomorfologia",
    name: "Geomorfología",
  },
  {
    key: "2",
    link: "geologia",
    tematico: "geologia",
    id: "geologia",
    name: "Geología",
  },
  {
    key: "3",
    link: "geodinamica",
    tematico: "geodinamica",
    id: "geodinamica",
    name: "Geodinámica",
  },
  {
    key: "4",
    link: "sucs",
    tematico: "sucs",
    id: "suelos",
    name: "Suelos (SUCS)",
  },
  {
    key: "5",
    link: "capacidadportante",
    tematico: "capacidadportante",
    id: "capacidad portante",
    name: "Capacidad de carga admisible",
  },
  {
    key: "6",
    link: "zonificacion/hv/HV",
    tematico: "zonificacion/hv",
    id: "vibracion ambiental",
    name: "Vibración Ambiental",
  },
  {
    key: "7",
    link: "zonificacion/masw/MASW",
    tematico: "zonificacion/masw",
    id: "MASW MAM",
    name: " MASW - MAM ",
  },
  {
    key: "8",
    link: "zonificacion/ert/ERT",
    tematico: "zonificacion/ert",
    id: "tomografia electrica",
    name: "Tomografía Eléctrica",
  },
  {
    key: "9",
    link: "zonificacion",
    tematico: "zonificacion",
    id: "zonificacion",
    name: "Zonificación Geofísica - Geotécnica",
  },
]);
const checkedItems = ref([
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
]);
const maxSelection = ref(0);
const selectedCount = computed(
  () => checkedItems.value.filter((item) => item).length
);
const maxSelectionReached = computed(
  () => selectedCount.value >= maxSelection.value
);
function handleCheckboxChange() {
  if (selectedCount.value > maxSelection.value) {
    const lastCheckedIndex = checkedItems.value.findIndex(
      (item, index) => item && !this.checkedItems[index]
    );
    checkedItems.value[lastCheckedIndex] = false;
  }
}

watch(
  () => useGeojson.mapDistrito,
  (newVal) => {
    if (newVal) {
      maxSelection.value = 2;
      setEnableRange.value = false;
    } else {
      checkedItems.value = [];
      maxSelection.value = 0;
      setEnableRange.value = true;
    }
  },
  { deep: true }
);

watch(selDistrito, (newVal) => {
  checkedItems.value = [];
  setDefaultValueRange.value = 0.8;
  setEnableRange.value = true;
  maxSelection.value = 0;
});
watch(selDepartamento, (newVal) => {
  selDistrito.value = "";
  mensajeDistrito.value = "--- Seleccionar ---";
  checkedItems.value = [];
  maxSelection.value = 0;
  if (!newVal) {
    selDistrito.value = "";
    mensajeDistrito.value = "Seleccionar departamento";
  }
});

// ENVIAR DATOS A ARCHIVOS
const selectedItems = computed(() => {
  return items.value
    .filter((item, index) => checkedItems.value[index])
    .map((item) => item.key);
});
const selectedItemsId = computed(() => {
  return items.value
    .filter((item, index) => checkedItems.value[index])
    .map((item) => item.id);
});
const selectedItemsName = computed(() => {
  return items.value
    .filter((item, index) => checkedItems.value[index])
    .map((item) => item.name);
});
const selectedItemsLink = computed(() => {
  return items.value
    .filter((item, index) => checkedItems.value[index])
    .map((item) => item.link);
});
const selectedItemsLinkT = computed(() => {
  return items.value
    .filter((item, index) => checkedItems.value[index])
    .map((item) => item.tematico);
});
//CARGAR DATOS DE DEPARTAMENTOS
const jsonData = ref([]);

axios
  .get("https://api.npoint.io/2e275d9ae61d96c1c98a")
  .then((response) => {
    jsonData.value = response.data;
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

const dataDepartamento = computed(() => {
  if (!jsonData.value) return [];

  return Object.keys(jsonData.value)
    .sort((a, b) => a.localeCompare(b)) // Ordena alfabéticamente los nombres de los departamentos
    .map((departamento) => ({
      value: departamento,
      name: departamento,
    }));
});

// LLENADO DE DISTRITO
const dataDistrito = computed(() => {
  if (!jsonData.value || !selDepartamento.value) return [];

  return jsonData.value[selDepartamento.value]
    .slice() // Creamos una copia del array para no modificar el original
    .sort((a, b) => a.ciudad.localeCompare(b.ciudad)) // Ordenamos alfabéticamente
    .map((distrito) => ({
      value: distrito.ciudad,
      name: distrito.ciudad,
    }));
});
// LLENADO DE CANTIDAD DE INFORMES
const filteredData = computed(() => {
  const data = jsonData.value[selDepartamento.value];
  let resultado = "";
  if (data === undefined) {
    resultado = "";
  } else {
    resultado = `(${data.length})`;
  }
  return resultado;
});
// LLENADO DE LEYENDA
const jsonleyendaCapa1 = ref([]);
const jsonleyendaCapa2 = ref([]);
async function get_leyenda_global_info(capa) {
  let url = "";
  if (capa === "MapServer") {
    url = `https://ide.igp.gob.pe/arcgis/rest/services/cienciastierrasolida/EstudiosZonificacion/MapServer/9?f=pjson`;
  } else {
    url = `https://ide.igp.gob.pe/arcgis/rest/services/cienciastierrasolida/EstudiosZonificacion/MapServer/${capa}?f=pjson`;
  }

  let data = await fetch(url);
  let datajson = await data.json();
  let styles = {
    geometria: datajson["geometryType"],
  };
  if (datajson["drawingInfo"]["renderer"]["uniqueValueInfos"]) {
    styles["campo"] = datajson["drawingInfo"]["renderer"]["field1"];
    datajson["drawingInfo"]["renderer"]["uniqueValueInfos"].forEach(
      (element) => {
        let llave = element["value"];
        let fondo =
          element["symbol"]["color"] || element["symbol"]["imageData"];
        let borde =
          element["symbol"]["outline"] && element["symbol"]["outline"]["color"];
        styles[llave] = [fondo, borde];
        //            styles[llave] = fondo;
      }
    );
  } else {
    let fondo =
      datajson["drawingInfo"]["renderer"]["symbol"]["color"] ||
      datajson["drawingInfo"]["renderer"]["symbol"]["imageData"];
    //console.log("sdsdsd", datajson);
    let borde =
      datajson["drawingInfo"]["renderer"]["symbol"]["outline"] &&
      datajson["drawingInfo"]["renderer"]["symbol"]["outline"]["color"];
    styles[" "] = [fondo, borde];
  }

  return styles;
}

async function get_leyenda_local_info({ capa, departamento, ciudad }) {
  const url = `https://ide.igp.gob.pe/arcgis/rest/services/cienciastierrasolida/EstudiosZonificacion/MapServer/${capa}/query?where=departamen%3D%27${departamento}%27+and+ciudad%3D%27${ciudad}%27&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=pjson`;
  let styles = await get_leyenda_global_info(capa);

  let data = await fetch(url);
  let datajson = await data.json();

  let resp = {
    geometria: styles["geometria"],
  };
  if (styles["campo"]) {
    let campo = styles["campo"];
    datajson["features"].forEach((feature) => {
      resp[feature["attributes"][campo]] = {
        ...styles[feature["attributes"][campo]],
        simbolo: feature["attributes"]["simbolo"]
      };
    });
  } else {
    resp[" "] = {
      ...styles[" "],
      simbolo: datajson["features"].map(feature => feature["attributes"]["simbolo"])
    };
  }

  if (capa === "2") {
    datajson["features"].forEach((feature, index) => {
      if (feature["attributes"]["símbolo"]) {
        const name = feature["attributes"]["unidades"];
        resp[name] = resp[name] || {};
        resp[name][2] = feature["attributes"]["símbolo"];
      }
    });
  }

  return resp;
}

const get_leyenda = async (capa, departamento, ciudad) => {
  if (capa && departamento && ciudad) {
    try {
      const resp = await get_leyenda_local_info({ capa, departamento, ciudad });
      return resp;
    } catch (error) {
      throw new Error("Error obteniendo la leyenda de información local");
    }
  }
};

watch(selDistrito, async (newValue, oldValue) => {
  jsonleyendaCapa1.value = [];
  try {
    jsonleyendaCapa1.value = await get_leyenda(
      selectedItems.value[0],
      toUpperCase(selDepartamento.value),
      newValue
    );
  } catch (error) {
    console.error(error);
  }

  jsonleyendaCapa2.value = [];
  try {
    jsonleyendaCapa2.value = await get_leyenda(
      selectedItems.value[1],
      toUpperCase(selDepartamento.value),
      newValue
    );
  } catch (error) {
    console.error(error);
  }
});

watch(selectedItems, async (newValue, oldValue) => {
  jsonleyendaCapa1.value = [];
  try {
    jsonleyendaCapa1.value = await get_leyenda(
      newValue[0],
      toUpperCase(selDepartamento.value),
      selDistrito.value
    );
  } catch (error) {
    console.error(error);
  }

  jsonleyendaCapa2.value = [];
  try {
    jsonleyendaCapa2.value = await get_leyenda(
      newValue[1],
      toUpperCase(selDepartamento.value),
      selDistrito.value
    );
  } catch (error) {
    console.error(error);
  }
});

// EXTRAS FUNCNIONES
const toUpperCase = (texto) => {
  return texto.toUpperCase();
};
//ENVIAR VALORES A MAP
watch(
  () => selectedItems.value[0],
  (newValue, oldValue) => {
    useGeojson.mapCapa1 = newValue;
  }
);
watch(
  () => selectedItems.value[1],
  (newValue, oldValue) => {
    useGeojson.mapCapa2 = newValue;
    if (useGeojson.mapOpacity1) {
      useGeojson.mapOpacity1 = 0.8;
    }
  }
);
const actVisualizar = () => {
  useGeojson.mapDepartamento = selDepartamento.value;
  useGeojson.mapDistrito = selDistrito.value;
};
const setRangeSlide = (key, valor) => {
  const value = event.target.value;
  const sendCapa1 = selectedItems.value[0];
  const sendCapa2 = selectedItems.value[1];

  if (sendCapa1 === key) {
    useGeojson.mapOpacity1 = value;
  } else if (sendCapa2 === key) {
    useGeojson.mapOpacity2 = value;
  }
};

/* const actCompartir = () => {
  get_leyenda(selectedItems.value[1], "ANCASH", "Casma");
}; */

/*   const selectedItems = items.value.filter(
    (item, index) => checkedItems.value[index]
  );
  console.log("SELECCIONADOS", selectedItems[0]); */
</script>
<style>
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
