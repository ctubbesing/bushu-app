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
import { ShowInfo } from "@/types/watchlistTypes";
import dropbox from "@/utils/dropbox";
import Vue from "vue";

export default Vue.extend({
  name: "Watchlist",
  components: {
    catalogModal: CatalogModal,
  },
  data() {
    return {};
  },
  async created() {
    // load catalog data from Dropbox
    await this.$store.dispatch('loadFromDropbox')
    // let catalogData: null | ShowInfo[] = await dropbox.getData('/Watchlist/catalog.json')
    // let catalogData: ShowInfo[] = [
    //   {
    //     id: 'peaky_blinders',
    //     name: 'Peaky Blinders',
    //     isAnime: false,
    //     seasonCount: 6,
    //     seasons: [
    //       {
    //         id: 'peaky_blinders_s1',
    //         showId: 'peaky_blinders',
    //         seasonNumber: 1,
    //         totalEpisodeCount: 6,
    //       },
    //       {
    //         id: 'peaky_blinders_s2',
    //         showId: 'peaky_blinders',
    //         seasonNumber: 2,
    //         totalEpisodeCount: 6,
    //       },
    //       {
    //         id: 'peaky_blinders_s3',
    //         showId: 'peaky_blinders',
    //         seasonNumber: 3,
    //         totalEpisodeCount: 6,
    //       },
    //       {
    //         id: 'peaky_blinders_s4',
    //         showId: 'peaky_blinders',
    //         seasonNumber: 4,
    //         totalEpisodeCount: 6,
    //       },
    //       {
    //         id: 'peaky_blinders_s5',
    //         showId: 'peaky_blinders',
    //         seasonNumber: 5,
    //         totalEpisodeCount: 6,
    //       },
    //       {
    //         id: 'peaky_blinders_s6',
    //         showId: 'peaky_blinders',
    //         seasonNumber: 6,
    //         totalEpisodeCount: 6,
    //       },
    //     ]
    //   },
    //   {
    //     id: 'one_piece',
    //     name: 'One Piece',
    //     isAnime: true,
    //     doEpisodeCountOverall: true,
    //     seasons: [
    //       {
    //         id: 'one_piece_s1',
    //         showId: 'one_piece',
    //         seasonNumber: 1,
    //         name: 'East Blue',
    //         totalEpisodeCount: 61,
    //       },
    //       {
    //         id: 'one_piece_s2',
    //         showId: 'one_piece',
    //         seasonNumber: 2,
    //         name: 'Alabasta',
    //         totalEpisodeCount: 74,
    //       },
    //     ]
    //   },
    //   {
    //     id: 'tengoku_daimakyou',
    //     name: 'Tengoku Daimakyou',
    //     altName: '天国大魔境',
    //     isAnime: true,
    //     seasonCount: 1,
    //     seasons: [
    //       {
    //         id: 'tengoku_daimakyou_s1',
    //         showId: 'tengoku_daimakyou',
    //         seasonNumber: 1,
    //         totalEpisodeCount: 13,
    //         startDate: '2023-04-01',
    //         endDate: '2023-06-24',
    //         airingSeason: '春',
    //         airingYear: 2023,
    //       },
    //     ]
    //   },
    // ]
    // await this.$store.dispatch('updateCatalog', (catalogData === null ? [] : catalogData))
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