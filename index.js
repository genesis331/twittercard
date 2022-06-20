const express = require('express');
const cheerio = require('cheerio');
const XMLHttpRequest = require('xhr2');
const nodeHtmlToImage = require('node-html-to-image');
require('dotenv').config();

const port = 3000;
const app = express();
app.use(express.static('cards'));

function getResponse(link, authtoken) {
    return new Promise(resolve => {
        var ajax = new XMLHttpRequest;
        ajax.open('GET', link, true);
        if (authtoken) {
            ajax.setRequestHeader('Authorization', 'Bearer ' + authtoken);
        }
        ajax.send();
        ajax.onload = function(e) {
            resolve(ajax.responseText); 
        };
    });
}

function convertTimestamp(timestamp) {
    let time = new Date(timestamp);
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let outputTime = hours + ':' + minutes + ' ' + ampm;
    let date = new Date(timestamp);
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let day = date.getDate();
    let month = monthNames[date.getMonth()];
    let year = date.getFullYear();
    let outputDate = month + ' ' + day + ', ' + year;
    return { outputTime, outputDate };
}

function convertNumberToString(num) {
    if (num > 999999999) {
        return (num / 1000000000).toFixed(1) + "B";
    } else if (num > 999999) {
        return (num / 1000000).toFixed(1) + "M";
    } else if (num > 999) {
        return (num / 1000).toFixed(1) + "K";
    } else {
        return num;
    }
}

function translateHashtag(hashtag, oriText) {
    return oriText.replace("#" + hashtag, `<span style='color: #1D9BF0'>#${hashtag}</span>`);
}

function translateMentions(mention, oriText) {
    return oriText.replace("@" + mention, `<span style='color: #1D9BF0'>@${mention}</span>`);
}

function removeLink(link, oriText) {
    return oriText.replace(link, '');
}

function calculateAspectRatio(width, height) {
    return width / height;
}

async function getTweetData(id) {
    let raw = await getResponse(`https://api.twitter.com/2/tweets?ids=${id}&expansions=author_id%2Creferenced_tweets.id%2Creferenced_tweets.id.author_id%2Cattachments.media_keys&tweet.fields=entities%2Csource%2Ccreated_at%2Cpublic_metrics&user.fields=verified%2Cprofile_image_url&media.fields=url%2Cpreview_image_url%2Cheight%2Cwidth`, process.env.TWITTER_AUTH_TOKEN);
    let jsonData = JSON.parse(raw);
    let data = {};
    data.name = jsonData.includes.users[0].name;
    data.id = "@" + jsonData.includes.users[0].username;
    data.profpic = (jsonData.includes.users[0].profile_image_url).replace('_normal', '_400x400');
    data.text = jsonData.data[0].text;
    if (jsonData.data[0].entities.hashtags) {
        for (let i = 0; i < jsonData.data[0].entities.hashtags.length; i++) {
            data.text = translateHashtag(jsonData.data[0].entities.hashtags[i].tag, data.text);
        }
    }
    if (jsonData.data[0].entities.mentions) {
        for (let i = 0; i < jsonData.data[0].entities.mentions.length; i++) {
            data.text = translateMentions(jsonData.data[0].entities.mentions[i].username, data.text);
        }
    }
    data.embedurl = null;
    if (jsonData.data[0].entities.urls) {
        for (let i = 0; i < jsonData.data[0].entities.urls.length; i++) {
            if (jsonData.data[0].entities.urls[i].images) {
                data.embedurl = jsonData.data[0].entities.urls[i].display_url;
                data.embedtitle = jsonData.data[0].entities.urls[i].title;
                data.embeddesc = jsonData.data[0].entities.urls[i].description;
                data.embedimage = jsonData.data[0].entities.urls[i].images[0].url;
            }
            data.text = removeLink(jsonData.data[0].entities.urls[i].url, data.text);
        }
    }
    data.media = jsonData.includes.media ? jsonData.includes.media[0] : null;
    if (jsonData.includes.tweets) {
        let quotedData = await getQuotedTweetData(jsonData.includes.tweets[0].id);
        data.mininame = quotedData.mininame;
        data.miniid = quotedData.miniid;
        data.miniprofpic = quotedData.miniprofpic;
        data.minicontent = quotedData.minicontent;
        data.entities = quotedData.minientities;
        if (data.entities.mentions) {
            for (let i = 0; i < data.entities.mentions.length; i++) {
                data.minicontent = translateMentions(data.entities.mentions[i].username, data.minicontent);
            }
        }
        if (data.entities.hashtags) {
            for (let i = 0; i < data.entities.hashtags.length; i++) {
                data.minicontent = translateHashtag(data.entities.hashtags[i].tag, data.minicontent);
            }
        }
        if (data.entities.urls) {
            for (let i = 0; i < data.entities.urls.length; i++) {
                data.minicontent = removeLink(data.entities.urls[i].url, data.minicontent);
            }
        }
        data.minidate = quotedData.minidate;
        data.minibluetick = quotedData.minibluetick;
    } else {
        data.minicontent = null;
    }
    let timestampData = convertTimestamp(jsonData.data[0].created_at);
    data.time = timestampData.outputTime;
    data.date = timestampData.outputDate;
    data.client = jsonData.data[0].source;
    data.retweets = convertNumberToString(jsonData.data[0].public_metrics.retweet_count);
    data.likes = convertNumberToString(jsonData.data[0].public_metrics.like_count);
    data.bluetick = jsonData.includes.users[0].verified;
    return data;
}

