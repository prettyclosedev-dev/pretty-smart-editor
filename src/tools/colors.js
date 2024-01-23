export function parseColor(color) {
  const m = color.match(/^#([0-9a-f]{6})$/i)[1];
  if (m) {
    return [
      parseInt(m.substr(0, 2), 16),
      parseInt(m.substr(2, 2), 16),
      parseInt(m.substr(4, 2), 16)
    ];
  } else {
    return [0, 0, 0]
  }
}

export function contrast(color) {
  const [red, green, blue] = parseColor(color)
  if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
    return "#000000"
  } else {
    return "#ffffff"
  }
}