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
        edit data here
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
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

<style>
.show-info {
  display: flex;
  justify-content: space-between;
  min-height: 100px;
  padding: 5px;
  margin: 3px;
  background-color: hsl(192, 71%, 85%);
  border-radius: 5px;
  cursor: pointer;
}
.show-season {
  min-height: 80px;
  width: 90%;
  background-color: hsl(192, 71%, 65%);
  font-size: 0.8em;
}
.show-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.show-icons {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.show-icons > div:first-child {
  margin-top: -7px;
  margin-bottom: -7px;
}
.show-info h4 {
  margin-bottom: 4px;
}
.alt-name {
  font-size: 0.8em;
}
.seasons-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>