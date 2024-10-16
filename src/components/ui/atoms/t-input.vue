<template>
  <div class="text-right">
    <label
      class="block text-start overflow-hidden rounded-md border border-gray-200 px-3 py-1 outline-none"
      :class="textClasses"
    >
      <span
        class="text-start text-xs font-medium select-none"
        :class="spanClasses"
      >
        <slot name="name"></slot>
      </span>

      <input
        :type="type"
        :disabled="disabledComputed"
        :class="inputClasses"
        :maxlength="maxValue"
        :placeholder="place"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full border-none p-0 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
      />
    </label>
    <span class="text-xs" :class="errorClasses"
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
        enable: "bg-white select-text text-igp-dark",
        disable: "bg-gray-100 select-none text-igp-dark-500",
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
