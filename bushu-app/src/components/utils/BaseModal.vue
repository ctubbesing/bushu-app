<template>
  <v-dialog
    v-model="isOpenModel"
    max-width="800"
  >
    <v-card
    class="base-modal-body"
    >
      <v-card-title
        v-if="title"
        class="position-sticky top-0 bg-surface elevation-1"
        style="z-index: 1"
      >
        <div class="d-flex align-items-center">
          <v-icon
            v-if="titleIcon"
            :icon="titleIcon"
            class="mr-3"
          />
          {{ title }}
        </div>
        <div
          v-if="$slots.subheader"
          class="mt-2"
        >
          <slot name="subheader"></slot>
        </div>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions
        v-if="doCancel || doOk"
        class="position-sticky bottom-0 bg-surface elevation-1"
      >
        <slot name="actions">
          <v-btn
            v-if="doCancel"
            :text="cancelText"
            :color="cancelColor"
            :variant="cancelVariant"
            @click="cancel()"
          />
          <v-btn
            v-if="doOk"
            :text="okTitle"
            :color="okColor"
            :variant="okVariant"
            @click="$emit('ok')"
          />
        </slot>
      </v-card-actions>
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
const props = defineProps({
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
  okTitle: {
    type: String,
    required: false,
    default: 'Ok',
  },
  okColor: {
    type: String,
    required: false,
    default: 'green',
  },
  okVariant: {
    type: String as () => 'elevated' | 'tonal' | 'flat' | 'text' | 'outlined' | 'plain',
    required: false,
    default: 'elevated',
  },
  okOnly: {
    type: Boolean,
    required: false,
    default: false,
  },
  cancelText: {
    type: String,
    required: false,
    default: 'Cancel',
  },
  cancelColor: {
    type: String,
    required: false,
    default: 'red',
  },
  cancelVariant: {
    type: String as () => 'elevated' | 'tonal' | 'flat' | 'text' | 'outlined' | 'plain',
    required: false,
    default: 'tonal',
  },
  hideOnCancel: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const cancel = () => {
  emit('cancel')
  if (props.hideOnCancel) {
    isOpenModel.value = false
  }
}
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
