<template>
  <div>
    WIP
    <div>
      <b-button @click="openCatalog()">View Catalog</b-button>
    </div>
    <catalog-modal id="catalogModal"/>
  </div>
</template>

<script lang="ts">
import CatalogModal from "@/components/Watchlist/CatalogModal.vue";
import Vue from "vue";

export default Vue.extend({
  name: "Watchlist",
  components: {
    catalogModal: CatalogModal,
  },
  data() {
    return {};
  },
  computed: {
    isReady(): boolean {
      return this.$store.getters.db_isReady
    },
  },
  watch: {
    async isReady(isReady: boolean) {
      if (isReady) {
        await this.loadData()
      }
    },
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      if (this.isReady) {
        await this.$store.dispatch('loadCatalogFromDropbox')
      }
    },
    openCatalog() {
      this.$bvModal.show('catalogModal')
    },
    closeCatalog() {
      this.$bvModal.hide('catalogModal')
    },
  },
});
</script>

<style>
</style>