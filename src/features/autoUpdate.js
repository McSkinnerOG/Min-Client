const fetch = require('node-fetch');
const https = require('follow-redirects').https;
const { version } = require('./const');
const fs = require("fs");
const path = require('path');

async function autoUpdate(contents) {
    return new Promise((resolve, reject) => {
        contents.on('dom-ready', async() => {
            contents.send('tip')
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            wait(5000).then(() => {
                contents.send('tip')
            })
            contents.send('message', 'Checking for updates...');
            contents.send('version', `MinClient v${version}`)

            let res = await fetch('https://github.com/McSkinnerOG/Min-Client/releases/latest/download/version.txt')
            let text = await res.text();
            text = text.split('\n')[0];
            if (text != version) {
                await downloadUpdate(contents)
                resolve(true);
            } else {
                contents.send('message', 'No update. Starting Client...');
                resolve(false)
            }
        })
    })
}

async function downloadUpdate(contents) {
    let finalURL;
    let fileSize;
    console.log("Starting");
    const pUrl = "https://api.github.com/repos/McSkinnerOG/Min-Client/releases";

    let res = await fetch(pUrl);
    let data = await res.json();

    let myarray = data[0].assets;
    for (let key in myarray) {
        let value = myarray[key];
        if (value.name == "app.asar") {
            fileSize = value.size;
            finalURL = value.browser_download_url;
            break;
        }
    }
    let myreq;
    let dest = path.join('./resources/app.asar');
    //let dest = './app.asar';
    async function get_page() {
        return new Promise((resolve) => {
            myreq = https.get(finalURL, res => {
                res.setEncoding('binary');
                var a = "";
                res.on('data', function(chunk) {
                    a += chunk;
                    percentage = Math.round(100 * a.length / fileSize)
                    contents.send('message', `Downloading- ${percentage}% complete...`)
                });
                res.on('end', function() {
                    process.noAsar = true;
                    console.log('Req ends');
                    fs.writeFile(dest, a, 'binary', function(err) {
                        if (err) console.log(err);
                    });
                    resolve();
                    //exit(0);
                })
            })
        })
    }

    const final_f = async() => {
        await get_page();
        myreq.end();
    }
    await final_f();
}

module.exports = { autoUpdate };