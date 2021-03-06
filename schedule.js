var schedule = require('node-schedule');
const Twit = require('twit');
const vaskiData = require('./vaskidata')
 
var twitterBot = schedule.scheduleJob('44 4,12,16 * * *', function(){
    console.log(',', new Date());
    
        const twitSecrets = {
            consumer_key: process.env.APPLICATION_CONSUMER_KEY_HERE,
            consumer_secret: process.env.APPLICATION_CONSUMER_SECRET_HERE,
            access_token: process.env.ACCESS_TOKEN_HERE,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET_HERE
          }
          
    const T = new Twit(twitSecrets);
    T.get('account/verify_credentials', {
        include_entities: false,
        skip_status: true,
        include_email: false
    }, onAuthenticated)
    
    function onAuthenticated(err){
        if (err) {
            console.log(err)
            console.log(err.twitterReply.errors)
        } else {
            sendTweet()
        }
    }
    
    async function sendTweet(){
        const speak = await vaskiData.getSpeaks('janimäkelä')

        console.log('speak', speak);
        

        const tweet = speak.puhe
        if (tweet.length < 10) {
            return;
        }
        let tweetRes;
        if(tweet.length < 281) {
            tweetRes = await T.post('statuses/update', { status: tweet.slice(0, 280) })
        } else {
            const restTweets = tweet.slice(260).match(/.{1,260}/g)
            console.log('rest.tww', restTweets);
            
            let tweetCount = restTweets.length
            let index = 0
            tweetRes = await T.post('statuses/update', { status: tweet.slice(0, 260) + ' 1/' + (tweetCount + 1) })
            while (index < tweetCount) {
                index++;
                tweetRes = await T.post('statuses/update', { 
                    status: `${restTweets[index - 1]} ${index + 1}/${tweetCount + 1} @${tweetRes.data.user.screen_name}`,
                    in_reply_to_status_id: tweetRes.data.id_str.toString()
                })
            }
        }

        const speakerRes = await T.post('statuses/update', { 
            status: `${speak.puhuja} @${tweetRes.data.user.screen_name}`,
            in_reply_to_status_id: tweetRes.data.id_str.toString()
        })
        T.post('statuses/update', { 
            status: `${speak.aihe} @${speakerRes.data.user.screen_name}`,
            in_reply_to_status_id: speakerRes.data.id_str.toString()
        })
        
    }
    
});

module.exports = {
    twitterBot
  }