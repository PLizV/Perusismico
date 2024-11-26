<template>
  <div class="text-right">
    <div
      class="block rounded-md border text-start border-gray-200 px-3 z-50 "
      :class="textClasses"
    >
      <span
        class="text-start text-xs font-medium select-none"
        :class="spanClasses"
      >
        <slot name="name"></slot>
      </span>
      <slot name="calendar"></slot>
    </div>
    <span class="text-xs" :class="errorClasses">
      <slot name="error"></slot>
    </span>
  </div>
</template>

<script>
import VueDatePicker from "@vuepic/vue-datepicker";
export default {
  components: {
    VueDatePicker,
  },
  props: {
    state: {
      type: String,
    },
    place: {
      type: String,
    },
    type: {
      type: String,
    },
    maxValue: {
      type: String,
    },

    modelValue: {
      type: String,
    },
  },
  methods: {
    dateFormat(date) {
      if (!date) {
        return ""; // Devolver vacío si date es falso
      }
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },

  computed: {
    statelassesLabel() {
      const stateMappings = {
        enable:
          "focus-within:border-igp-blue focus-within:ring-1 focus-within:ring-igp-blue bg-igp-white",
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
        enable: "text-igp-blue elect-text ",
        disable: "text-igp-blue ",
        error: "text-igp-red",
      };
      return stateMappings[this.state] || null;
    },
    spanClasses() {
      return `${this.stateSpan} `;
    },
    stateInput() {
      const stateMappings = {
        enable: "bg-white select-text text-igp-blue",
        disable: "bg-gray-100 select-none text-igp-blue",
        error: "text-igp-dark bg-white",
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

    colorTime() {
      if (this.state === "disable") {
        return "#6d6d6d";
      } else {
        return "#333333";
      }
    },
  },
};
</script>
<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.dp__input_reg {
  border: none !important;
  z-index: 100;
  display: flex;
  padding: 4px 0px 3px 0px !important;
  margin-left: 20px !important;
  width: 100px !important;
  color: v-bind(colorTime) !important;
}
.dp__input_icon {
  margin-left: -12px !important;
  padding-top: 9px !important;
}
.dp__disabled {
  border: none;
  z-index: 100 !important;
  padding-top: 2px !important;
  display: flex;
  margin-left: -10px;
  color: rgb(156 163 175);
}
</style>
