<template>
  <div class="text-right">
    <label
      class="block text-start overflow-hidden rounded-md border px-3 py-1"
      :class="textClasses"
    >
      <span class="text-start text-xs font-medium" :class="spanClasses">
        <slot name="name"></slot>
      </span>

      <button
        :id="id"
        :data-dropdown-toggle="iddrop"
        @click="toggleDropdown"
        class="w-full flex justify-between focus:outline-none border-none text-sm py-0.5"
        :class="selectClasses"
        type="button"
      >
        {{ selectedOption }}
        <svg
          class="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      <!-- Dropdown menu -->
      <div
        :id="iddrop"
        :class="{ hidden: !dropdownOpen }"
        class=" hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
      >
        <ul class="py-1 text-sm text-gray-700" :aria-labelledby="id">
          <li
            class="flex items-center hover:bg-igp-brown hover:text-white"
            v-for="(item, index) in dropdownItems"
            :key="index"
            @click="selectOption(item.label)"
          >
            <img
              v-if="isIcon"
              height="28"
              width="28"
              :src="item.img"
              :alt="item.label"
              class="ml-2"
            />
            <p class="block py-2 pl-2">
              {{ item.label }}
            </p>
          </li>
        </ul>
      </div>
    </label>
    <span class="text-xs" :class="errorClasses"
      ><slot name="error"></slot
    ></span>
  </div>
</template>

<script>
import "flowbite";
import { initFlowbite } from "flowbite";
export default {
  name: "selectComponent",
  mounted() {
    initFlowbite();
  },
  data() {
    return {
      dropdownOpen: false,
    };
  },

  props: {
    isIcon: {
      type: Boolean,
      default: false,
    },
    selectedOption: {
      type: String,
    },
    dropdownItems: {
      type: Array,
      required: true,
    },
    iddrop: {
      type: String,
    },
    id: {
      type: String,
    },
    modelValue: {
      type: String,
    },
    state: {
      type: String,
      default: null,
    },
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    selectOption(option) {
      this.dropdownOpen = false;
      this.$emit("update:selectedOption", option);
    },
  },
  computed: {
    statelassesLabel() {
      const stateMappings = {
        enable:
          "border-gray-200 focus-within:border-igp-brown-800 elect-text focus-within:ring-1 focus-within:ring-igp-brown-800",
        disable:
          "bg-gray-100 border border-gray-300 text-igp-dark-500 select-none",
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
        disable: "text-igp-dark-500 select-none",
        error: "text-igp-red",
      };
      return stateMappings[this.state] || null;
    },
    spanClasses() {
      return `${this.stateSpan} `;
    },
    stateSelect() {
      const stateMappings = {
        enable: "bg-white select-text text-igp-dark",
        disable: "bg-gray-100 select-none text-igp-dark-500",
        error: "text-igp-dark bg-white",
      };
      return stateMappings[this.state] || null;
    },
    selectClasses() {
      return `${this.stateSelect} `;
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

    disabledComputed() {
      if (this.state === "disable") {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
<!-- <tDropdown
class="col-span-3"
id="idDireccion"
iddrop="idDropDireccion"
v-bind:selectedOption="selDireccion"
:state="stateDireccion"
:dropdownItems="dropdownItems"
:selectedOption="selDireccion"
:isIcon="true"
@update:selectedOption="updateSelectedOption"
>
<template v-slot:name> Dirección de dispersión </template>
<template v-slot:error> {{ errDireccion }} </template>
</tDropdown>
//DIRECCION
const selDireccion = ref("-- Seleccionar --");
const errDireccion = ref("Direccion error");
const stateDireccion = ref("enable");
const dropdownItems = ref([
  { label: "Norte", img: north },
  { label: "Noreste", img: noeast },
  { label: "Este", img: east },
  { label: "Sureste", img: soeast },
  { label: "Sur", img: south },
  { label: "Suroeste", img: sowest },
  { label: "Oeste", img: west },
  { label: "Noroeste", img: nowest },
]);
const updateSelectedOption = (option) => {
  selDireccion.value = option;
};
import north from "@/assets/icons/compass/north.svg";
import noeast from "@/assets/icons/compass/noeast.svg";
import east from "@/assets/icons/compass/east.svg";
import soeast from "@/assets/icons/compass/soeast.svg";
import south from "@/assets/icons/compass/south.svg";
import sowest from "@/assets/icons/compass/sowest.svg";
import west from "@/assets/icons/compass/west.svg";
import nowest from "@/assets/icons/compass/nowest.svg";


-->
