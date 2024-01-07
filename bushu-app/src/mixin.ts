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
      return tools.getFormattedDate(dateStr)
    },
  }
}