import type { App } from 'vue'
import BaseDropdown from '@/components/utils/BaseDropdown.vue'
import BaseLoader from '@/components/utils/BaseLoader.vue'
import BaseModal from '@/components/utils/BaseModal.vue'
import BaseTextField from '@/components/utils/BaseTextField.vue'

const loadBaseUtils = (app: App) => {
  app.component('BaseDropdown', BaseDropdown) // TODO: remove
  app.component('BaseLoader', BaseLoader)
  app.component('BaseModal', BaseModal)
  app.component('BaseTextField', BaseTextField) // TODO: remove
}

export default loadBaseUtils
