const { ipcRenderer } = require('electron');
const Store = require("electron-store");
const config = new Store();
const tips = [
    'Click F4 to copy game URL to your clipboard!',
    'Use F5 to refresh the page',
    'Want to join using a link? Click F6!',
    'Use F11 to toggle fullscreen mode',
    'We have a built in Screen Recorder! Make sure to try that',
    'You can toggle Discord Rich Presence in Client Settings',
    'Make sure to try out our custom sniper scope feature!',
    'Try Out our FPS & Ping Counter!',
    'Turn on Unlimited FPS for better play experience'
];

window.addEventListener('DOMContentLoaded', () => {
    let startVideo = document.getElementById("myVideo");
    if (config.get("muteVideo", false)) {
        startVideo.muted = true;
    }
    startVideo.play();

    const tiptext = document.getElementById('tips');
    ipcRenderer.on('tip', (event) => {
        let tip = tips[Math.floor(Math.random()*tips.length)];
        tiptext.innerText = tip;
    })

    const message = document.getElementById('status');
    ipcRenderer.on('message', (event, messageText = '') => {
        message.innerText = messageText;
    });

    const ver = document.getElementById('version');
    ipcRenderer.on('version', (event, messageText = '') => {
        ver.innerText = messageText;
    });
});
