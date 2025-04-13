<template>
  <basic-widget :options="options">
    <!-- Header -->
    <template v-slot:header>
      <a href="https://www.wanikani.com" target="_blank">
        <img
          src="https://assets.wanikani.com/assets/logo--retro-colors-9b88dd59.png"
          style="height: 30px"
        >
      </a>
    </template>
    <!-- Content -->
    <div v-if="loading">
      <base-loader />
    </div>
    <div
      v-else-if="!isConnected"
      class="widget-section"
    >
      Could not connect to WaniKani account.
      <div style="margin: 10px 0">
        <v-btn
          size="small"
          @click="openTokenModal()"
        >
          Update access token
        </v-btn>
      </div>
    </div>
    <div
      v-else
      class="body-section"
    >
      <div class="widget-section">
        <h5>Level {{ userLevel }}</h5>
        <a href="https://www.wanikani.com/lesson" target="_blank">
          <div class="clickable-item kanji-color">
            Lessons: {{ lessonCount }}
          </div>
        </a>
        <a href="https://www.wanikani.com/review" target="_blank">
          <div class="clickable-item radical-color">
            Reviews: {{ reviewCount }}
          </div>
        </a>
      </div>
      <div
        v-if="todaysLessons.length > 0"
        class="widget-section"
      >
        <h5>Today's Lessons</h5>
        <div style="margin: auto; max-width: 300px">
          <a
            v-for="(subject, idx) in todaysLessons"
            :key="idx"
            :href="subject.data.document_url"
            target="_blank"
          >
            <div
              :class="[
                'clickable-item',
                'today-lesson',
                {
                  'radical-color': (subject.object === 'radical'),
                  'kanji-color': (subject.object === 'kanji'),
                  'vocab-color': (subject.object === 'vocabulary' || subject.object === 'kana_vocabulary'),
                }
              ]"
              :title="getSubjectMeaning(subject)"
            >
              {{ subject.data.characters }}
            </div>
          </a>
        </div>
      </div>
    </div>
    <base-modal
      v-model="isTokenModalOpen"
      :title="'Update Access Token'"
      :title-icon="'mdi-key'"
      :ok-text="'Save'"
      @ok="saveTokenUpdate()"
      @cancel="cancelTokenUpdate()"
      @hidden="onTokenModalClose()"
    >
      Edit access token for your WaniKani account:
      <base-text-field
        v-model="modeledTokenString"
        doOkButton
        :okText="'Test'"
        :okColor="'yellow'"
        @ok="testNewToken()"
      />
      <div
        v-if="newTokenResult"
        :class="[
          'test-result-div',
          {
            'test-success': isNewTokenValid,
            'test-fail': !isNewTokenValid,
          }
        ]"
      >
        {{ newTokenResult }}
      </div>
    </base-modal>
    <!-- <b-modal
      id="ktListModal"
      title="Export list for Kanji Teacher"
      hide-footer
    >
      <p>You are currently level {{ userLevel }}.</p>
      <label>Starting level:</label>
      <b-form-input
        type="number"
        v-model="ktListStartLevel"
      />
      <label>Ending level:</label>
      <b-form-input
        type="number"
        v-model="ktListEndLevel"
      />
      <div class="widget-section">
        <b-button
          v-if="!ktListObject"
          @click="buildKanjiTeacherList()"
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
    </b-modal> -->
  </basic-widget>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios'
import dropbox from '@/utils/dropbox'
import BasicWidget from '@/components/Home/BasicWidget.vue'
import type {
  Resource,
  Collection,
  WKUserData,
  AssignmentResource,
  SubjectResource,
  KTListCollection,
} from '@/types/wanikaniTypes'
import { mapStores } from 'pinia'
import { useDropboxStore } from '@/stores/dropbox'
import { useHomeStore } from '@/stores/home'
import type { BaseDropdownOption } from '@/components/utils/types/baseTypes'

