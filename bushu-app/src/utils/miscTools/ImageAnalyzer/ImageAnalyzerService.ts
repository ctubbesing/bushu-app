interface ColorData {
  colorRGB: number[]
  colorHSL: number[]
  count: number
}

function rgbToHsl(rgb: number[]): number[] {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const a = rgb.length < 4 ? 1 : rgb[3] / 255

  const cmin = Math.min(r, g, b)
  const cmax = Math.max(r, g, b)
  const delta = cmax - cmin
  let h = 0
  let s = 0
  let l = 0

  if (delta === 0) {
    h = 0
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6
  } else if (cmax === g) {
    h = (b - r) / delta + 2
  } else {
    h = (r - g) / delta + 4
  }
  h = Math.round(h * 60)

  if (h < 0) {
    h += 360
  }

  l = (cmax + cmin) / 2
  s = delta == 0 ? 0 : (delta / (1 - Math.abs((2 * l) - 1)))

  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return [h, s, l, a]
}

const filterColors = (c: ColorData): boolean => {
  return c.colorHSL[1] > 20 &&
         c.colorHSL[2] > 20 &&
         c.colorHSL[2] <= 80
}

const colorHeuristic = (c: ColorData): number => {
  const lightPoints = c.colorHSL[2] > 50 ? (100 - c.colorHSL[2]) : c.colorHSL[2]
  const saturationPoints = c.colorHSL[1]
  return 2*lightPoints + saturationPoints
  // return c.colorHSL[1] * c.colorHSL[2]
  // return c.count
}

function getColorData(img: HTMLImageElement, doOpacity = false, doFilters = false): ColorData[] {
  let colorData: ColorData[] = []

  const canvas = document.createElement('canvas')

  if (canvas) {
    canvas.height = img.naturalHeight
    canvas.width = img.naturalWidth

    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D
    if (ctx) {
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      const data = imageData.data
      console.log(img.naturalWidth + 'x' + img.naturalHeight)
      console.log(data)

      const colorGroups = {} as { [key: string]: ColorData }
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        const key = `${r}-${g}-${b}-${doOpacity ? a : ''}`

        if (colorGroups[key] === undefined) {
          const colorRGB = [r, g, b, a]
          colorGroups[key] = {
            colorRGB: colorRGB,
            colorHSL: rgbToHsl(colorRGB),
            count: 1,
          }
        } else {
          colorGroups[key].count += 1
        }
      }

      colorData = Object.values(colorGroups)
      if (doFilters) {
        colorData = colorData.filter(filterColors)
      }

      colorData.sort((a: ColorData, b: ColorData) => colorHeuristic(b) - colorHeuristic(a))
    }
  }

  canvas.remove()

  return colorData
}

export default {
  async GetImageColorData(imageURL: string): Promise<ColorData[]> {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageURL

    try {
      await img.decode()

      return getColorData(img)
    } catch (e) {
      console.log('---- Issue loading image:')
      console.log(e)
      console.log('--------')

      return []
    }
  },
}
