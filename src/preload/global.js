const { ipcRenderer, remote } = require('electron');
const { badge_checker } = require('../features/badges')
const Store = require("electron-store");
const events = require('events');
const { gameLoaded } = require('../features/const')
const config = new Store();
const os = require('os');
const path = require('path');
const fs = require('fs');
const getBlobDuration = require('get-blob-duration')

let badges;
let leftIcons;
let pingFPSdiv = null;
let chatFocus = false;
let chatState = true;
let chatForce = true;
let logDir = path.join(os.homedir(), '/Documents/KirkaClient')

if (!fs.existsSync(logDir)) fs.promises.mkdir(logDir, { recursive: true })

let oldState;
window.addEventListener('DOMContentLoaded', (event) => {
    setInterval(() => {
        let newState = currentState();
        if (oldState != newState) {
            oldState = newState;
            doOnLoad();
        }
    }, 1000)
})

function doOnLoad() {
    resetVars();
    let html = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <style>

    #show-clientNotif{
        position: absolute;
        transform: translate(-50%,-50%);
        top: 50%;
        left: 50%;
        background-color: #101020;
        color: #ffffff;
        padding: 20px;
        border-radius: 5px;
        cursor: pointer;
    }
    #clientNotif{
        width: 380px;
        height: 80px;
        padding-left: 20px;
        background-color: #ffffff;
        box-shadow: 0 10px 20px rgba(75, 50, 50, 0.05);
        border-left: 8px solid #47d764;
        border-radius: 7px;
        display: grid;
        grid-template-columns: 1.2fr 6fr 0.5fr;
        transform: translate(-400px);
        transition: 1s;
    }
    .container-1,.container-2{
        align-self: center;
    }
    .container-1 i{
        font-size: 40px;
        color: #47d764;
    }
    .container-2 {
        text-shadow: 0px 0px #000000;
        font-size: 18px;
        border: none;
        text-align: left;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    }
    .container-2 p:first-child{
        color: #101020;
    }
    .container-2 p:last-child{
        color: #656565;
    }
    #clientNotif button{
        align-self: flex-start;
        background-color: transparent;
        font-size: 25px;
        line-height: 0;
        color: #656565;
        cursor: pointer;
    }
    </style>
    <div class="wrapper" style="width: 420px;
    padding: 30px 20px;
    position: absolute;
    bottom: 50px;
    left: 0;
    overflow: hidden;">
    <div id="clientNotif">
        <div class="container-1">
        </div>
        <div class="container-2">
        </div>
    </div>
    </div>`
    let state = currentState()
    console.log('DOM Content loaded for:', state)
    let promo;
    let div = document.createElement('div')
    div.className = 'clientNotifDIV'
    div.innerHTML = html;

    function setPromo() {
        promo = document.getElementsByClassName("info")[0];
        if (promo === undefined) {
            setTimeout(setPromo, 1000)
            return;
        }
        promo.appendChild(div);

        let kirkaChat = document.getElementById("WMNn")
        kirkaChat.addEventListener('focusout', (event) => {
            chatFocus = false;
            //setChatState(chatState, chatForce);
        });

        kirkaChat.addEventListener('focusin', (event) => {
            chatFocus = true;
            //setChatState(chatState, chatForce);
        });
    }

    switch (state) {
        case 'home':
            promo = document.getElementsByClassName("left-interface")[0];
            promo.appendChild(div);

            let settings = document.getElementById("clientSettings")
            if (settings === null || settings === undefined) {
                let canvas = document.getElementsByClassName("left-icons")[0]
                canvas = canvas.children[0];
                if (canvas === undefined) return;
                canvas.insertAdjacentHTML('beforeend', `<div data-v-4f66c13e="" data-v-6be9607e="" id="clientSettings" class="icon-btn text-1" style="--i:3;"><div data-v-4f66c13e="" class="wrapper"><img data-v-b8de1e14="" data-v-4f66c13e="" src="https://media.discordapp.net/attachments/868890525871247450/875360498701447248/Pngtreelaptop_setting_gear_icon_vector_3664021.png" width="100%" height="auto"><div data-v-4f66c13e="" class="text-icon">CLIENT</div></div></div>`)
                settings = document.getElementById("clientSettings")
                settings.onclick = () => {
                    ipcRenderer.send('show-settings')
                }
            }

            break;
        case 'game':
            setPromo();
            break;
    }



    if (state != "game") return;
    if (config.get("showPingFPS", true)) pingFPS();

    setInterval(() => {
        let ele = document.querySelector("#app > div.interface.text-2 > div.team-section > div.player > div > div.head-right > div.nickname");
        if (ele === null) return;
        config.set("user", ele.innerText);
    }, 3500);

    const url = config.get("customScope", "");
    if (url != "") {
        setInterval(function() {
            let x = document.getElementsByClassName("sniper-mwNMW")[0];
            if (x) {
                if (x.src != url) {
                    x.src = url;
                    x.width = config.get("scopeSize", 200)
                    x.height = config.get("scopeSize", 200)
                    x.removeAttribute("class");
                }
            }
        }, 1000);
    }
}

function resetVars() {
    pingFPSdiv = null;
}

ipcRenderer.on('chat', (event, state, force) => {
    setChatState(state, force);
})

function setChatState(state, force) {
    let chat = document.getElementsByClassName("chat chat-position")[0];
    if (chat === undefined) {
        if (force) setTimeout(() => { setChatState(state, force) }, 1000);
        return;
    };
    if (state) {
        chat.style = "display: flex;";
    } else {
        chat.style = "display: none;";
    }
}

function showNotification() {
    let x = document.getElementById("clientNotif")
    clearTimeout(x);
    let toast = document.getElementById("clientNotif");
    toast.style.transform = "translateX(0)";
    x = setTimeout(() => {
        toast.style.transform = "translateX(-400px)"
    }, 3000);
}

function createBalloon(text, error = false) {
    let border = '';
    let style = '';
    if (error) {
        border = '<i class="fas fa-times-circle" style="color: #ff355b;"></i>'
        style = 'border-left: 8px solid #ff355b;';
    } else {
        border = '<i class="fas fa-check-square"></i>'
        style = 'border-left: 8px solid #47D764;';
    }

    let d1 = document.getElementsByClassName("container-1")[0];
    d1.innerHTML = border;
    let toast = document.getElementById("clientNotif");
    toast.style = style;
    let d2 = document.getElementsByClassName("container-2")[0];
    d2.innerHTML = `<p>${text}</p>`;
    showNotification();
}

window.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'F1':
            break;
        case 'F2':
            break;
        case 'F3':
            break;
    }
});

let ping;
const times = [];
let fps = 0;

function pingFPS() {
    console.log("Starting Ping & FPS")
    setInterval(() => {
        let t1 = Date.now()
        fetch('https://api.kirka.io/')
            .then((res) => {
                ping = Date.now() - t1
            })
    }, 2500)

    refreshLoop()
}

function refreshLoop() {
    updatePingFPS(ping, fps);

    window.requestAnimationFrame(() => {
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;

        refreshLoop();
    });
}

function updatePingFPS(ping, fps) {
    leftIcons = document.querySelector('.state-cont');
    if (leftIcons === null) return;
    if (pingFPSdiv === null) {
        pingFPSdiv = document.createElement('div');
        leftIcons.appendChild(pingFPSdiv);
    }
    if (!config.get("showPingFPS", true)) {
        pingFPSdiv.innerText = ``
    } else {
        pingFPSdiv.innerText = `Ping: ${ping} ms\nFPS: ${fps}`
    }
}

window.addEventListener("mouseup", (e) => {
    if (e.button === 3 || e.button === 4)
        e.preventDefault();
});

window.addEventListener('load', () => {
    setInterval(() => {
        let allpossible = [];
        let all_nickname = document.getElementsByClassName('nickname');
        allpossible.push(...all_nickname);

        for (let key in allpossible) {
            let nickname = allpossible[key];
            if (nickname.innerText === undefined) continue;
            let user = nickname.innerText.toString();
            if (user.slice(-1) === " ") {
                user = user.slice(0, -1)
            }
            badges = badge_checker(user);
            if (badges[0].start) {
                nickname.innerText = user + " ";
            }

            for (let badge_ in badges) {
                let badge = badges[badge_];
                if (badge == undefined) { return }
                if (badge.start) {
                    nickname.insertAdjacentHTML('beforeend', `<img src="${badge.url}" class="KirkaHomeBadge" width="25px" height=auto title=${badge.role}>`);
                }
            }
        }
    }, 750)
});

function genChatMsg(text) {
    console.log(text);
    let chatHolder = document.getElementsByClassName('messages messages-cont')[0]
    if (chatHolder === undefined) return;

    let chatItem = document.createElement('div');
    let chatUser = document.createElement('span');
    let chatMsg = document.createElement('span');

    chatItem.className = 'message';
    chatMsg.className = 'chatMsg_client';
    chatMsg.innerText = text;
    chatUser.className = 'name';
    chatUser.innerText = "[KirkaClient]";

    chatItem.appendChild(chatUser);
    chatItem.appendChild(chatMsg);
    chatHolder.appendChild(chatItem);

    console.log('generated message');
    return chatMsg;
}

function currentState() {
    let gameUrl = window.location.href;
    if (gameUrl.includes('games')) {
        return 'game'
    } else {
        return 'home'
    }
};