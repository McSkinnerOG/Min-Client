const fetch = require('node-fetch');
const https = require('https')
const Store = require("electron-store");
const config = new Store();

let userbadge;

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

fetch('https://kirkaclient.herokuapp.com/api/badges', {agent:httpsAgent})
.then(res => res.text())
.then(text => {
    text = JSON.parse(text);
    userbadge = text;
})
.catch((err) => {
    console.log(err)
})

function checkbadge(user) {
    if (userbadge == undefined) {
        return [{start:false}]
    }
    if (!config.get("clientBadges", true)) {
        return [{start:false}]
    }
    let tosend = [];
    if (userbadge.dev.includes(user)) {
        data = {start: true, type:'dev', url:'https://media.discordapp.net/attachments/863805591008706607/874611064606699560/contributor.png', name:user, role:'Developer'};
        tosend.push(data);
    }
    if (userbadge.staff.includes(user)) {
        data = {start: true, type:'staff', url:'https://media.discordapp.net/attachments/863805591008706607/874611070478745600/staff.png', name:user, role:'Staff Team'};
        tosend.push(data);
    } 
    if (userbadge.patreon.includes(user)) {
        data = {start: true, type:'patreon', url:'https://media.discordapp.net/attachments/856723935357173780/874673648143855646/patreon.PNG', name:user, role:'Patreon Supporter'};
        tosend.push(data);
    }
    if (userbadge.gfx.includes(user)) {
        data = {start: true, type:'gfx', url:'https://media.discordapp.net/attachments/863805591008706607/874611068570333234/gfx.PNG', name:user, role:'GFX Artist'};
        tosend.push(data);
    }
    if (userbadge.con.includes(user)) {
        data = {start: true, type:'contributor', url:'https://media.discordapp.net/attachments/863805591008706607/874611066909380618/dev.png', name:user, role:'Contributor'};
        tosend.push(data);
    }
    if (userbadge.kdev.includes(user)) {
        data = {start: true, type:'kdev', url:'https://media.discordapp.net/attachments/874979720683470859/888703118118907924/kirkadev.PNG', name:user, role:'Kirka Developer'};
        tosend.push(data);
    }
    if (userbadge.vip.includes(user)) {
        data = {start: true, type:'vip', url:'https://media.discordapp.net/attachments/874979720683470859/888703150628941834/vip.PNG', name:user, role:'VIP'};
        tosend.push(data);
    }

    let customBadges = userbadge.custom
    for (let i = 0; i < customBadges.length; i++) {
        let badgeData = customBadges[i];
        if (badgeData.name === user) {
            data = {start: true, type:badgeData.type, url:badgeData.url, name:user, role:badgeData.role}
            tosend.push(data);
        }
    }

    if (tosend.length == 0) {
        tosend.push({start:false})
    }
    return tosend;
}

module.exports.badge_checker = checkbadge;