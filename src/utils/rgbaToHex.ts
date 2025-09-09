export const rgbaToHex = (colorStr: string, forceRemoveAlpha: boolean = false) => {
  const hasSlash = colorStr.includes('/')

  if (hasSlash) {
    const rgbaValues = colorStr.match(/(\d+)\s+(\d+)\s+(\d+)\s+\/\s+([\d.]+)/)

    if (!rgbaValues) {
      return colorStr
    }

    const [red, green, blue, alpha] = rgbaValues.slice(1, 5).map(parseFloat)

    const redHex = red.toString(16).padStart(2, '0')
    const greenHex = green.toString(16).padStart(2, '0')
    const blueHex = blue.toString(16).padStart(2, '0')

    const alphaHex = forceRemoveAlpha
      ? ''
      : Math.round(alpha * 255)
          .toString(16)
          .padStart(2, '0')

    const hexColor = `#${redHex}${greenHex}${blueHex}${alphaHex}`

    return hexColor
  } else {
    return (
      '#' +
      colorStr
        .replace(/^rgba?\(|\s+|\)$/g, '')
        .split(',')
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map(string => parseFloat(string))
        .map((number, index) => (index === 3 ? Math.round(number * 255) : number))
        .map(number => number.toString(16))
        .map(string => (string.length === 1 ? '0' + string : string))
        .join('')
    )
  }
}
