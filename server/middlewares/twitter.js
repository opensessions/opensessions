const Twitter = require('twitter');

const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_TOKEN, TWITTER_TOKEN_SECRET } = process.env;

let client = false;

if (TWITTER_API_KEY) {
  client = new Twitter({
    consumer_key: TWITTER_API_KEY,
    consumer_secret: TWITTER_API_SECRET,
    access_token_key: TWITTER_TOKEN,
    access_token_secret: TWITTER_TOKEN_SECRET
  });
}

function sendTweet(status) {
  if (!client) return Promise.reject({ message: 'twitter not configured' });
  return client.post('statuses/update', { status });
}

module.exports = { sendTweet };
