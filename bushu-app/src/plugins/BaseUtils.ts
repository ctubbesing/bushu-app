import type { App } from 'vue'
import BaseButton from '@/components/utils/BaseButton.vue'
import BaseDropdown from '@/components/utils/BaseDropdown.vue'
import BaseLoader from '@/components/utils/BaseLoader.vue'
import BaseModal from '@/components/utils/BaseModal.vue'
import BaseTextField from '@/components/utils/BaseTextField.vue'

const loadBaseUtils = (app: App) => {
  app.component('BaseButton', BaseButton)
  app.component('BaseDropdown', BaseDropdown)
  app.component('BaseLoader', BaseLoader)
  app.component('BaseModal', BaseModal)
  app.component('BaseTextField', BaseTextField)
}

export default loadBaseUtils
