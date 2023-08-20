<template>
  <div>
    <b-modal
      v-bind="$attrs"
      :title="modalTitle"
      centered
      scrollable
      @show="loadValue()"
    >
      <div>
        <b-form>
          <div class="show-entry">
            <div class="show-info">
              <b-container>
                <b-form-row>
                  <b-col cols="4">
                    <label for="form-title">Title:</label>
                  </b-col>
                  <b-col>
                    <b-form-input
                      id="form-title"
                      type="text"
                      v-model="showData.name"
                      required
                    />
                  </b-col>
                </b-form-row>
                <b-form-row>
                  <b-col cols="4">
                    <label for="form-alt-title">Alt title:</label>
                  </b-col>
                  <b-col>
                    <b-form-input
                      id="form-alt-title"
                      type="text"
                      v-model="showData.altName"
                    />
                  </b-col>
                </b-form-row>
                <b-form-row>
                  <b-col cols="4">
                    <label for="form-season-count">Total seasons:</label>
                  </b-col>
                  <b-col>
                    <b-form-input
                      id="form-season-count"
                      type="number"
                      v-model="showData.seasonCount"
                    />
                  </b-col>
                </b-form-row>
                <b-form-row>
                  <b-col cols="4">
                    <label for="form-anime">Anime?</label>
                  </b-col>
                  <b-col cols="*">
                    <b-form-checkbox
                      id="form-anime"
                      v-model="showData.isAnime"
                      switch
                    />
                  </b-col>
                </b-form-row>
                <b-form-row v-if="showData.isAnime">
                  <b-col cols="*">
                    <label for="form-show-episode-count">Count total episodes?</label>
                  </b-col>
                  <b-col cols="*">
                    <b-form-checkbox
                      id="form-show-episode-count"
                      v-model="showData.doEpisodeCountOverall"
                      switch
                    />
                  </b-col>
                </b-form-row>
              </b-container>
            </div>
            <div class="seasons-section">
              <div
                v-for="(season, idx) in showData.seasons"
                :key="idx"
                style="display: flex; align-items: center; justify-content: flex-end"
              >
                <div class="delete-button">
                  <b-icon
                    icon="trash"
                    variant="light"
                  />
                </div>
                <div class="show-season-edit">
                  <b-container>
                    <b-form-row>
                      <b-col cols="3">
                        <label :for="`form-szn-${idx}-number`">Season #:</label>
                      </b-col>
                      <b-col>
                        <b-form-input
                          :id="`form-szn-${idx}-number`"
                          type="number"
                          v-model="season.seasonNumber"
                          required
                        />
                      </b-col>
                    </b-form-row>
                    <b-form-row>
                      <b-col cols="3">
                        <label :for="`form-szn-${idx}-name`">Season name:</label>
                      </b-col>
                      <b-col>
                        <b-form-input
                          :id="`form-szn-${idx}-name`"
                          type="text"
                          v-model="season.name"
                        />
                      </b-col>
                    </b-form-row>
                    <b-form-row>
                      <b-col cols="3">
                        <label :for="`form-szn-${idx}-episode-count`">Episode count:</label>
                      </b-col>
                      <b-col>
                        <b-form-input
                          :id="`form-szn-${idx}-episode-count`"
                          type="number"
                          v-model="season.totalEpisodeCount"
                        />
                      </b-col>
                    </b-form-row>
                    <b-form-row>
                      <b-col cols="3">
                        <label :for="`form-szn-${idx}-start-date`">Start date:</label>
                      </b-col>
                      <b-col>
                        <b-form-input
                          :id="`form-szn-${idx}-start-date`"
                          type="date"
                          v-model="season.startDate"
                        />
                      </b-col>
                    </b-form-row>
                    <b-form-row>
                      <b-col cols="3">
                        <label :for="`form-szn-${idx}-end-date`">End date:</label>
                      </b-col>
                      <b-col>
                        <b-form-input
                          :id="`form-szn-${idx}-end-date`"
                          type="date"
                          v-model="season.endDate"
                        />
                      </b-col>
                    </b-form-row>
                    <b-form-row v-if="showData.isAnime">
                      <b-col cols="3">
                        <label :for="`form-szn-${idx}-airing-szn`">Season aired:</label>
                      </b-col>
                      <b-col cols="6">
                        <b-form-radio-group
                          :id="`form-szn-${idx}-airing-szn`"
                          v-model="season.airingSeason"
                          :options="[ '冬', '春', '夏', '秋' ]"
                          buttons
                          size="sm"
                        ></b-form-radio-group>
                      </b-col>
                      <b-col cols="3">
                        <b-form-input
                          :id="`form-szn-${idx}-airing-year`"
                          type="number"
                          v-model="season.airingYear"
                        />
                      </b-col>
                    </b-form-row>
                  </b-container>
                </div>
              </div>
              <div
                class="add-season-button"
              >
                <b-icon
                  icon="plus"
                  font-scale="2"
                  variant="light"
                />
              </div>
            </div>
          </div>
        </b-form>
        <!-- //////////////////////////////////////////////////
        - gotta add a "new szn" button
        - and do some validation maybe asdf
        - and hook up proper save button stuff for the saveChanges() fxn
        ////////////////////////////////////////////////// -->
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ShowInfo, ShowSeason } from '@/types/watchlistTypes'

export default Vue.extend({
  name: 'ShowInfoEditModal',
  props: {
    value: {
      required: true,
      type: Object as PropType<ShowInfo>,
    },
    isNewShow: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      showData: {} as ShowInfo,
    };
  },
  watch: {
    value() {
      this.loadValue()
    },
  },
  computed: {
    modalTitle(): string {
      if (this.isNewShow) {
        return 'Create New Show'
      }
      return 'Edit Show Info' + (this.showData.name ? (': ' + this.showData.name) : '')
    },
  },
  methods: {
    loadValue() {
      this.showData = this.value
    },
    syncModel() {
      this.$emit('input', this.showData)
    },
    saveChanges() {/////////////////// make sure this emit won't fire unless showData is valid
      this.$emit('save-changes')
    },
  },
});
</script>

<style scoped>
.form-row > div {
  display: flex;
  align-items: center;
}
.add-season-button {
  padding: 5px;
  margin: 3px;
  border-radius: 5px;
  cursor: pointer;
  background-color: hsl(192, 71%, 45%);
  width: 90%;
  text-align: center;
}
.add-season-button:hover {
  background-color: hsl(192, 71%, 35%);
}
.delete-button {
  display: inline-block;
  background-color: red;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
}
.delete-button:hover {
  background-color: hsl(0, 100%, 40%);
}
.show-season-edit {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  margin: 3px;
  border-radius: 5px;
  min-height: 80px;
  width: 90%;
  background-color: hsl(192, 71%, 65%);
  font-size: 0.8em;
}
</style>