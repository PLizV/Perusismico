<template>
  <div>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[rgb(239,248,255)] border-igp-dark-100 border-y-[1px]">
          <th class="px-4 py-2">
            <tLabel color="brown" weight="500" size="sm"> # </tLabel>
          </th>
          <th class="px-4" v-for="column in filteredColumns" :key="column.key">
            <tLabel color="brown" weight="500" size="sm">
              {{ column.label }}
            </tLabel>
          </th>
          <th class="px-4">
            <tLabel color="brown" weight="500" size="sm">
              ESTADO DE CANALES DE PUBLICACIÓN
            </tLabel>
          </th>

          <th class="px-4">
            <tLabel color="brown" weight="500" size="sm"> ACCIONES </tLabel>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="(item, index) in data" :key="index">
          <td class="text-center py-3">{{ index + 1 }}</td>
          <td
            v-for="column in filteredColumns"
            :key="column.key"
            class="text-center py-3"
          >
            <tLabel
              color="black"
              weight="400"
              size="sm"
              extraClass="px-4 py-2 "
            >
              {{ item[column.key] }}
            </tLabel>
          </td>
          <td class="py-3">
            <div class="flex justify-center flex-wrap">
              <tButton
                v-for="(stateColor, stateIndex) in stateColors"
                :key="stateIndex"
                @click="stateAccion(item, stateIndex)"
                class="mx-1 mb-1"
                icon
                :color="stateColor.Color"
                size="xs"
                round="md"
              >
                <img
                  :src="stateColor.svg"
                  alt="check svg"
                  class="w-4 h-4 mr-2"
                />
                {{ stateColor.name }}
              </tButton>
            </div>
          </td>
          <td class="flex justify-center py-3 gap-4">
            <div class="tooltip" v-if="able2download">
              <img
                class="w-5 h-5 hover:cursor-pointer"
                :src="svgArchiveABL"
                @click="descargarArchivo(item)"
              />
              <span class="tooltiptext">Ver archivo</span>
            </div>
            <div class="tooltip" v-else>
              <img class="w-5 h-5" :src="svgArchiveDIS" />
              <span class="tooltiptext">Ver archivo (deshabilitado)</span>
            </div>

            <div class="tooltip">
              <img
                class="w-5 h-5 hover:cursor-pointer"
                :src="svgPencil"
                @click="editarItem(item)"
              />
              <span class="tooltiptext">Editar</span>
            </div>

            <div class="tooltip">
              <img
                class="w-5 h-5 hover:cursor-pointer"
                :src="svgTrash"
                @click="eliminarItem(item)"
              />
              <span class="tooltiptext">Eliminar</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <tModal
      class="fixed inset-0 flex items-center justify-center backdrop-blur-md"
      :isModalVisible="isOpen"
      :valCompModal="activeReport"
      @update:isModalVisible="updateModalVisibility"
    />
  </div>
</template>

<script setup>
import svgArchiveABL from "@/assets/icons/ableArchive.svg";
import svgArchiveDIS from "@/assets/icons/disabArchive.svg";
import svgPencil from "@/assets/icons/pencil.svg";
import svgTrash from "@/assets/icons/trash.svg";
import tLabel from "./t-label.vue";
import tButton from "./t-button.vue";
import tModal from "@/components/ui/templates/t-modal.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useGlobalVariables } from "@/stores/variables";
const useVariables = useGlobalVariables();

const route = useRoute();
const isOpen = ref(false);
const activeReport = ref(true);

const checkRoute = () => {
  activeReport.value = route.path === "/ultimos-registros";
};
checkRoute();
watch(
  () => route.path,
  () => {
    checkRoute();
  }
);

const { columns, data } = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  stateColors: {
    type: Array,
    required: true,
  },
  able2download: {
    type: Boolean,
    default: true,
  },
});

const filteredColumns = columns.filter((column) =>
  ["NAME", "COD", "ALERT", "DATE", "EVENT"].includes(column.key)
);

const descargarArchivo = (index) => {
  console.log("Descargar archivo", index);
};

const editarItem = (index) => {
  useVariables.valTypeRegistro = "Editar Registro";
  isOpen.value = !isOpen.value;
  console.log("Editar item", index);
};

const eliminarItem = (index) => {
  useVariables.valTypeRegistro = "Eliminar Registro";

  isOpen.value = !isOpen.value;
  console.log("Eliminar item", index);
};
const stateAccion = (stateColor, stateIndex) => {
  console.log("--->", stateIndex);
  console.log(stateColor);
};
const updateModalVisibility = (value) => {
  isOpen.value = value;
};
</script>

<style scoped>
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
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

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