async function getQuotedTweetData(id) {
    let raw = await getResponse(`https://api.twitter.com/2/tweets?ids=${id}&expansions=author_id%2Creferenced_tweets.id%2Creferenced_tweets.id.author_id%2Cattachments.media_keys&tweet.fields=entities%2Csource%2Ccreated_at%2Cpublic_metrics&user.fields=verified%2Cprofile_image_url&media.fields=url%2Cpreview_image_url`, process.env.TWITTER_AUTH_TOKEN);
    let jsonData = JSON.parse(raw);
    return {
        mininame: jsonData.includes.users[0].name,
        miniid: "@" + jsonData.includes.users[0].username,
        miniprofpic: (jsonData.includes.users[0].profile_image_url).replace('_normal', '_400x400'),
        minicontent: jsonData.data[0].text,
        minidate: convertTimestamp(jsonData.data[0].created_at).outputDate,
        minibluetick: jsonData.includes.users[0].verified,
        minientities: jsonData.data[0].entities
    }
}

async function generateCard(req, dataObj) {
    let data = await getResponse(req.protocol + '://' + req.get('host') + '/basic.html');
    let $ = cheerio.load(data);
    let styleArgs = "";
    if (req.query.width) {
        styleArgs += `width: ${req.query.width}px !important;`;
    }
    if (req.query.darkMode) {
        styleArgs += `background-color: #15202B; color: white;`;
    }
    if (styleArgs !== "") {
        $('.card-wrapper').first().attr('style', styleArgs);
    }
    for (let key in dataObj) {
        switch (key) {
            case "profpic":
            case "miniprofpic":
                $('#data-' + key).first().attr('style', `background-image: url(${dataObj[key]})`);
                break;
            case "bluetick":
            case "minibluetick":
                if (!dataObj[key]) {
                    $('#data-' + key).first().remove();
                }
                break;
            case "media":
                let cardWidth = req.query.width ? req.query.width : 1800;
                let cardHeight;
                if (!dataObj[key]) {
                    $('#data-' + key).first().remove();
                } else {
                    let aspectRatio = calculateAspectRatio(dataObj["media"].width, dataObj["media"].height);
                    if (aspectRatio < 1) {
                        cardHeight = cardWidth;
                    } else {
                        cardHeight = cardWidth / aspectRatio;
                    }
                    if (dataObj[key].type == "photo") {
                        $('#data-' + key).first().attr('style', `background-image: url(${dataObj[key].url}); height: ${cardHeight}px;`);
                        $('#data-playbtn').first().remove();
                    } else if (dataObj[key].type == "video") {
                        $('#data-' + key).first().attr('style', `background-image: url(${dataObj[key].preview_image_url}); height: ${cardHeight}px;`);
                    }
                }
                break;
            case "minicontent":
                if (!dataObj[key]) {
                    $('#data-thread').first().remove();
                } else {
                    $('#data-' + key).first().html(dataObj[key]);
                }
                break;
            case "embedurl":
                if (!dataObj[key]) {
                    $('#data-embed').first().remove();
                } else {
                    $('#data-' + key).first().html(dataObj[key].split('/')[0]);
                }
                break;
            case "embedimage":
                $('#data-' + key).first().attr('style', `background-image: url(${dataObj[key]})`);
                break;
            default:
                $('#data-' + key).first().html(dataObj[key]);
                break;
        }
    }
    return $.html();
}

app.get('/', (req, res) => {
    res.end('Hello World!');
});

app.get('/test', async (req, res) => {
    let dataObj = await getTweetData(req.query.id);
    let card = await generateCard(req, dataObj);
    res.end(card);
});

app.get('/image', async (req, res) => {
    if (req.query.id) {
        let dataObj = await getTweetData(req.query.id);
        let card = await generateCard(req, dataObj);
        const image = await nodeHtmlToImage({
            html: card,
            selector: "#twittercard",
            transparent: true,
            puppeteerArgs: {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        res.type('image/png');
        res.end(image);
    } else {
        res.end('Please provide a tweet id number.');
    }
});

app.listen(port, () => {
    if (!process.env.TWITTER_AUTH_TOKEN) {
        console.log('Please set the TWITTER_AUTH_TOKEN environment variable.');
        process.exit(0);
    } else {
        console.log(`App started on port ${port}`);
    }
});
