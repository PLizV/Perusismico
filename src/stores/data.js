import { defineStore } from "pinia";
import axios from "axios";
import Papa from "papaparse";

export const useDataStore = defineStore("dataStore", {
  state: () => ({
    combinedData: [],
    dataGlobal: [],
    isLoadingPeru: true,
    isLoadingGlobal: true,
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
  },
});
