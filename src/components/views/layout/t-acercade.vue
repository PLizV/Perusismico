<template>
  <div class="h-screen">
    <div
      class="z-10 relative bg-white px-4 sm:px-10 md:px-10 lg:px-10 xl:px-10 2xl:px-10 shadow-[0px_4px_4px_0px_#00000024]"
    >
      <theader></theader>
    </div>

    <main class="grid grid-cols-12" style="height: calc(100vh - 4.25rem)">
      <div class="col-span-5 py-16 pl-20">
        <div
          class="grid grid-cols-12 px-4 py-4 bg-white rounded-2xl select-none"
        >
          <!--  sm: md: lg: xl: 2xl: -->
          <span
           class="col-span-12 mt-4 text-igp-blue font-medium text-base sm:text-lg md:text-lg lg:text-lg xl:text-xl 2xl:text-xl"
          >
            Plataforma de Observatorio Sísmico
          </span>
          <p class="col-span-12 text-igp-blue text-7xl font-bold mt-1">
            Perú<span class="italic font-medium"> Sísmico</span>
          </p>
          <p
             class="col-span-12 font-light pt-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3"
             style="line-height: 2"
          >
            <span class="font-medium">Perú Sísmico </span>es una plataforma
            digital de observatorio sísmico creada por el
            <span class="font-medium">Instituto Geofísico del Perú (IGP)</span>,
            que ofrece acceso a datos en tiempo real sobre la actividad sísmica
            de Perú y del mundo. Utilizando la información del
            <span class="font-medium">
              Centro Sismológico Nacional (CENSIS)
            </span>
            y del
            <span class="font-medium">
              National Earthquake Information Center (NEIC)
            </span>
            , garantiza datos confiables y precisos.
          </p>
          <p
             class="col-span-12 font-light pt-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3"
             style="line-height: 2"
          >
            Con su interfaz intuitiva, permite filtrar sismos por magnitud,
            región y fecha, facilitando el análisis y la consulta de eventos
            sísmicos. Dirigida a ciudadanos, investigadores y autoridades, Perú
            Sísmico es una herramienta clave para mejorar la prevención y
            gestión del riesgo sísmico de forma eficiente y accesible.
          </p>

          <div class="col-span-12 flex py-6 mt-4">
            <router-link
              to="/visor"
              class="bg-igp-blue text-igp-white px-16 hover:bg-igp-blue-600 shadow-lg rounded-lg justify-center py-2 flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base"
            >
              Iniciar
            </router-link>
            <router-link
              to="/creditos"
              class="bg-igp-white text-igp-blue px-16 hover:bg-igp-dark-50 border ml-4 border-igp-blue shadow-lg rounded-lg justify-center py-2 flex sm:inline md:inline lg:inline xl:inline 2xl:inline text-sm sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base"
            >
              Créditos
            </router-link>
          </div>
        </div>
      </div>
      <div class="col-span-7">

        <div class="ellipse" :style="{ backgroundImage: `url(${mapa})` }"></div>
       </div>
    </main>
  </div>
</template>

<script setup>
import theader from "@/components/ui/atoms/t-header.vue";
import mapa from '@/components/views/layout/mapa.jpg';
</script>
<style scoped>
.ellipse {
  width: 50vw; /* Reducir el tamaño para evitar desbordamiento */
  height: 50vw; /* Ajustar para que sea proporcional al ancho */
  max-width: 830px; /* Limitar el tamaño máximo */
  max-height: 830px; /* Limitar el tamaño máximo */
  display: flex;
  border-radius: 50%; /* Mantén el círculo */
  position: absolute;
  top: 7vh; /* Ajusta según sea necesario para centrar */
  left: 70%; /* Centra horizontalmente */
  transform: translateX(-50%); /* Centra horizontalmente */
  background-size: 175%; /* Asegura que la imagen ocupe todo el círculo */
  background-position: center; /* Centra la imagen dentro del círculo */
  background-repeat: no-repeat;
  box-shadow: 0 4px 47px 20px rgba(0, 0, 201, 0.555);
  animation: slide-horizontal 8s linear infinite;
  overflow: hidden;
}
@keyframes slide-horizontal {
            0% {
                background-position: left center; /* Empieza en la izquierda */
            }
            100% {
                background-position: right center; /* Termina en la derecha */
            }
        }
@media (max-width: 768px) {
  .ellipse {
    width: 50vw; /* Ajusta el tamaño según el ancho de la pantalla */
    height: 50vw; /* Mantén la misma proporción para el círculo */
    top: 30vh; /* Ajusta la posición en pantallas más pequeñas */
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 480px) {
  .ellipse {
    width: 50vw;
    height: 50vw;
    top: 50vh;
  }
}
</style>