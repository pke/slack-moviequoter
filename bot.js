const koa = require("koa")
const findMovie = require("name-to-imdb")
const { randomQuote } = require("./api")

console.info("Bot started")

const { checkSlackToken, message: slackMessage } = require("./slack")

const app = koa()

app.use(function* responseTime(next) {
  const start = Date.now()
  yield next
  const duration = Date.now() - start
  this.set("X-Response-Time", duration)
})

app.use(function* requestLogger(next) {
  console.info("%s", this.method, this.query)
  yield next
})

app.use(checkSlackToken)

app.use(function* quote(next) {
  const name = this.query.text
  findMovie({name}, (error, id) => {
    if (!error) {
      let text
      if (id) {
        randomQuote(id).then(quotes => {
          if (!quotes) {
            return slackMessage(this.query.response_url, `I am so sorry, but I could not find anything quotable from ${name} :cry:`).send()
          }
          return quotes.map(({name, text}) => `*${name}*: ${text}`).join("\n")
        }).then(lines =>
          slackMessage(this.query.response_url, lines).sendInChannel()
        )
      } else {
        text = `Hmmm, don't know no movie called "${name}" :cry:`
      }
      return slackMessage(this.query.response_url, text).send()
    } else {
      return slackMessage(this.query.response_url, `Hmmm, could not search for your movie "${name}" :rage:`).send()
    }
  })
  
  yield next

  this.status = 200
  this.body = `Looking for quotes from ${name}...`
})

const server = app.listen(process.env.PORT || 1337, () => {
  const host = server.address().address
  const port = server.address().port  
  console.info("listening and serving quotes at %s:%s", host, port)
})
