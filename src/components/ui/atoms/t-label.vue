<template>
  <component
    :type="type"
    :to="to"
    :class="textClasses"
    :is="buttonType"
    :active-class="activeClasses"
  >
    <slot></slot>
  </component>
</template>

<script>
export default {
  name: "labelComponent",

  props: {
    type: {
      type: String,
      default: "text",
    },
    to: {
      required: false,
      type: String,
      default: null,
    },
    aClass: {
      required: false,
      type: String,
      default: null,
    },
    color: {
      required: false,
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: "base",
    },
    weight: {
      required: false,
      type: String,
      default: null,
    },
    extraClass: {
      required: false,
      type: String,
      default: null,
    },
    dataArray: {
      required: false,
      type: String,
      default: null,
    },
  },

  computed: {
    colorClasses() {
      const colorMappings = {
        brown: "text-igp-brown",
        blue: "text-igp-blue",
        black: "text-igp-black-1000",
        darkMuted: "text-igp-dark-450",
      };
      return colorMappings[this.color] || null;
    },

    sizeClasses() {
      const size = this.size;
      const sizeClass = `text-${size}`;
      const baseSize = "text-base";
      return sizeClass || baseSize;
    },

    weightClasses() {
      const weightMappings = {
        300: "font-light",
        400: "font-normal",
        500: "font-medium",
        600: "font-semibold",
        700: "font-bold",
        800: "font-extrabold",
        900: "font-black",
      };
      return weightMappings[this.weight] || null;
    },

    textClasses() {
      return `${this.extraClass} ${this.colorClasses} ${this.weightClasses} ${this.sizeClasses} ${this.putClasses}`;
    },

    activeClasses() {
      const active = this.aClass;
      const activeMappings = {
        noactive: null,
        bla2bro: "text-igp-brown font-medium",
      };
      return activeMappings[active];
    },

    putClasses() {
      const active = this.aClass;
      const activeMappings = {
        bla2bro: `{' text-igp-black-1000 hover:text-igp-brown font-light':
            !$route.path.includes('/ultimos-registros')}`,
      };
      return activeMappings[active] || null;
    },

    buttonType() {
      if (this.to) {
        return "router-link";
      } else {
        return "label";
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
