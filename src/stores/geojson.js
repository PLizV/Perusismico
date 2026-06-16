import { defineStore } from "pinia";
import { ref } from "vue";

export const useGeojsonStore = defineStore('geojson', () => {
    const estadoPl = ref("enable");

    const currentDate = new Date();
    const twoYearsAgo = new Date();
    currentDate.setFullYear(currentDate.getFullYear() - 2);

    const setlimits = ref({
       // minLatitude: -55.0,
       // maxLatitude: 81.0,
       // minLongitude: -168.0,
       // maxLongitude: 180.0,
    minLatitude: -18.35,
    maxLatitude: -0.03,
    minLongitude: -81.33,
    maxLongitude: -68.65,
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
    const animationType = ref("1");

    const setZoom = ref(false);

    const departamento = ref("peru")

    return {
        estadoPl,
        continente, rangoFechas, rangoMagnitud, profundidad, animationType, setZoom, departamento
    };
});
