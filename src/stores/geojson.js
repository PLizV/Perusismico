import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useGeojsonStore = defineStore('geojson', () => {

    const dataGeojson = ref([]);
    const mapDepartamento = ref("");
    const mapDistrito = ref("");
    const mapCapa1 = ref("");
    const mapCapa2 = ref("");
    const mapOpacity1 = ref("");
    const mapOpacity2 = ref("");

    const listGeojson = async (capa, departamento, distrito) => {
        try {
            const response = await axios.get(`https://ide.igp.gob.pe/arcgis/rest/services/cienciastierrasolida/EstudiosZonificacion/MapServer/${capa}/query?where=departamen%3D%27${departamento}%27+and+ciudad%3D%27${distrito}%27&text=&objectIds=&time=&timeRelation=esriTimeRelationOverlaps&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&resultOffset=&resultRecordCount=&returnExtentOnly=false&sqlFormat=none&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson`);
            const filteredFeatures = response.data.features.map(feature => {
                const { coordinates, ...rest } = feature.geometry;
                return { ...feature, geometry: rest };
            });

            const filteredGeojson = { ...response.data, features: filteredFeatures };

            dataGeojson.value = filteredGeojson;
            return filteredGeojson;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            throw error;
        }
    };

    return {
        dataGeojson,
        listGeojson,
        mapDepartamento, mapDistrito, mapCapa1, mapCapa2, mapOpacity1, mapOpacity2
    };
});
