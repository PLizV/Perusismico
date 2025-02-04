import { defineStore } from "pinia";

export const useConfigStore = defineStore("configStore", {
  state: () => ({
    switchStatus: "peru",
  }),
  actions: {
    switchActiveTab(tab) {
      this.switchStatus = tab;
    },
  },
});
