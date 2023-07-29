<template>
  <div>
    WIP
    <div>
      <b-button @click="openCatalog()">View Catalog</b-button>
    </div>
    <b-modal
      id="catalogModal"
      title="Catalog"
      hide-footer
      centered
      scrollable
    >
      <show-catalog />
    </b-modal>
  </div>
</template>

<script lang="ts">
import ShowCatalog from "@/components/Watchlist/ShowCatalog.vue";
import { ShowInfo } from "@/types/watchlistTypes";
import dropbox from "@/utils/dropbox";
import Vue from "vue";

export default Vue.extend({
  name: "Watchlist",
  components: {
    showCatalog: ShowCatalog,
  },
  data() {
    return {};
  },
  async created() {
    // load catalog data from Dropbox
    let catalogData: null | ShowInfo[] = await dropbox.getData('/Watchlist/catalog.json')
    this.$store.dispatch('updateCatalog', (catalogData === null ? [] : catalogData))

  },
  methods: {
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