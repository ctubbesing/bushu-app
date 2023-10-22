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
  }
}