const fetch = require("isomorphic-fetch")

const postMessage = (responseUrl, message) => (
  fetch(responseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    },  
    body: JSON.stringify(message), 
  }).catch(error => {
    console.error("Could not send to %s", responseUrl, { message, error })
    throw error
  })
)


/**
 * Slack Message Builder
 * 
 * @arg reponseOrURL express Response | string
 * @arg text string
 */
const message = (responseOrURL, text) => {
  let message = {
    text
  }
  return {
    attach({title, text, imageUrl, footer, fields}) {
      const attachment = {
        title, text, image_url: imageUrl, footer,
        mrkdwn_in: ["title", "text", "fields"],
      }
      if (fields) {
        attachment.fields = fields
      }
      if (message.attachments) {
        message.attachments.push(attachment)
      } else {
        message.attachments = [attachment]
      }
      return this
    },

    sendInChannel() {
      return this.send("in_channel")
    },

    send(destination) {
      if (destination) {
        message.response_type = destination
      }
      console.info(message)
      if (typeof responseOrURL === "string") {
        return postMessage(responseOrURL, message)
      } else {
        responseOrURL.body = message
        return Promise.resolve(responseOrURL)
      }
    }
  }
}


function* checkSlackToken(next) {
  if (["cul855WAsmieSYF3mK9fKg5r"].indexOf(this.query.token) == -1) {
    this.throw(401, "You are not allowed to ask me for any quotes")
  }
  yield next
}

module.exports = {
  message,
  checkSlackToken,
}