// Shared styles for the template

#let primary-color = rgb("#2563eb")

#let heading-style(content) = {
  text(fill: primary-color, weight: "bold", size: 14pt, content)
}

#let emphasis-box(content) = {
  rect(
    fill: primary-color.lighten(90%),
    stroke: primary-color,
    inset: 10pt,
    radius: 4pt,
    width: 100%,
    content
  )
}
