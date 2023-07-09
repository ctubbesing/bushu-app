<template>
  <basic-widget>
    <!-- Header -->
    <template v-slot:header>
      <a href="https://www.wanikani.com" target="_blank">
        <img
          src="https://assets.wanikani.com/assets/logo--retro-colors-a26916b67c16d2015df41458d869bf37151dea58d10bab76d218199b498b4f42.png"
          style="height: 30px"
        >
      </a>
    </template>
    <!-- Dropdown Items -->
    <template v-slot:dropdown-items>
      <b-dropdown-item @click="openLoginModal()">Update access token</b-dropdown-item>
      <b-dropdown-item @click="openKTListModal()" disabled>Export Kanji Teacher list (WIP)</b-dropdown-item>
    </template>
    <!-- Content -->
    <div v-if="loading">
      <b-spinner />
    </div>
    <div
      v-else-if="!isConnected"
      class="widget-section"
    >
      Could not connect to WaniKani account.
      <div style="margin: 10px 0">
        <b-button
          size="sm"
          @click="openLoginModal()"
        >
          Update access token
        </b-button>
      </div>
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
    </div>
    <b-modal
      id="wk_accessTokenModal"
      title="Update Access Token"
      centered
      ok-variant="success"
      ok-title="Save"
      cancel-variant="outline-danger"
      @ok="saveTokenUpdate()"
      @cancel="cancelTokenUpdate()"
      @hidden="onLoginModalClose()"
    >
      <!-- hide-footer -->
      Edit access token for your WaniKani account:
      <b-input-group>
        <b-form-input
          type="text"
          v-model="modeledTokenString"
        />
        <b-input-group-append>
          <b-button
            variant="warning"
            @click="testNewToken()"
          >
            Test
          </b-button>
        </b-input-group-append>
      </b-input-group>
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
    </b-modal>
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
import Vue from 'vue'
import axios from 'axios'
import dropbox from '@/utils/dropbox'
import BasicWidget from '@/components/BasicWidget.vue'
import {
  WKResource,
  WKCollection,
  WKUserData,
} from '@/types/wanikaniTypes'

export default Vue.extend({
  name: 'WanikaniWidget',
  components: {
    BasicWidget: BasicWidget,
  },
  data() {
    return {
      loading: false as boolean,
      isConnected: false as boolean,
      userLevel: 0 as number,
      lessonCount: 0 as number,
      reviewCount: 0 as number,
      ktListStartLevel: 0 as number,
      ktListEndLevel: 0 as number,
      ktListObject: null as any,
      modeledTokenString: '' as string,
      newAccessToken: '' as string,
      isNewTokenValid: true as boolean,
      newTokenResult: '' as string,
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
    apiAccessToken(): string {
      if (this.$store.getters.db_isLoggedIn) {
        return this.$store.state.accessTokens?.wanikani || ''
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
    async loadData() {
      try {
        this.loading = true
        await this.getUserData()
        await this.getSummary()
        this.isConnected = true
      } catch (e: any) {
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
      } catch (e: any) {
        this.isNewTokenValid = false
        if (e.response.status === 401) {
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
    async saveTokenUpdate() {
      this.newAccessToken = this.modeledTokenString
      // update store and save changes to Dropbox
      const token = {
        key: 'wanikani',
        value: this.newAccessToken,
      }
      this.$store.dispatch('updateSingleAccessToken', token)
      if (this.$store.getters.db_isLoggedIn) {
        await dropbox.saveTokens()
      }
      // await this.loadData()
      this.closeLoginModal()
    },
    cancelTokenUpdate() {
      this.modeledTokenString = this.apiAccessToken
      this.closeLoginModal()
    },
    openLoginModal() {
      this.$bvModal.show('wk_accessTokenModal')
    },
    closeLoginModal() {
      this.$bvModal.hide('wk_accessTokenModal')
    },
    onLoginModalClose() {
      this.newTokenResult = ''
    },
    // openKTListModal() {
    //   this.$bvModal.show('ktListModal')
    // },
    // closeKTListModal() {
    //   this.$bvModal.hide('ktListModal')
    // },
    // TODO: fix this because something's wrong it doesn't work any more
    async buildKanjiTeacherList() {
      let levelsList = [...Array(this.userLevel).keys()].map(n => n + 1) as number[]

      // get subject ids from assignments
      let subjectsList = [] as number[]
      let url = 'https://api.wanikani.com/v2/assignments' +
                '?subject_types=kanji' +
                '&levels=' + levelsList.join() as null | string
      while (url !== null) {
        let r = await axios.get(url, {
          headers: {
            'Authorization': ('Bearer ' + this.apiAccessToken)
          },
        })
        let assignments = r.data as WKCollection
        url = assignments.pages.next_url

        subjectsList = subjectsList.concat(
          assignments.data.map((assignment: WKResource) => {
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
            'Authorization': ('Bearer ' + this.apiAccessToken)
          },
        })
        let subjects = r.data as WKCollection
        url = subjects.pages.next_url

        kanjiList = kanjiList.concat(
          subjects.data.map((subject: WKResource) => {
            return subject.data.characters!
          })
        )
      }

      // build object
      this.ktListObject = {
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
</style>