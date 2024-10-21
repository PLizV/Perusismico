<template>
  <div>
    <div>
      <theader
        class="fixed bg-white w-full px-4 sm:px-6 md:px-8 lg:px-10 xl: 2xl:px-10 z-20 shadow-[0px_4px_4px_0px_#00000024]"
      ></theader>
    </div>
    <tmap class="tmap sticky" :startDate="startDate" :endDate="endDate"></tmap>
    <tmodal
      class="tmodal hidden sm:hidden md:hidden lg:block xl:block 2xl:block" 
       @update-dates="handleDateUpdate"
    ></tmodal>
    <tmodalMovil
      class="tmodal block sm:block md:block lg:hidden xl:hidden 2xl:hidden"
    ></tmodalMovil>
  </div>
</template>

<script setup>
import { ref } from "vue";
import tmap from "@/components/ui/templates/t-map.vue";
import theader from "@/components/ui/atoms/t-header.vue";
import tmodal from "@/components/ui/templates/t-modal.vue";
import tmodalMovil from "@/components/ui/templates/t-modalmovil.vue";

const startDate = ref(null);
const endDate = ref(null);

const handleDateUpdate = ({ startDate: newStartDate, endDate: newEndDate }) => {
  startDate.value = newStartDate;
  endDate.value = newEndDate;
};
</script>

<style scoped>
/* Agregar estilos CSS para controlar el apilamiento */

.tmodal {
  position: absolute;
  top: 0;
}
</style>
