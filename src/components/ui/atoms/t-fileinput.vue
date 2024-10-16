<template>
  <div
    class="flex items-center content-center justify-between p-2 pl-4 border rounded-lg border-gray-200"
    :class="bgInputClass"
  >
    <!-- Botón "Seleccionar archivo" -->
    <label
      id="basesPdfCom4"
      class="pl-3 text-sm font-medium text-igp-dark select-none border-none"
      :class="textClasses"
    >
      Comunicado:
      <span class="text-igp-brown ml-1"> {{ nombreFile }} </span>
      <span
        class="ml-2 select-none"
        :class="{
          'text-igp-green': pesoColor === 'green',
          'text-igp-red': pesoColor === 'red',
        }"
      >
        {{ pesoFile }}
      </span>
    </label>

    <!-- Input de archivo -->
    <input
      type="file"
      @change="handleFileChange"
      ref="fileInput"
      class="hidden"
    />
    <button
      class="p-2 px-4 border-gray-400 border text-sm rounded-lg text-center"
      @click="openFileInput"
      :disabled="disabledComputed"
      :class="inputClasses"
    >
      Seleccionar Archivo
    </button>
  </div>
  <div class="flex justify-between">
    <small class="text-igp-brown ml-1 select-none" :class="hiddenSmall"
      >EL archivo debe estar en formato .pdf y no debe pesar mas de 15 Mb. </small
    ><span class="text-xs" :class="errorClasses"
      ><slot name="error"></slot
    ></span>
  </div>
</template>
<script>
export default {
  props: {
    state: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  data() {
    return {
      nombreFile: "Seleccione el archivo.",
      pesoFile: "",
      pesoColor: "",
    };
  },
  emits: ["file-selected"],
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file.type.includes("pdf")) {
        alert("Por favor, seleccione un archivo PDF.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        this.pesoColor = "red";
      } else {
        this.pesoColor = "green";
      }
      this.nombreFile = file.name;
      this.pesoFile = `| ${this.formatBytes(file.size)}`;
      this.$emit("file-selected", file);
    },
    openFileInput() {
      this.$refs.fileInput.click();
    },
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    },
  },
  computed: {
    statelassesLabel() {
      const stateMappings = {
        enable:
          "focus-within:border-igp-brown-800 focus-within:ring-1 focus-within:ring-igp-brown-800",
        disable: "bg-gray-100 border border-gray-300 text-igp-dark-500",
        error: "text-igp-red border-igp-red",
      };
      return stateMappings[this.state] || null;
    },
    textClasses() {
      return `${this.statelassesLabel} `;
    },

    stateSpan() {
      const stateMappings = {
        enable: "text-igp-dark elect-text ",
        disable: "text-igp-dark-500 ",
        error: "text-igp-red",
      };
      return stateMappings[this.state] || null;
    },
    spanClasses() {
      return `${this.stateSpan} `;
    },
    stateInput() {
      const stateMappings = {
        enable: "bg-white hover:bg-igp-dark-50 text-igp-dark ",
        disable: "bg-gray-100 select-none text-igp-dark-500 cursor-not-allowed",
        error: "bg-white hover:bg-igp-dark-50 text-igp-dark",
      };
      return stateMappings[this.state] || null;
    },
    inputClasses() {
      return `${this.stateInput} `;
    },

    stateError() {
      const stateMappings = {
        enable: "text-igp-white select-none",
        disable: "text-igp-white select-none",
        error: "text-igp-red select-none",
      };
      return stateMappings[this.state] || null;
    },
    errorClasses() {
      return `${this.stateError} `;
    },
    hiddenSmall() {
      if (this.state === "disable") {
        return "hidden";
      } else {
        return "block";
      }
    },
    disabledComputed() {
      if (this.state === "disable") {
        return true;
      } else {
        return false;
      }
    },
    bgInputClass() {
      if (this.state === "disable") {
        return "bg-gray-100 ";
      } else {
        return "bg-igp-white";
      }
    },
  },
};
</script>
