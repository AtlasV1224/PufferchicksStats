
const storageKey = 'theme-preference'

const onClick = () => {
    // flip current value
    theme.value = theme.value === 'light'
        ? 'dark'
        : 'light'

    setPreference()
}

const getColorPreference = () => {
    if (localStorage.getItem(storageKey))
        return localStorage.getItem(storageKey)
    else
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
}

const setPreference = () => {
    localStorage.setItem(storageKey, theme.value)
    reflectPreference()
}

const reflectPreference = () => {
    document.firstElementChild
        .setAttribute('data-theme', theme.value)

    document
        .querySelector('#theme-toggle')
        ?.setAttribute('aria-label', theme.value)
}

const theme = {
    value: getColorPreference(),
}

// set early so no page flashes / CSS is made aware
reflectPreference()

window.onload = () => {
    // set on load so screen readers can see latest value on the button
    reflectPreference()

    // now this script can find and listen for clicks on the control
    document
        .querySelector('#theme-toggle')
        .addEventListener('click', onClick)
}

// sync with system changes
window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({matches:isDark}) => {
        theme.value = isDark ? 'dark' : 'light'
        setPreference()
    })


// Minecraft UUID to Username
const Usernames = {
    "AtlasV1224": "7c7518ea-d77c-401e-805e-3fecb9d3f888",
    "tlitookilakin": "8ee61ef3-1eee-4867-96c6-c9ee708cd1ea",
    "Pinkmoney": "8fa2d575-05fe-4af0-a62f-d8493aecae66",
    "kittycatcasey": "9beee7d5-6f24-45b4-acf2-bcd3cab184a2",
    "DecidedlyHuman": "83caec38-58b8-4d24-95ec-209eefc8ce73",
    "Erinthe": "246bc0d1-c5f6-418e-baaf-a9b632ace079",
    "Super_MrSpring": "2886d944-b171-413f-ad25-4d5f27ee46ed",
    "Spiderbuttons": "07304b7d-1ab9-49ea-9995-35fba7b17e4a",
    "Xeragene": "7746f2d4-a4d7-4d6a-bb59-82ad6ecd6725",
    "shekurika": "051295fe-8aec-44aa-84c6-f9b6eea8245c",
    "KhloeLeclair": "41481473-e075-4896-adcd-0e91c89606df",
    "pneuma163": "55725902-ad5d-4a1f-9ee3-3e3c61f6102a",
    "TheFrenchDodo": "b279d81d-dd25-418f-b78c-6ae7282d26c5",
    "ScarletCraft": "d1a2643a-fd66-4af6-81f4-1b7b8cd86653",
    "skellady": "ddbd74b6-8302-4f93-ae1d-9ca8db5000a0",
    "Pil_": "e054b62a-e6d7-475d-8fae-a4ebf98c8519",
    "SinZ": "e0989ba6-7eee-4ad1-9c49-88fc6db8e7e5",
    "LeFauxMatt": "ec1b0b30-782d-44ec-8e06-79def1444c26",


}

// Minecraft Avatar settter
document.getElementById("avatarAtlasV1224").src = "https://crafthead.net/avatar/AtlasV1224";
document.getElementById("avatartlitookilakin").src = "https://crafthead.net/avatar/tlitookilakin";
document.getElementById("avatarPinkmoney").src = "https://crafthead.net/avatar/Pinkmoney";
document.getElementById("avatarkittycatcasey").src = "https://crafthead.net/avatar/kittycatcasey";
document.getElementById("avatarDecidedlyHuman").src = "https://crafthead.net/avatar/DecidedlyHuman";
document.getElementById("avatarErinthe").src = "https://crafthead.net/avatar/Erinthe";
document.getElementById("avatarSuper_MrSpring").src = "https://crafthead.net/avatar/Super_MrSpring";
document.getElementById("avatarSpiderbuttons").src = "https://crafthead.net/avatar/Spiderbuttons";
document.getElementById("avatarXeragene").src = "https://crafthead.net/avatar/Xeragene";
document.getElementById("avatarshekurika").src = "https://crafthead.net/avatar/shekurika";
document.getElementById("avatarKhloeLeclair").src = "https://crafthead.net/avatar/KhloeLeclair";
document.getElementById("avatarpneuma163").src = "https://crafthead.net/avatar/pneuma163";
document.getElementById("avatarTheFrenchDodo").src = "https://crafthead.net/avatar/TheFrenchDodo";
document.getElementById("avatarScarletCraft").src = "https://crafthead.net/avatar/ScarletCraft";
document.getElementById("avatarskellady").src = "https://crafthead.net/avatar/skellady";
document.getElementById("avatarPil_").src = "https://crafthead.net/avatar/Pil_";
document.getElementById("avatarSinZ").src = "https://crafthead.net/avatar/SinZ";
document.getElementById("avatarLeFauxMatt").src = "https://crafthead.net/avatar/LeFauxMatt";

// if season = season1
//     if stat selection = global
//         overwrite main
//     else
//         get selected name
//             set specific fields to name

const seasonButtons = document.querySelectorAll(".seasonButton");
const statButtons = document.querySelectorAll(".statButton");

function logSelection() {
    const selectedSeason = document.querySelector('input[name="seasonSelect"]:checked')?.value;
    const selectedStat = document.querySelector('input[name="statSelect"]:checked')?.value;

    if (!selectedSeason || !selectedStat) return;

    if (selectedSeason === "season1") {
        if (selectedStat === "global") {
            console.log("Season 1 global selected"); //TODO: Do global stats
        } else {
            console.log(`Season 1 ${selectedStat} selected`);
            document.getElementById("statDisplayAvatar").src = `https://crafthead.net/armor/body/${selectedStat}`;
            document.getElementById("statDisplayUsername").innerText = selectedStat;
            document.getElementById("statDisplayTotalDeaths").innerText = `Total deaths: 10` //TODO: add actual value
            document.getElementById("statDisplayTotalLootr").innerText = `Total lootr chests opened: 5` //TODO: add actual value
        }
    } else if (selectedSeason === "season2") {
        if (selectedStat === "global") {
            console.log("Season 2 global selected"); //TODO: Do global stats 2: electric boogaloo
        } else {
            console.log(`Season 2 ${selectedStat} selected`); //TODO: ye this too
        }
    }
}

// Attach listeners to both season and stat buttons
seasonButtons.forEach(radio => radio.addEventListener("change", logSelection));
statButtons.forEach(radio => radio.addEventListener("change", logSelection));

