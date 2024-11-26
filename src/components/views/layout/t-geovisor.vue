<template>
  <div>
    <div>
      <div
        class="z-10 relative bg-white px-4 sm:px-20 md:px-20 lg:px-20 xl:px-20 2xl:px-20 shadow-[0px_4px_4px_0px_#00000024] theader-animation"
      >
        <theader></theader>
      </div>
    </div>
    <tmap class="tmap"></tmap>
    <tmodal class="tmodal"></tmodal>
  </div>
</template>

<script setup>
import tmap from "@/components/ui/templates/t-map.vue";
import theader from "@/components/ui/atoms/t-header.vue";
import tmodal from "@/components/ui/templates/t-modal.vue";
</script>

<style scoped>
/* Agregar estilos CSS para controlar el apilamiento */
</style>
