import tools from '@/utils/tools'

export default {
  filters: {
    toTitleCase(str: string): string {
      return str?.replace(
        /\w*/g,
        (txt: string) => {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        }
      );
    },
    formatDate(dateStr: string | null): string {
      if (!dateStr) {
        return '?'
      }
      const doDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      return tools.getFormattedDate(dateStr, doDateOnly)
    },
  }
}