export default {
  name: 'WanikaniWidget',
  components: {
    BasicWidget: BasicWidget,
  },
  data() {
    return {
      options: [
        {
          title: 'Update access token',
          clickEvent: this.openTokenModal
        },
        {
          title: 'Export Kanji Teacher list (WIP)',
          disabled: true,
          clickEvent: this.openKTListModal
        },
      ] as BaseDropdownOption[],
      loading: false as boolean,
      isConnected: false as boolean,
      userLevel: 0 as number,
      lessonCount: 0 as number,
      reviewCount: 0 as number,
      todaysLessons: [] as SubjectResource[],
      ktListStartLevel: 0 as number,
      ktListEndLevel: 0 as number,
      ktListObject: null as KTListCollection | null,
      modeledTokenString: '' as string,
      newAccessToken: '' as string,
      isNewTokenValid: true as boolean,
      newTokenResult: '' as string,
      isTokenModalOpen: false as boolean,
    };
  },
  async created() {
    if (this.apiAccessToken) {
      await this.loadData()
      this.newAccessToken = this.apiAccessToken
      this.modeledTokenString = this.apiAccessToken
      this.ktListStartLevel = 1
      this.ktListEndLevel = this.userLevel
    }
  },
  watch: {
    apiAccessToken() {
      this.loadData()
    },
  },
  computed: {
    ...mapStores(useHomeStore, useDropboxStore),
    apiAccessToken(): string {
      if (this.dropboxStore.isLoggedIn) {
        return this.homeStore.accessTokens?.wanikani || ''
      }
      return this.newAccessToken || ''
    },
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
    getSubjectMeaning(subject: SubjectResource): string {
      return subject.data.meanings[0].meaning
    },
    async loadData() {
      try {
        this.loading = true
        await this.getUserData()
        await this.getSummary()
        await this.getTodaysLessons()
        this.isConnected = true
      } catch (error) {
        let e = error as AxiosError
        this.isConnected = false
        console.error('Error loading data: ' + e.message)
      } finally {
        this.loading = false
      }
    },
    async testNewToken() {
      let response
      try {
        response = await axios.get('https://api.wanikani.com/v2/user', {
          headers: {
            'Authorization': ('Bearer ' + this.modeledTokenString)
          }
        })

        let user: WKUserData = response.data.data
        this.isNewTokenValid = true
        this.newTokenResult = 'Successfully connected to account for user ' + user.username + '!'
        this.newAccessToken = this.modeledTokenString
      } catch (error) {
        let e = error as AxiosError
        this.isNewTokenValid = false
        if (e.response && e.response.status === 401) {
          this.newTokenResult = 'Invalid access token.'
        } else {
          this.newTokenResult = 'Error while running test: ' + e.message
        }
      }
    },
    async getUserData() {
      let r = await axios.get('https://api.wanikani.com/v2/user', {
        headers: {
          'Authorization': ('Bearer ' + this.apiAccessToken)
        }
      })
      this.userLevel = r.data.data.level
    },
    async getSummary() {
      let r = await axios.get('https://api.wanikani.com/v2/summary', {
        headers: {
          'Authorization': ('Bearer ' + this.apiAccessToken)
        },
        params: { 't': Date.now() },
      })
      this.lessonCount = r.data.data.lessons[0].subject_ids.length
      this.reviewCount = r.data.data.reviews[0].subject_ids.length
    },
    async getTodaysLessons() {
      let todayMidnight = new Date()
      todayMidnight.setHours(0, 0, 0, 0)
      let todayMidnightUTC = todayMidnight.toISOString()

      let assignmentsUrl = 'https://api.wanikani.com/v2/assignments' +
                           `?updated_after=${todayMidnightUTC}` +
                           '&srs_stages=1,2,3'
      const todaysAssignmentsFilter = (a: AssignmentResource) => {
        if (a.data.started_at) {
          return new Date(a.data.started_at) >= todayMidnight
        }
        return false
      }
      this.todaysLessons = await this.getSubjectsByAssignmentsUrl(assignmentsUrl, todaysAssignmentsFilter)
    },
    async saveTokenUpdate() {
      this.newAccessToken = this.modeledTokenString
      // update store and save changes to Dropbox
      const token = {
        key: 'wanikani',
        value: this.newAccessToken,
      }
      this.homeStore.updateSingleAccessToken(token)
      if (this.dropboxStore.isLoggedIn) {
        await dropbox.saveTokens()
      }
      this.closeTokenModal()
    },
    cancelTokenUpdate() {
      this.modeledTokenString = this.apiAccessToken
      this.closeTokenModal()
    },
    openTokenModal() {
      this.isTokenModalOpen = true
    },
    closeTokenModal() {
      this.isTokenModalOpen = false
    },
    onTokenModalClose() {
      this.newTokenResult = ''
    },
    openKTListModal() {
      // this.$bvModal.show('ktListModal')
    },
    closeKTListModal() {
      // this.$bvModal.hide('ktListModal')
    },
    async getPaginatedResourceData(url: string | null): Promise<Resource[]> {
      let allResources: Resource[] = []
      while (url !== null) {
        let r = await axios.get(url, {
          headers: {
            'Authorization': ('Bearer ' + this.apiAccessToken)
          },
        })
        let collection = r.data as Collection
        url = collection.pages.next_url
        allResources = allResources.concat(collection.data)
      }
      return allResources
    },
    async getSubjectsByAssignmentsUrl(assignmentsUrl: string, assignmentFilter: (a: AssignmentResource) => boolean = (() => true)): Promise<SubjectResource[]> {
      // get subject ids from assignments
      let assignmentResources = await this.getPaginatedResourceData(assignmentsUrl) as AssignmentResource[]
      let subjectsList: number[] = assignmentResources.filter(assignmentFilter).map((r) => r.data.subject_id)

      // get subjects by id
      let subjectsUrl = 'https://api.wanikani.com/v2/subjects' +
                        '?ids=' + subjectsList.join()
      let subjectResources = await this.getPaginatedResourceData(subjectsUrl) as SubjectResource[]

      return subjectResources
    },
    // TODO: fix this because something's wrong it doesn't work any more
    // async buildKanjiTeacherList() {
    //   let levelsList = [...Array(this.userLevel).keys()].map(n => n + 1) as number[]

    //   // get subject ids from assignments
    //   let url = 'https://api.wanikani.com/v2/assignments' +
    //             '?subject_types=kanji' +
    //             '&levels=' + levelsList.join()// as null | string
      //// here do getSubjectsByAssignmentsUrl()

      // let subjectsList = [] as number[]
      // while (url !== null) {
      //   let r = await axios.get(url, {
      //     headers: {
      //       'Authorization': ('Bearer ' + this.apiAccessToken)
      //     },
      //   })
      //   let assignments = r.data as Collection
      //   url = assignments.pages.next_url

      //   subjectsList = subjectsList.concat(
      //     assignments.data.map((assignment: Resource) => {
      //       return assignment.data.subject_id as number
      //     })
      //   )
      // }

      // // get kanji characters from subjects
      // let kanjiList = [] as string[]
      // url = 'https://api.wanikani.com/v2/subjects' +
      //       '?ids=' + subjectsList.join() as null | string
      // while (url !== null) {
      //   let r = await axios.get(url, {
      //     headers: {
      //       'Authorization': ('Bearer ' + this.apiAccessToken)
      //     },
      //   })
      //   let subjects = r.data as Collection
      //   url = subjects.pages.next_url

      //   kanjiList = kanjiList.concat(
      //     subjects.data.map((subject: Resource) => {
      //       return subject.data.characters!
      //     })
      //   )
      // }

      // build object
      // this.ktListObject = {
      //   "learninglist": {
      //     "own": kanjiList,
      //     "list1": [],
      //     "list2": [],
      //     "list3": [],
      //     "list4": [],
      //     "list5": [],
      //     "list6": [],
      //     "list7": []
      //   },
      //   "version": "11.0"
      // }
    // },
  },
}
</script>

<style scoped>
.clickable-item {
  border-radius: 5px;
  box-shadow: inset 0 -3px 1px rgb(0 0 0 / 20%), inset 0 3px 1px rgb(0 0 0 / 0%);
  color: #fff;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  padding: 5px;
  margin: 3px;
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
}
.clickable-item:active {
  box-shadow: inset 0 3px 1px rgb(0 0 0 / 20%), inset 0 3px 1px rgb(0 0 0 / 0%);
}
.today-lesson {
  display: inline-block;
  font-weight: normal;
}
.radical-color {
  background-color: #0af;
}
.kanji-color {
  background-color: #f0a;
}
.vocab-color {
  background-color: #a0f;
}
a:hover {
  text-decoration: none;
}
.test-result-div {
  margin: 5px;
  padding: 5px;
  border-radius: 7px;
  border: solid black 2px;
}
.test-success {
  color: #282;
  background-color: #9e9;
  border-color: #5a5;
}
.test-fail {
  color: #822;
  background-color: #faa;
  border-color: #a55;
}
.body-section {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
}
</style>