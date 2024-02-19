window.addEventListener('resize', WindowResized);
const style = document.getElementById("roomStyle");
const canvas = document.getElementById("bgCanvas");
const context = canvas.getContext("2d");
const content = document.getElementById("content");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentRoomData = undefined;
let currentPlayingAudio = undefined;

let currentLanguageIndex = 0;
let currentAudioEnabled = true;

Initialize();

function Initialize() {
    const params = new URL(document.location).searchParams;

    if (params.has("room")) LoadRoom(params.get("room"));
    else LoadRoom("index");
}

async function LoadRoom(roomFile) {
    //console.log("Current room: " + roomFile);

    content.innerHTML = "";

    const jsonResponse = await fetch(roomFile + ".json");
    currentRoomData = await jsonResponse.json();

    PlaySound();
    await SetStyle();
    DrawBackground();
    UpdateContentHtml();

    if (typeof umami !== 'undefined') {
        const roomUrl = window.location.pathname + "?room=" + roomFile;
        umami.track(props => ({ ...props, url: roomUrl }));
    }
}

function DrawBackground() {
    const colors = currentRoomData.bgColors;

    const horizontalGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    const verticalGradient = context.createLinearGradient(0, 0, 0, canvas.height);

    const totalStops = colors.length + (colors.length - 1);

    for (var c = 0; c < totalStops; c++) {
        const position = c / (totalStops - 1);

        if (c < colors.length) {
            horizontalGradient.addColorStop(position, colors[c]);
            verticalGradient.addColorStop(position, colors[c]);
        }
        else {
            horizontalGradient.addColorStop(position, colors[totalStops - c - 1]);
            verticalGradient.addColorStop(position, colors[totalStops - c - 1]);
        }
    }

    context.fillStyle = horizontalGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = verticalGradient;

    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(canvas.width, 0);
    context.lineTo(canvas.width * 0.5, canvas.height * 0.5);
    context.lineTo(canvas.width, canvas.height);
    context.lineTo(0, canvas.height);
    context.lineTo(canvas.width * 0.5, canvas.height * 0.5);
    context.closePath();
    context.fill();
}

async function SetStyle() {
    const cssResponse = await fetch("styles/" + currentRoomData.style + ".css");
    const css = await cssResponse.text();

    style.textContent = css;
}

function UpdateContentHtml() {
    let contentHtml = GetDescription(currentRoomData) + "\n";

    if (currentRoomData.options.length > 0) {
        contentHtml += "<ol>\n";

        for (let o = 0; o < currentRoomData.options.length; o++) {
            if (currentRoomData.options[o].link !== undefined && currentRoomData.options[o].link !== "") {
                const link = "SelectOption(" + o + ");";
                //contentHtml += "<li><a href=\"#\" onclick=\"" + link + "\">" + GetOptionDescription(currentRoomData, o) + "</a></li>\n";
                contentHtml += "<li><a href=\"javascript:" + link + "\">" + GetOptionDescription(currentRoomData, o) + "</a></li>\n";
            }
            else {
                contentHtml += "<li>" + GetOptionDescription(currentRoomData, o) + "</li>\n";
            }
        }

        contentHtml += "</ol>";
    }

    content.innerHTML = contentHtml;
    //console.log(contentHtml);
}

function PlaySound() {
    if (currentPlayingAudio !== undefined) {
        currentPlayingAudio.pause();
        currentPlayingAudio = undefined;
    }

    let sound = currentRoomData.initialSound;

    if (sound !== undefined && sound !== "") {
        if (currentAudioEnabled) {
            sound = "audio/" + sound;
            if (currentRoomData.localizedSound !== undefined && currentRoomData.localizedSound) {
                sound += currentLanguageIndex === 1 ? "-es" : "-en";
            }
            currentPlayingAudio = new Audio(sound + ".ogg");
            currentPlayingAudio.play();
        }
    }
}

function SelectOption(optionIndex) {
    LoadRoom(currentRoomData.options[optionIndex].link);
}

function SetLanguage(languageIndex) {
    currentLanguageIndex = languageIndex;
    UpdateContentHtml();
}

function SetAudioEnabled(enabled) {
    currentAudioEnabled = enabled;

    if (!enabled) {
        if (currentPlayingAudio !== undefined) {
            currentPlayingAudio.pause();
            currentPlayingAudio = undefined;
        }
    }
}

function GetDescription(roomData) {
    return currentLanguageIndex === 1 ? roomData.description.spanish : roomData.description.english;
}

function GetOptionDescription(roomData, index) {
    return currentLanguageIndex === 1 ? roomData.options[index].description.spanish : roomData.options[index].description.english;
}

function WindowResized() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    DrawBackground();
}

function ValidatePassword() {
    const pass = document.getElementById("pass");

    // Wow, congratulations! You found out the highly secret and encrypted password!

    const password = currentLanguageIndex === 1 ? "DejameSalirJoder" : "LetMeOutForFuckSake";

    if (pass.value === password)
        LoadRoom("4/bano");
    else
        LoadRoom("4/infierno");
}