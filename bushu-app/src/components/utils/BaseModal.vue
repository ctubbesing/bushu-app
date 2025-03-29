<template>
  <v-dialog
    v-model="isOpenModel"
    max-width="800"
  >
    <v-card
      :prepend-icon="titleIcon"
      :title="title"
      :subtitle="subtitle"
      class="base-modal-body"
    >
      <template
        v-if="doCancel || doOk"
        #actions
      >
        <slot name="actions">
          <v-btn
            v-if="doCancel"
            :text="cancelText"
            :color="cancelColor"
            :variant="cancelVariant"
            @click="$emit('cancel')"
          />
          <v-btn
            v-if="doOk"
            :text="okText"
            :color="okColor"
            :variant="okVariant"
            @click="$emit('ok')"
          />
        </slot>
      </template>
      <template #text>
        <slot></slot>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { VBtn } from 'vuetify/components/VBtn'
import { VCard } from 'vuetify/components/VCard'
import { VDialog } from 'vuetify/components/VDialog'

const isOpenModel = defineModel<boolean>()

const emit = defineEmits(['ok', 'cancel', 'hidden'])

watch(isOpenModel, () => {
  if (!isOpenModel.value) {
    emit('hidden')
  }
})

// !!! should make the width (currently 800) a prop
// small: 500, med: 800, etc
defineProps({
  title: {
    type: String,
    required: false,
  },
  titleIcon: {
    type: String,
    required: false,
  },
  subtitle: {
    type: String,
    required: false,
  },
  doOk: {
    type: Boolean,
    required: false,
    default: true,
  },
  doCancel: {
    type: Boolean,
    required: false,
    default: true,
  },
  okText: {
    type: String,
    required: false,
    default: 'Ok'
  },
  okColor: {
    type: String,
    required: false,
    default: 'green'
  },
  okVariant: {
    type: String as () => 'elevated' | 'tonal' | 'flat' | 'text' | 'outlined' | 'plain',
    required: false,
    default: 'elevated'
  },
  cancelText: {
    type: String,
    required: false,
    default: 'Cancel'
  },
  cancelColor: {
    type: String,
    required: false,
    default: 'red'
  },
  cancelVariant: {
    type: String as () => 'elevated' | 'tonal' | 'flat' | 'text' | 'outlined' | 'plain',
    required: false,
    default: 'tonal'
  },
})
</script>

<style scoped>
:deep(.v-overlay__content) {
  width: calc(100% - 16px);
  max-width: calc(100% - 16px);
  margin: 8px;
}

:deep(.v-card-text) {
  padding: 14px !important;
}

.base-modal-body {
  margin: auto;
  max-width: 800px;
}

@media (min-width: 516px) {
  .base-modal-body {
    width: 800px;
  }
}
</style>
