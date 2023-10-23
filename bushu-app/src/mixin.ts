export default {
  filters: {
    toTitleCase(str: string): string {
      return str.replace(
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
      return (new Date(dateStr)).toLocaleDateString("en-US", { timeZone: 'UTC' })
    },
  }
}