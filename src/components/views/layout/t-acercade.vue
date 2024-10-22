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
          class="col-span-12 mt-4 text-igp-blue font-medium text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl"
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

        <div class="ellipse" ref="globeContainer"></div>

        </div>
    </main>
  </div>
</template>

<script setup>
import theader from "@/components/ui/atoms/t-header.vue";
/*import mapa from '@/components/views/layout/mapa.jpg';*/
import { onMounted, ref } from 'vue';
import createGlobe from 'globe.gl';


const globeContainer = ref(null);

onMounted(() => {
  const world = createGlobe()(globeContainer.value);
  
  if (world) {
    world
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .pointOfView({ lat: 0, lng: -60, altitude: 2.5 }, 5000) // Cambiar lat/lng para centrar mejor el globo
      .polygonCapColor(() => 'rgba(0, 0, 255, 0.6)')
      .polygonSideColor(() => 'rgba(0, 80, 0, 0.01)')
    //  .polygonLabel(({ properties: d }) => `
      //  <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
     //   Population: <i>${Math.round(+d.POP_EST / 1e4) / 1e2}M</i>
     // `);

    if (world.controls) {
      world.controls().autoRotate = true;
      world.controls().autoRotateSpeed = 1.8;
    } else {
      console.error('Error: world.controls() no está disponible.');
    }
    // Cargar los datos de los países desde un archivo GeoJSON
   } 

  // Añadir los anillos de propagación utilizando datos aleatorios
  const N = 50; // Aumentamos el número de anillos para el Cinturón de Fuego
  const gData = [...Array(N).keys()].map(() => {
  const region = Math.random();

  // Regiones del Cinturón de Fuego
  if (region < 0.3) {
    // América del Norte y América del Sur (costa oeste)
    return {
      lat: Math.random() * (60 - -55) + -55, // Latitudes entre 60°N y -55°S
      lng: Math.random() * (-60 - -130) + -130, // Longitudes entre -60° y -130°
      maxR: Math.random() * 20 + 3,
      propagationSpeed: (Math.random() - 0.5) * 20 + 1,
      repeatPeriod: Math.random() * 2000 + 200
    };
  } else if (region < 0.6) {
    // Este y sureste de Asia
    return {
      lat: Math.random() * (60 - 0) + 0, // Latitudes entre 0° y 60°N
      lng: Math.random() * (160 - 100) + 100, // Longitudes entre 100° y 160°
      maxR: Math.random() * 20 + 3,
      propagationSpeed: (Math.random() - 0.5) * 20 + 1,
      repeatPeriod: Math.random() * 2000 + 200
    };
  } else {
    // Oceanía (Nueva Zelanda)
    return {
      lat: Math.random() * (-10 - -50) + -50, // Latitudes entre -10° y -50°
      lng: Math.random() * (180 - 160) + 160, // Longitudes entre 160° y 180°
      maxR: Math.random() * 20 + 3,
      propagationSpeed: (Math.random() - 0.5) * 20 + 1,
      repeatPeriod: Math.random() * 2000 + 200
    };
  }
});

const colorInterpolator = t => `rgba(255,0,50,${Math.sqrt(1 - t)})`;

  world
    .ringsData(gData)
    .ringColor(() => colorInterpolator)
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('propagationSpeed')
    .ringRepeatPeriod('repeatPeriod');

});
</script>

<style scoped>
.ellipse {
  width: 50vw; /* Reducir el tamaño para evitar desbordamiento */
  height: 50vw; /* Ajustar para que sea proporcional al ancho */
  max-width: 830px; /* Limitar el tamaño máximo */
  max-height: 830px; /* Limitar el tamaño máximo */
  display:flex;
  border-radius: 50%; /* Mantén el círculo */
  position: absolute;
  top: 7vh; /* Ajusta según sea necesario para centrar */
  left: 70%; /* Centra horizontalmente */
  transform: translateX(-50%); /* Centra horizontalmente */
  box-shadow: 0 4px 47px 20px rgba(62, 23, 202, 0.514);
  overflow: hidden;
}
.ellipse canvas {
  width: 100%; /* Asegura que el canvas ocupe todo el espacio */
  height: 100%; /* Asegura que el canvas ocupe todo el espacio */
  object-fit: cover;
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
    width: 20vw; /* Ajusta el tamaño según el ancho de la pantalla */
    height: 30vw; /* Mantén la misma proporción para el círculo */
    top: 30vh; /* Ajusta la posición en pantallas más pequeñas */
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 480px) {
  .ellipse {
    width: 20vw;
    height: 30vw;
    top: 20vh;
  }
}
</style>