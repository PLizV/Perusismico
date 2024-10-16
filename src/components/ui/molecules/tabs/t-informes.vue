<template>
  <div class="max-h-40 overflow-y-auto" ref="tableWrapper">
    <!-- Añade una referencia a la tabla -->
    <tLabel
      v-if="!departamento"
      color="blue"
      size="xs"
      weight="400"
      class="col-span-12 flex text-sm py-3 pl-3"
    >
      Debe seleccionar un departamento
    </tLabel>
    <table v-else class="table-auto w-full">
      <thead class="sticky top-0 bg-igp-blue-600 text-igp-white w-full">
        <tr class="text-xs font-semibold">
          <th class="py-2 pl-2 text-start">#</th>
          <th class="text-start">Ciudad</th>
          <th class="text-center">Año</th>
          <th class="text-center">Visualizar</th>
        </tr>
      </thead>
      <tbody class="text-xs">
        <tr v-for="(item, index) in filteredData" :key="index">
          <td class="pl-2 text-start border-b border-b-igp-blue">
            {{ index + 1 }}
          </td>
          <td class="text-start border-b border-b-igp-blue">
            {{ item.ciudad }}
          </td>
          <td class="text-center border-b border-b-igp-blue">
            {{ item.ano }}
          </td>
          <td class="text-center border-b border-b-igp-blue">
            <a
              :href="item.documento"
              target="_blank"
              class="inline-block mx-auto"
            >
              <eye class="w-[18px] h-[18px]"></eye>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import eye from "@/assets/icons/eye.vue";
import tLabel from "@/components/ui/atoms/t-label.vue";

export default {
  data() {
    return {
      dataDepartamentos: [],
      isTableScrolled: false,
    };
  },
  props: {
    departamento: String,
    distrito:String,
    datajson: Object,
  },
  components: {
    eye,
    tLabel,
  },
  computed: {
    filteredData() {
      console.log(this.datajson)
      return this.datajson[this.departamento].sort((a, b) => a.ano - b.ano);
    },
  },
  watch: {
    departamento: function () {
      this.isTableScrolled = false;
    },
  },
  updated() {
    if (this.$refs.tableWrapper.scrollTop > 0 && !this.isTableScrolled) {
      this.$refs.tableWrapper.scrollTop = 0;
      this.isTableScrolled = true;
    }
  },
};
</script>
