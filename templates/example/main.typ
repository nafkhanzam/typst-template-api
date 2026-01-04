// Example template that reads data from data.json
// The API will merge default data.json with POST request JSON

// Import relative file - this tests that physical files work
#import "styles.typ": *

// Load data from virtual/physical data.json
#let data = json("data.json")

#heading-style[#data.title]

*Author:* #data.author

#v(1em)

#emphasis-box[
  #data.content
]

#v(1em)

_This template demonstrates:_
- Reading from `data.json` (overridden by API)
- Importing from `styles.typ` (physical file)
