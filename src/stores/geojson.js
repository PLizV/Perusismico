import { defineStore } from "pinia";
import { ref } from "vue";

export const useGeojsonStore = defineStore('geojson', () => {
    const estadoPl = ref("enable");

    const currentDate = new Date();
    const twoYearsAgo = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 2);

    const setlimits = ref({
        minLatitude: -55.0,
        maxLatitude: 81.0,
        minLongitude: -168.0,
        maxLongitude: 180.0,
    });


    const continente = ref(setlimits);
    const rangoFechas = ref({
        startDate: currentDate,
        endDate: twoYearsAgo,
    });
    const rangoMagnitud = ref({
        maxMag: 4,
        minMag: 9.5,
    });
    const profundidad = ref({
        isSuperficial: true,
        isIntermediate: true,
        isDeep: true,
    });

    const setZoom = ref(false);

    return {
        estadoPl,
        continente, rangoFechas, rangoMagnitud, profundidad, setZoom
    };
});
