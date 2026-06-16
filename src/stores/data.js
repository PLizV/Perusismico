import { defineStore } from "pinia";
import axios from "axios";
import Papa from "papaparse";
import { fetchUsgsEarthquakes } from "@/services/usgsService";

export const useDataStore = defineStore("dataStore", {
  state: () => ({
    combinedData: [],
    dataGlobal: [],
    isLoadingPeru: true,
    isLoadingGlobal: true,
    // Estado para el consumo de la USGS API (modo Global)
    dataUSGS: [],
    isLoadingUSGS: false,
    usgsError: null,
    lastUsgsParams: null,
    realtimeEarthquake: null,
    realtimeFocusRequest: null,
  }),

  actions: {
    async fetchDataPeru() {
      try {
        const [responsePeru, responseHistory] = await Promise.all([
          axios.get("/datas/data_peru.csv"),
          axios.get("/datas/historicos.csv"),
        ]);

        const dataDiciembre = await this.parseCSV(responsePeru.data);
        const dataEnero = await this.parseCSV(responseHistory.data, true);
        this.combinedData = [...dataDiciembre, ...dataEnero];
        this.isLoadingPeru = false;
      } catch (error) {
        console.error("Error al cargar los datos Perú:", error);
        this.isLoadingPeru = false;
      }
    },

    async fetchDataGlobal() {
      if (!this.isLoadingGlobal && this.dataGlobal.length > 0) return;

      try {
        const [responsePeru, responseHistory] = await Promise.all([
          axios.get("/datas/datas.csv"),
          axios.get("/datas/historicos.csv"),
        ]);
        const dataDiciembre = await this.parseCSV(responsePeru.data);
        const dataEnero = await this.parseCSV(responseHistory.data, true);
        this.dataGlobal = [...dataDiciembre, ...dataEnero];
        this.isLoadingGlobal = false;
      } catch (error) {
        this.isLoadingGlobal = false;
        console.error("Error al cargar los datos Globales:", error);
      }
    },

    /**
     * Consume la USGS Earthquake API con los parámetros dados.
     * Guarda el resultado en dataUSGS para que t-map.vue lo reactive y pinte.
     * @param {Object} params - Ver fetchUsgsEarthquakes en usgsService.js
     */
    async fetchDataUSGS(params) {
      this.isLoadingUSGS = true;
      this.usgsError = null;
      this.dataUSGS = [];
      this.lastUsgsParams = { ...params };
      try {
        const geojson = await fetchUsgsEarthquakes(params);
        this.dataUSGS = geojson.features || [];
      } catch (error) {
        console.error("Error al consultar la USGS API:", error);
        this.usgsError = "Error al consultar la API de la USGS. Verifique los parámetros o intente más tarde.";
      } finally {
        this.isLoadingUSGS = false;
      }
    },

    /** Limpia los datos USGS */
    clearUsgsData() {
      this.dataUSGS = [];
      this.usgsError = null;
    },

    setRealtimeEarthquake(earthquake) {
      this.realtimeEarthquake = {
        ...earthquake,
        receivedAt: new Date().toISOString(),
      };
    },

    focusRealtimeEarthquake(earthquake = this.realtimeEarthquake) {
      if (!earthquake) return;

      this.realtimeFocusRequest = {
        earthquake,
        requestedAt: Date.now(),
      };
    },

    // Método para parsear CSV de forma asíncrona
    parseCSV(csvData, isHistorical = false) {
      return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            let data = result.data;
            if (isHistorical) {
              data = data.map((row) => ({
                time: `${row.fecha}T${row.hora}Z`,
                latitude: row.latitude,
                longitude: row.longitude,
                depth: row.depth,
                mag: row.mag,
                place: "-", // Valor por defecto
                magType: "-", // Valor por defecto
              }));
            }
            resolve(data);
          },
          error: (err) => reject(err),
        });
      });
    },

/*parseCSV(csvData, isHistorical = false) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        let data = result.data;
        if (isHistorical) {
          data = data.map((row) => {
            const rawTime = `${row.fecha}T${row.hora}Z`;
            const fechaHora = new Date(rawTime).toISOString().replace("T", " ").slice(0, 19);

            return {
              time: fechaHora,           
              latitude: row.latitude,
              longitude: row.longitude,
              depth: row.depth,
              mag: row.mag,
              place: row.place || "-",   
              magType: row.magType || "-",
            };
          });
        }
        resolve(data);
      },
      error: (err) => reject(err),
    });
  });
}*/

  },
}); 
