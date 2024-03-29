
export default class ColorUtils {

  static ALLOWED_COLORS = [
    '#f44336', '#e91e63',                       // Red
    '#9c27b0', '#673ab7',                       // Purple
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', // Blue
    '#009688', '#4caf50', '#8bc34a', '#cddc39', // Green
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', // Yellow/Orange
  ]

  static getRandomColor(): string {
    return ColorUtils.ALLOWED_COLORS[Math.floor(Math.random() * ColorUtils.ALLOWED_COLORS.length)]
  }
}