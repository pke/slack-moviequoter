const fetch = require("isomorphic-fetch")
const cherrio = require("cheerio") 

const BASE_URL = "http://m.imdb.com"
//tt0118715
const titleUrl = id => BASE_URL + `/title/${id}/quotes`

const fetchQuotes = id => (
  fetch(titleUrl(id))
  .then(result => result.text())
  .then(html => 
    cherrio.load(html, {
      normalizeWhitespace: true
    }))
  .then($ => {
    const quotes = []
    $(".quote").each((index, quote) => {
      const lines = []
      $("div", quote).each((index, div) => {
        const matches = $(div).text().trim().match(/^(.*):\s*(.*)/i)
        if (matches) {
          const [ _, name, text ] = matches
          lines.push({ name, text })
        }
      })
      quotes.push(lines)
    })
    return quotes
  })
)

const randomArrayItem = items => items[Math.floor(Math.random()*items.length)]

const randomQuote = id => (
  fetchQuotes(id)
  .then(randomArrayItem)
)

randomQuote("tt0118715")

module.exports = {
  fetchQuotes,
  randomQuote,
}