<template>
  <div>
    <div>
      <theader
        class="fixed bg-white w-full px-4 sm:px-6 md:px-8 lg:px-10 xl: 2xl:px-10 z-20 shadow-[0px_4px_4px_0px_#00000024]"
      ></theader>
    </div>
    <tmap class="tmap sticky" :alldata="alldata" :setlimits="setlimits"></tmap>
    <tmodal
      class="tmodal hidden sm:hidden md:hidden lg:block xl:block 2xl:block"
      @update-data="handleDateUpdate"
      @update-limits="handleLimitsUpdate"
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

const currentDate = new Date();
const twoYearsAgo = new Date();
currentDate.setFullYear(currentDate.getFullYear() - 2);

const alldata = ref({
  startDate: currentDate,
  endDate: twoYearsAgo,
  maxMag: 4,
  minMag: 9.5,
  isSuperficial: true,
  isIntermediate: true,
  isDeep: true,
});

const handleDateUpdate = (newDates) => {
  alldata.value = newDates;
};

const setlimits = ref({
  minLatitude: -55.0,
  maxLatitude: 81.0,
  minLongitude: -168.0,
  maxLongitude: 180.0,
});

const handleLimitsUpdate = (newDates) => {
  setlimits.value = newDates;
};
</script>

<style scoped>
/* Agregar estilos CSS para controlar el apilamiento */

.tmodal {
  position: absolute;
  top: 0;
}
</style>
