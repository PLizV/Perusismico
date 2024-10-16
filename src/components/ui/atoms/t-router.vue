<template>
  <router-link
    class="btn font-medium flex items-center cursor-pointer border shadow hover:shadow-lg focus:outline-none focus:shadow-outline w-fit outline-none"
    :to="to"
    :class="btnClasses"
  >
    <slot></slot>
  </router-link>
</template>
<script>
export default {
  name: "buttonsComponent",
  props: {
    to: {
      type: String,
    },

    name: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: "xs",
    },
    outline: Boolean,
    icon: Boolean,
    round: {
      type: String,
      default: "none",
    },
  },
  computed: {
    colorClasses() {
      const colorMappings = {
        greenState: "text-igp-green border-igp-green bg-igp-green-100",
        redState: "text-igp-red border-igp-red bg-igp-red-100",
        grayState: "text-igp-muted border-igp-muted bg-igp-muted-100",
        brown: "bg-igp-brown text-igp-white",
        blue: "bg-igp-blue text-igp-white",
        dark: "bg-igp-dark-500 text-igp-white",
        skyBlue: "bg-igp-sky-blue-750 text-igp-white hover:bg-igp-sky-blue-700",
      };
      return colorMappings[this.color] || null;
    },
    sizeClasses() {
      const isIcon = this.icon;
      const size = this.size;

      const sizeMappings = {
        xs: `h-6 w-auto text-xs text-start justify-center whitespace-nowrap ${
          isIcon ? "px-2" : "px-3"
        }`,
        sm: `h-8 text-sm text-start justify-center whitespace-nowrap ${
          isIcon ? "px-2" : "px-4"
        }`,
        md: `h-10 text-start justify-center whitespace-nowrap ${
          isIcon ? "px-3" : "px-6"
        }`,
        lg: `text-lg h-12 text-start justify-center whitespace-nowrap ${
          isIcon ? "px-4" : "px-12"
        }`,
      };

      return sizeMappings[size] || sizeMappings.md;
    },
    btnClasses() {
      const round = this.round;
      const roundMappings = {
        xs: `rounded-xs`,
        sm: `rounded-sm`,
        md: `rounded-md`,
        lg: `rounded-lg`,
      };

      return `${this.colorClasses} ${roundMappings[round]} ${this.sizeClasses} `;
    },
  },
};
</script>
