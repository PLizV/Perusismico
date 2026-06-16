<template>
  <div>
    <div>
      <div
        class="fixed z-20 bg-white w-full px-4 sm:px-6 md:px-20 lg:px-20 xl:px-20 2xl:px-20 shadow-[0px_4px_4px_0px_#00000024] theader-animation"
      >
        <theader></theader>
      </div>
    </div>
    <tmap class="tmap sticky"></tmap>

    <!-- Wrapper div maneja visibilidad para no pisar el display:flex del componente -->
    <div class="hidden sm:hidden md:hidden lg:block xl:block 2xl:block pt-10">
      <tmodal></tmodal>
    </div>
    <div class="block sm:block md:block lg:hidden xl:hidden 2xl:hidden pt-20">
      <tmodalMovil></tmodalMovil>
    </div>
  </div>
</template>

<script setup>
import tmap from "@/components/ui/templates/t-map.vue";
import theader from "@/components/ui/atoms/t-header.vue";
import tmodal from "@/components/ui/templates/t-modal.vue";
import tmodalMovil from "@/components/ui/templates/t-modalmovil.vue";
</script>

<style scoped>
</style>