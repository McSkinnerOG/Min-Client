const Store = require('electron-store');
const config = new Store();

module.exports = [{
        name: 'Mute Startup Video',
        id: 'muteVideo',
        category: 'Startup',
        type: 'checkbox',
        needsRestart: true,
        val: config.get("muteVideo", false),
    },
    {
        name: 'Start as Fullscreen',
        id: 'fullScreenStart',
        category: 'Startup',
        type: 'checkbox',
        needsRestart: true,
        val: config.get("fullScreenStart", true),
    },
    {
        name: 'Unlimited FPS',
        id: 'disableFrameRateLimit',
        category: 'Performance',
        type: 'checkbox',
        needsRestart: true,
        val: config.get("disableFrameRateLimit", false),
    },
    {
        name: 'Client Badges',
        id: 'clientBadges',
        category: 'Performance',
        type: 'checkbox',
        needsRestart: true,
        val: config.get("clientBadges", true),
    },
    {
        name: 'Show Ping & FPS',
        id: 'showPingFPS',
        category: 'Game',
        type: 'checkbox',
        needsRestart: false,
        val: config.get("showPingFPS", true),
    },
    {
        name: 'In-game Chat Mode',
        id: 'chatType',
        category: 'Game',
        type: 'list',
        values: ['Show', 'Hide'],
        needsRestart: true,
        val: config.get("chatType", "Show"),
    },
    {
        name: 'Custom Sniper Scope',
        id: 'customScope',
        category: 'Game',
        type: 'input',
        needsRestart: false,
        val: config.get('customScope', ''),
        placeholder: 'Scope url'
    },
    {
        name: 'Scope Size',
        id: 'scopeSize',
        category: 'Game',
        type: 'slider',
        needsRestart: false,
        min: 10,
        max: 1000,
        val: config.get("scopeSize", 400)
    }
]