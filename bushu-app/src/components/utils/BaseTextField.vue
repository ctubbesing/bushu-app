<template>
  <v-text-field
    v-model="textModel"
    :label="label"
  >
    <template #append>
      <v-btn
        v-if="doOkButton"
        :text="okText"
        :color="okColor"
        :variant="okVariant"
        @click="$emit('ok')"
      />
      <slot name="append"></slot>
    </template>
  </v-text-field>
</template>

<script lang="ts" setup>
import { VBtn } from 'vuetify/components/VBtn'
import { VTextField } from 'vuetify/components/VTextField'

const textModel = defineModel<string>()

defineEmits(['ok'])

defineProps({
  label: {
    type: String,
    required: false,
  },
  doOkButton: {
    type: Boolean,
    required: false,
    default: false,
  },
  okText: {
    type: String,
    required: false,
    default: 'Ok'
  },
  okColor: {
    type: String,
    required: false,
    default: '#333'
  },
  okVariant: {
    type: String as () => 'elevated' | 'tonal' | 'flat' | 'text' | 'outlined' | 'plain',
    required: false,
    default: 'elevated'
  },
})
</script>
