<template>
  <div>
    <div>
      <div
        class="sticky z-20 bg-white w-full px-4 sm:px-20 md:px-20 lg:px-20 xl:px-20 2xl:px-20 shadow-[0px_4px_4px_0px_#00000024] theader-animation"
      >
        <theader></theader>
      </div>
    </div>
    <tmap class="tmap sticky"></tmap>

    <tmodal
      class=" pb-6 hidden sm:hidden md:hidden lg:block xl:block 2xl:block"
    ></tmodal>
    <tmodalMovil
      class=" hidden sm:hidden md:block lg:hidden xl:hidden 2xl:hidden"
    ></tmodalMovil>
    <tmodalMovil2
      class=" block sm:block md:hidden lg:hidden xl:hidden 2xl:hidden"
    ></tmodalMovil2>
  </div>
</template>

<script setup>
import tmap from "@/components/ui/templates/t-map.vue";
import theader from "@/components/ui/atoms/t-header.vue";
import tmodal from "@/components/ui/templates/t-modal.vue";
import tmodalMovil from "@/components/ui/templates/t-modalmovil.vue";
import tmodalMovil2 from "@/components/ui/templates/t-modalmovil2.vue";
</script>

<style scoped>
/* Agregar estilos CSS para controlar el apilamiento */
</style>
