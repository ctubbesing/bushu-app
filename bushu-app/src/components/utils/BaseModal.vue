<template>
  <v-dialog
    v-model="isOpenModel"
    width="auto"
  >
    <v-card
      max-width="500"
      :prepend-icon="titleIcon"
      :title="title"
      :subtitle="subtitle"
    >
      <template #actions>
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
    default: 'flat'
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

const emit = defineEmits(['ok', 'cancel', 'hidden'])

const isOpenModel = defineModel<boolean>()

watch(isOpenModel, () => {
  if (!isOpenModel.value) {
    emit('hidden')
  }
})
</script>
