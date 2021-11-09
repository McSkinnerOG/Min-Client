//modules
require("v8-compile-cache"); //For better startup
const path = require("path");
const { app, protocol, BrowserWindow, screen, clipboard, dialog, shell, globalShortcut, session, ipcMain, webContents } = require('electron');
const electronLocalshortcut = require("electron-localshortcut");
const Store = require("electron-store");
const config = new Store();
const { autoUpdate } = require('./features/autoUpdate');
const fs = require('fs');
const consts = require('./features/const');
const url = require('url');

if (require("electron-squirrel-startup")) {
    app.quit();
}
if (config.get('disableFrameRateLimit', false)) {
    app.commandLine.appendSwitch('disable-frame-rate-limit')
}
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-print-preview');
app.commandLine.appendSwitch('disable-metrics');
app.commandLine.appendSwitch('disable-metrics-repo');
app.commandLine.appendSwitch('enable-javascript-harmony');
app.commandLine.appendSwitch('no-referrers');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('high-dpi-support', 1);
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa');
app.commandLine.appendSwitch('disable-bundled-ppapi-flash');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('disable-web-security');

let gamePreload = path.resolve(__dirname + '/preload/global.js')
let splashPreload = path.resolve(__dirname + '/preload/splash.js')
let settingsPreload = path.resolve(__dirname + '/preload/settings.js')

let win;
let splash;
let canDestroy;

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: false,
        backgroundColor: "#000000",
        titleBarStyle: 'hidden',

        show: false,
        acceptFirstMouse: true,
        icon: icon,
        webPreferences: {
            nodeIntergation: true,
            preload: gamePreload,
            enableRemoteModule: true
        },
    });
    createShortcutKeys();
    create_set();

    win.loadURL('https://kirka.io/');

    win.on('close', function() {
        app.exit();
    });

    win.webContents.on('new-window', function(event, url) {
        event.preventDefault()
        win.loadURL(url);
    });

    if (config.get("enablePointerLockOptions", false)) {
        app.commandLine.appendSwitch("enable-pointer-lock-options");
    }

    let contents = win.webContents;

    win.once("ready-to-show", () => {
        showWin();
        if (config.get("chatType", "Show") !== "Show") {
            win.webContents.send('chat', false, true);
        }
    });

    function showWin() {
        if (!canDestroy) {
            setTimeout(showWin, 500);
            return;
        }
        splash.destroy();
        if (config.get("fullScreenStart", true)) {
            win.setFullScreen(true);
        }
        win.show();
    }
}

let ftoggled = true;

function ftoggle() {
    ftoggled = !ftoggled;
}

function createShortcutKeys() {
    const contents = win.webContents;

    electronLocalshortcut.register(win, 'Escape', () => contents.executeJavaScript('document.exitPointerLock()', true));
    electronLocalshortcut.register(win, 'F3', () => clipboard.writeText(contents.getURL()));
    electronLocalshortcut.register(win, 'F1', () => contents.reload()); // HOW ABOUT WE USE THE KEYS THAT EVERY OTHER CLIENT DOES YOU SPASTICS?
    electronLocalshortcut.register(win, 'Shift+F1', () => contents.reloadIgnoringCache());
    electronLocalshortcut.register(win, 'F2', () => checkkirka());
    electronLocalshortcut.register(win, 'F11', () => ftoggle());
    electronLocalshortcut.register(win, 'F11', () => win.setFullScreen(ftoggled));
    electronLocalshortcut.register(win, 'F12', () => win.webContents.openDevTools());
    electronLocalshortcut.register(win, 'Enter', () => chatShowHide());
}

let chatState = false;

function chatShowHide() {
    let chatType = config.get("chatType", "Show")
    return;
    switch (chatType) {
        case 'Show':
            break;
        case 'Hide':
            win.webContents.send('chat', false, false)
            break;
        case 'On-Focus':
            break;
            win.webContents.send('chat', chatState, false)
            if (chatState) {
                chatState = false;
            } else {
                chatState = true;
            }
    }
}

function checkkirka() {
    const urld = clipboard.readText();
    if (urld.includes("https://kirka.io/games/")) {
        win.loadURL(urld);
    }
}

app.allowRendererProcessReuse = true;

let icon;

if (process.platform === "linux") {
    icon = __dirname + "/media/icon.png"
} else {
    icon = __dirname + "/media/icon.ico"
}
console.log(icon)
app.whenReady().then(() => createSplashWindow());

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

function createSplashWindow() {
    splash = new BrowserWindow({
        width: 600,
        height: 350,
        center: true,
        resizable: false,
        frame: false,
        show: true,
        icon: icon,
        transparent: true,
        alwaysOnTop: false,
        webPreferences: {
            preload: splashPreload,
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    splash.loadFile(`${__dirname}/splash/splash.html`);

    autoUpdate(splash.webContents).then((didUpdate) => {
        if (didUpdate) {
            let options = {
                buttons: ["Ok"],
                message: "Update Complete! Please relaunch the client."
            }
            dialog.showMessageBox(options)
                .then(() => {
                    app.quit();
                })
        } else {
            const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
            createWindow();
            wait(10000).then(() => {
                canDestroy = true;
            });
        }
    });
}


const initResourceSwapper = () => {
    // Get documents folder and make 'KirkaSwapper' folder
    const SWAP_FOLDER = consts.joinPath(app.getPath('documents'), '/KirkaSwapper');
    try { fs.mkdir(SWAP_FOLDER, { recursive: true }, e => {}); } catch (e) {};
    let swap = { filter: { urls: [] }, files: {} };
    const allFilesSync = (dir, fileList = []) => {
        fs.readdirSync(dir).forEach(file => {
            const filePath = consts.joinPath(dir, file);
            let useAssets = !(/KirkaSwapper\\(css|docs|img|libs|pkg|sound)/.test(dir));
            console.log('ASSET: ', dir);
            if (fs.statSync(filePath).isDirectory()) {
                allFilesSync(filePath);
            } else {
                let kirk = '*://' + (useAssets ? 'kirka.io' : '') + filePath.replace(SWAP_FOLDER, '').replace(/\\/g, '/') + '*';
                swap.filter.urls.push(kirk);
                swap.files[kirk.replace(/\*/g, '')] = url.format({
                    pathname: filePath,
                    protocol: '',
                    slashes: false
                });
            }
        });
    };
    allFilesSync(SWAP_FOLDER);
    if (swap.filter.urls.length) {
        session.defaultSession.webRequest.onBeforeRequest(swap.filter, (details, callback) => {
            let redirect = swap.files[details.url.replace(/https|http|(\?.*)|(#.*)/gi, '')] || details.url;
            callback({ cancel: false, redirectURL: redirect });
            console.log('Redirecting ', details.url, 'to', redirect);
            //console.log('onBeforeRequest details', details);
        });
    }
}

app.once('ready', () => {
    // Initialize protocol to access files
    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURIComponent(request.url.replace('file:///', ''));
        callback(pathname);
    });
    // Init resource swapper
    initResourceSwapper();

});

function create_set() {
    setwin = new BrowserWindow({
        width: 1000,
        height: 600,
        show: false,
        frame: true,
        icon: icon,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: settingsPreload
        }
    });
    setwin.removeMenu();
    setwin.loadFile(path.join(__dirname, "/settings/settings.html"));
    //setwin.setResizable(false)

    setwin.on('close', (event) => {
        event.preventDefault();
        setwin.hide();
    });

    ipcMain.on('show-settings', () => {
        setwin.show()
    })

    setwin.once('ready-to-show', () => {
        //setwin.show()
        //setwin.webContents.openDevTools();
    })

};