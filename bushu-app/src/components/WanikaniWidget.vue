<template>
  <basic-widget>
    <template v-slot:header>
      <img
        src="https://assets.wanikani.com/assets/logo--retro-colors-a26916b67c16d2015df41458d869bf37151dea58d10bab76d218199b498b4f42.png"
        style="height: 30px"
      >
    </template>
    <!-- Content -->
    <div v-if="loading">
      <b-spinner />
    </div>
    <div v-else>
      <div class="widget-section">
        <a href="https://www.wanikani.com/lesson">
          <div class="lessons-reviews" style="background-color: #ff00aa">
            Lessons: {{ lessonCount }}
          </div>
        </a>
        <a href="https://www.wanikani.com/review">
          <div class="lessons-reviews" style="background-color: #00aaff">
            Reviews: {{ reviewCount }}
          </div>
        </a>
      </div>
      <div class="widget-section">
        <h5>Level {{ userLevel }}</h5>
        <b-button href="https://www.wanikani.com">Go to WaniKani</b-button>
      </div>
    </div>
  </basic-widget>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import BasicWidget from '@/components/BasicWidget.vue'

export default Vue.extend({
  name: 'WanikaniWidget',
  components: {
    BasicWidget: BasicWidget,
  },
  data() {
    return {
      loading: false as boolean,
      userLevel: 0 as number,
      lessonCount: 0 as number,
      reviewCount: 0 as number,
    };
  },
  async created() {
    this.loading = true
    await this.getUserData()
    await this.getSummary()
    this.loading = false
  },
  methods: {
    openLessons() {
      window.open('https://www.wanikani.com/lesson')
    },
    openReviews() {
      window.open('https://www.wanikani.com/review')
    },
    async getUserData() {
      let r = await axios.get('https://api.wanikani.com/v2/user', {
        headers: {
          'Authorization': ('Bearer ' + process.env.VUE_APP_WANIKANI_API_KEY)
        }
      })
      this.userLevel = r.data.data.level
    },
    async getSummary() {
      let r = await axios.get('https://api.wanikani.com/v2/summary', {
        headers: {
          'Authorization': ('Bearer ' + process.env.VUE_APP_WANIKANI_API_KEY)
        },
        params: { 't': Date.now() },
      })
      this.lessonCount = r.data.data.lessons[0].subject_ids.length
      this.reviewCount = r.data.data.reviews[0].subject_ids.length
    },
  },
})
</script>

<style scoped>
.lessons-reviews {
  margin: 3px;
  padding: 5px;
  box-shadow: inset 0 -3px 1px rgb(0 0 0 / 20%), inset 0 3px 1px rgb(0 0 0 / 0%);
  color: #fff;
  border-radius: 5px;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
a:hover {
  text-decoration: none;
}
</style>