const Store = require('electron-store');
const config = new Store();

function checkbox(customID) {
	let val = document.getElementById(customID).checked
	config.set(customID, val);
}

function inputbox(customID) {
    let val = document.getElementById(customID).value
    config.set(customID, val)
}

function sliderVal(customID) {
    let slider = document.getElementById(customID)
    document.getElementById(`${customID}-label`).innerText = slider.value;
    config.set(customID, slider.value)
}