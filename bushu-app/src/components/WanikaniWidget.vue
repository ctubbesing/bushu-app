<template>
  <basic-widget>
    <template v-slot:header>
      <a href="https://www.wanikani.com" target="_blank">
        <img
          src="https://assets.wanikani.com/assets/logo--retro-colors-a26916b67c16d2015df41458d869bf37151dea58d10bab76d218199b498b4f42.png"
          style="height: 30px"
        >
      </a>
    </template>
    <!-- Content -->
    <div v-if="loading">
      <b-spinner />
    </div>
    <div v-else>
      <div class="widget-section">
        <h5>Level {{ userLevel }}</h5>
        <a href="https://www.wanikani.com/lesson" target="_blank">
          <div class="lessons-reviews" style="background-color: #ff00aa">
            Lessons: {{ lessonCount }}
          </div>
        </a>
        <a href="https://www.wanikani.com/review" target="_blank">
          <div class="lessons-reviews" style="background-color: #00aaff">
            Reviews: {{ reviewCount }}
          </div>
        </a>
      </div>
      <div class="widget-section">
        <b-button
          v-if="!ktListObject"
          @click="buildKanjiTutorList"
          size="sm"
        >
          Build KT List
        </b-button>
        <a
          v-else
          :href="ktListBlob"
          :download="'wk' + userLevel + '_kt_list.json'"
        >
          <b-button variant="success" size="sm">Download KT List</b-button>
        </a>
      </div>
    </div>
  </basic-widget>
</template>

<script lang="ts">
import Vue from 'vue'
import axios from 'axios'
import BasicWidget from '@/components/BasicWidget.vue'
import { Resource, Collection } from '@/types'

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
      ktListObject: null as any,
    };
  },
  async created() {
    this.loading = true
    await this.getUserData()
    await this.getSummary()
    this.loading = false
  },
  computed: {
    ktListBlob() : string {
      return URL.createObjectURL(new Blob([JSON.stringify(this.ktListObject, null, 2)]))
    },
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
    async buildKanjiTutorList() {
      let levelsList = [...Array(this.userLevel).keys()].map(n => n + 1) as number[]

      // get subject ids from assignments
      let subjectsList = [] as number[]
      let url = 'https://api.wanikani.com/v2/assignments' +
                '?subject_types=kanji' +
                '&levels=' + levelsList.join() as null | string
      while (url !== null) {
        let r = await axios.get(url, {
          headers: {
            'Authorization': ('Bearer ' + process.env.VUE_APP_WANIKANI_API_KEY)
          },
        })
        let assignments = r.data as Collection
        url = assignments.pages.next_url

        subjectsList = subjectsList.concat(
          assignments.data.map((assignment: Resource) => {
            return assignment.data.subject_id as number
          })
        )
      }

      // get kanji characters from subjects
      let kanjiList = [] as string[]
      url = 'https://api.wanikani.com/v2/subjects' +
            '?ids=' + subjectsList.join() as null | string
      while (url !== null) {
        let r = await axios.get(url, {
          headers: {
            'Authorization': ('Bearer ' + process.env.VUE_APP_WANIKANI_API_KEY)
          },
        })
        let subjects = r.data as Collection
        url = subjects.pages.next_url

        kanjiList = kanjiList.concat(
          subjects.data.map((subject: Resource) => {
            return subject.data.characters!
          })
        )
      }

      // build object
      this.ktListObject = {
        "uuid": process.env.VUE_APP_KANJI_TEACHER_OBJ_UUID,
        "device": process.env.VUE_APP_KANJI_TEACHER_OBJ_DEVICE,
        "learninglist": {
          "own": kanjiList,
          "list1": [],
          "list2": [],
          "list3": [],
          "list4": [],
          "list5": [],
          "list6": [],
          "list7": []
        },
        "version": "11.0"
      }
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