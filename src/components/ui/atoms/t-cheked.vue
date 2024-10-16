<template>
  <div class="flex items-center">
    <p class="mr-3 items-center text-sm" :class="setClass">{{ texto }}</p>

    <div class="m-4">
      <div class="toggle slim colour">
        <input
          :id="id"
          :disabled="disabled"
          class="toggle-checkbox hidden"
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
        <label
          :for="id"
          class="toggle-label block w-12 h-5 rounded-full transition-color duration-150 ease-out"
          :class="setClassInput"
        ></label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
    },
    id: {
      type: String,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
    texto: {
      type: String,
      required: true,
    },
  },
  computed: {
    bgInputCircle() {
      if (this.disabled === false) {
        if (this.modelValue === true) {
          return "#ad2800";
        } else {
          return "#9B9B9B";
        }
      } else {
        return "#BDBDBD";
      }
    },
    bgInputOn() {
      if (this.disabled === false) {
        return "#db3f108a";
      } else {
        return "#db3f108a";
      }
    },

    bgInputOff() {
      if (this.disabled === false) {
        return "#BBBBBB";
      } else {
        return "#DADBDC";
      }
    },
    setClass() {
      if (this.disabled === false) {
        return "text-igp-dark";
      } else {
        return "text-igp-muted-400";
      }
    },
    setClassInput() {
      if (this.disabled === false) {
        return "cursor-pointer";
      } else {
        return "cursor-not-allowed";
      }
    },
  },
};
</script>
<style>
.toggle-label {
  position: relative;

  &:before {
    position: absolute;
    top: 0.125rem;
    left: 0.125rem;

    display: block;
    content: "";

    width: 1.55rem;
    height: 1.55rem;

    border-radius: 9999%;

    background-color: v-bind(bgInputCircle);
    background-position: center;
    background-repeat: no-repeat;

    background-size: 65%;
    background-image: url("/img/uncheck.svg");

    transition: transform 0.15s cubic-bezier(0, 0, 0.2, 1);

    transform: translateX(0);

    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

.toggle-checkbox:checked + .toggle-label:before {
  transform: translateX(1.5rem);
  background-image: url("/img/check.svg");
}

.toggle {
  &.slim {
    .toggle-label:before {
      top: -0.15rem;

      left: 0;
    }

    .toggle-checkbox:checked + .toggle-label:before {
      transform: translateX(1.75rem);
    }
  }

  &.colour {
    .toggle-label {
      background-color: v-bind(bgInputOff);
    }

    .toggle-checkbox:checked + .toggle-label {
      background-color: v-bind(bgInputOn);
    }
  }
}
</style>
