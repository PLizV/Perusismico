<template>
  <div class="text-right select-none">
    <div class="flex border rounded-lg " :class="textClasses">
      <img :src="gps" alt="img_gps" height="30" width="30" class="" />
      <label
        :for="id"
        class="block w-full text-start overflow-hidden pr-3 py-[2px] text-xs sm:text-xs md:text-xs lg:text-base xl:text-base 2xl:text-base "
      >
        <span class="text-start text-xs font-medium" :class="spanClasses">
          <slot name="name"></slot>
        </span>
        <select
          :id="id"
          :disabled="disabledComputed"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :class="selectClasses"
          class="outline-none myselect w-full text-start border-none p-0 focus:border-transparent focus:outline-none focus:ring-0 text-sm"
        >
          <optgroup
            v-if="groupOpcion"
            v-for="region in itemsgroup"
            :label="region.region"
            :key="region.region"
          >
            <option
              v-for="volcano in region.volcanes"
              :value="volcano.to"
              :key="volcano.to"
            >
              {{ volcano.labText }}
            </option>
          </optgroup>
          <option
            v-else
            v-for="(item, index) in selectedItems"
            class="text-sm"
            :value="item.value"
            :key="index"
          >
            {{ item.name }}
          </option>
        </select>
      </label>
    </div>
    <span class="text-xs" :class="errorClasses"> </span>
  </div>
</template>

<script>
import "flowbite";
import gps from "@/assets/icons/gps.svg";
export default {
  name: "selectComponent",
  data() {
    return {
      gps: gps,
    };
  },
  props: {
    groupOpcion: {
      type: Boolean,
      default: false,
    },
    itemsgroup: {
      type: Array,
    },
    selectedItems: {
      type: Array,
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
  computed: {
    statelassesLabel() {
      const stateMappings = {
        enable:
          "border-gray-200 focus-within:border-igp-blue elect-text focus-within:ring-1 focus-within:ring-igp-blue bg-igp-white",
        disable: "bg-gray-100 border border-gray-300 text-igp-blue select-none",
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
        disable: "text-igp-blue select-none",
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
<style>
.myselect option:hover {
  background-color: #0032ff !important;
}

.myselect option:checked {
  background-color: #0032ff;
  color: white;
}
</style>
