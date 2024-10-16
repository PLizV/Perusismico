<template>
  <div class="text-right">
    <span
      class="text-xs"
      :class="{
        'text-igp-green':
          remainingCharacters < limitValue && remainingCharacters >= 21,
        'text-igp-yellow':
          remainingCharacters <= 20 && remainingCharacters >= 11,
        'text-igp-red':
          remainingCharacters <= 10 ||
          (remainingCharacters <= maxlength &&
            remainingCharacters >= limitValue),
      }"
    >
      Total de caracteres {{ maxValue }}/{{ maxlength }}
    </span>
    <label
      :for="id"
      class="block text-start overflow-hidden rounded-md border border-gray-200 px-3 py-1"
      :class="textClasses"
    >
      <span
        class="text-start text-xs font-medium select-none"
        :class="spanClasses"
      >
        <slot name="name"></slot>
      </span>
      <textarea
        :rows="rows"
        :class="inputClasses"
        :type="type"
        :maxlength="maxlength"
        :minlength="minlength"
        :disabled="disabledComputed"
        :id="id"
        :placeholder="place"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full border-none pt-2 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
      />
    </label>
    <span class="text-xs" :class="errorClasses">
      <slot name="error"></slot>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    maxlength: {
      type: Number,
    },
    minlength: {
      type: Number,
    },
    state: {
      type: String,
    },
    id: {
      type: String,
    },
    rows: {
      type: String,
    },
    place: {
      type: String,
    },
    type: {
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
    maxValue() {
      const value = this.$props.modelValue;
      const letterCount = value.length;

      return letterCount;
    },
    remainingCharacters() {
      return this.maxlength - this.modelValue.length;
    },
    limitValue() {
      return this.maxlength - this.minlength;
    },
  },
};
</script>
