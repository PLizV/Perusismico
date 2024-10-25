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
            <span class="font-medium">PeSis </span>es una plataforma
            digital de observación sísmica desarrollada por el 
            <span class="font-medium">Instituto Geofísico del Perú (IGP)</span>,
            que ofrece acceso espacio-temporal a la actividad sísmica ocurrida en el 
            Perú y en el mundo, de manera visual e interactiva.
          </p>
            <p
            class="col-span-12 font-light pt-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3"
            style="line-height: 2"
          >
            Con una interfaz intuitiva, PerúSis permite filtrar sismos por fecha,región
            magnitud y profundidad,facilitando el análisis y consulta de eventos sísmicos. Esto la
            convierte en una herramienta clave para conocer las regiones potencialmente sísmicas y gestionar
            la educación del riesgo.
          </p>
          <p
            class="col-span-12 font-light pt-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl mt-3"
            style="line-height: 2"
          >
           En Perú utiliza información del
                      <span class="font-medium">
              Centro Sismológico Nacional (CENSIS)
            </span>
            y, a nivel mundial, del
            <span class="font-medium">
              National Earthquake Information Center (NEIC)
            </span>
            de la U.S
            <span class="font-medium">
              U.S Geological Survey (USGS)
            </span>    
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
        <div class="globe" ref="globeContainer"></div>
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
setInterval(() => {
  // Actualizar la animación o los datos del globo
}, 1000 / 15); // 30 FPS, por ejemplo

onMounted(() => {
  const world = createGlobe()(globeContainer.value);
  if (world) {
    world
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .pointOfView({ lat: 0, lng: 0, altitude: 1.3 }) // Cambiar lat/lng para centrar mejor el globo
      .polygonCapColor(() => 'rgba(0, 0, 255, 0.6)')
      .polygonSideColor(() => 'rgba(0, 80, 0, 0.01)')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
     
    if (world.controls) {
      world.controls().autoRotate = true;
      world.controls().autoRotateSpeed = -1.1;
    } else {
      console.error('Error: world.controls() no está disponible.');
    }

    setTimeout(() => {
      world.width(globeContainer.value.offsetWidth);
      world.height(globeContainer.value.offsetHeight);
    }, 200); // Pequeño retraso para asegurarse de que el DOM está listo
    // Cargar los datos de los países desde un archivo GeoJSON
   } 
   window.addEventListener('resize', () => {
    if (globeContainer.value) {
      world.width([globeContainer.value.offsetWidth]);
      world.height([globeContainer.value.offsetHeight]);
    }
  });
  document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    world.controls().autoRotate = false; // Pausar la rotación cuando no sea visible
  } else {
    world.controls().autoRotate = true;  // Reanudar la rotación
  }
});
  // Añadir los anillos de propagación utilizando datos aleatorios
  const N = 30; // Aumentamos el número de anillos para el Cinturón de Fuego
  const gData = [...Array(N).keys()].map(() => {
  const region = Math.random();

  if (region < 0.2) {
    // América del Norte y América del Sur (costa oeste)
    return {
      lat: Math.random() * (60 - -55) + -55, // Latitudes entre 60°N y -55°S
      lng: Math.random() * (-60 - -130) + -130, // Longitudes entre -60° y -130°
      maxR: Math.random() * 20 + 3,
      propagationSpeed: (Math.random() - 0.5) * 20 + 1,
      repeatPeriod: Math.random() * 2000 + 200
    };
  } else if (region < 0.4) {
    // Este, noreste, sureste, oeste de Asia
    const subRegion = Math.random();
    if (subRegion < 0.5) {
      return {
        lat: Math.random() * (60 - 0) + 0, // Latitudes entre 0° y 60°N
        lng: Math.random() * (160 - 100) + 100, // Longitudes entre 100° y 160°
        maxR: Math.random() * 20 + 3,
        propagationSpeed: (Math.random() - 0.5) * 20 + 1,
        repeatPeriod: Math.random() * 2000 + 200
      };
    } else if (subRegion < 0.75) {
      return {
        lat: Math.random() * (60 - 30) + 30, // Latitudes entre 30°N y 60°N
        lng: Math.random() * (160 - 120) + 120, // Longitudes entre 120°E y 160°E
        maxR: Math.random() * 20 + 3,
        propagationSpeed: (Math.random() - 0.5) * 20 + 1,
        repeatPeriod: Math.random() * 2000 + 200
      };
    } else {
      return {
        lat: Math.random() * (60 - 0) + 0, // Latitudes entre 0° y 60°N
        lng: Math.random() * (80 - 30) + 30, // Longitudes entre 30°E y 80°E
        maxR: Math.random() * 20 + 3,
        propagationSpeed: (Math.random() - 0.5) * 20 + 1,
        repeatPeriod: Math.random() * 2000 + 200
      };
    }
  } else if (region < 0.6) {
    // Región entre América y África (Atlántico)
    return {
      lat: Math.random() * (30 - -40) + -40, // Latitudes entre -40° y 30°N
      lng: Math.random() * (20 - -60) + -60, // Longitudes entre -60° y 20°E (Atlántico)
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

const colorForRegion = (lat, lng) => {
  if (lng < -60 && lng > -130) {
    return 'rgba(255,0,8,0.6)'; // América del Norte y del Sur (costa oeste)
  } else if (lng > 100 && lng < 160) {
    return 'rgba(0, 255, 0, 0.6)'; // Asia (este y sureste)
  } else if (lng > 120 && lng < 160) {
    return 'rgba(0, 0, 255, 0.6)'; // Noreste de Asia
  } else if (lng > 30 && lng < 80) {
    return 'rgba(255, 240, 4, 0.6)'; // Oeste de Asia
  } else if (lng > -60 && lng < 20) {
    return 'rgba(100,255,0,0.4)'; // Atlántico entre América y África
  } else {
    return 'rgba(255, 0, 0, 0.6)'; // Otros lugares (por ejemplo, Oceanía)
  }
};

  world
  .ringsData(gData)
  .ringColor(({ lat, lng }) => colorForRegion(lat, lng)) // Asigna un color específico según la región
  .ringMaxRadius('maxR')
  .ringPropagationSpeed('propagationSpeed')
  .ringRepeatPeriod('repeatPeriod');
}); 
</script>


<style scoped>

.globe {
  width: 50vw; /* Ancho proporcional al viewport */
  height: 50vw; /* Altura igual para mantener la forma circular */
  max-width: 750px; /* Limitar el tamaño máximo */
  max-height: 750px; /* Limitar la altura máxima */
  border-radius: 50%; /* Mantener la forma circular */
  margin: auto; /* Centrar la elipse */
  box-shadow: 0 4px 47px 20px rgba(4, 57, 172, 0.692); /* Sombra */
  overflow: hidden; /* Asegura que no se desborde el contenido */
  margin-top: 30px; /* Ajusta el valor para mover el globo más abajo */
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
  .globe {
    width: 60vw; /* Ajustar el tamaño en pantallas más pequeñas */
    height: 60vw; /* Mantener la forma circular */
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 480px) {
  .globe {
    width: 80vw; /* Aumentar el tamaño en pantallas muy pequeñas */
    height: 80vw; /* Mantener la forma circular */
    max-width: 400px; /* Limitar el tamaño máximo */
    max-height: 400px;
  }
}
</style>