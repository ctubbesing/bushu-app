import type { App } from 'vue'
import BaseButton from '@/components/utils/BaseButton.vue'
import BaseDropdown from '@/components/utils/BaseDropdown.vue'
import BaseLoader from '@/components/utils/BaseLoader.vue'

const loadBaseUtils = (app: App) => {
  app.component('BaseButton', BaseButton)
  app.component('BaseDropdown', BaseDropdown)
  app.component('BaseLoader', BaseLoader)
}

export default loadBaseUtils
