

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


let deathsDataSeason1;        // holds data for this tab session
let lootrTotalDataSeason1;    // holds data for this tab session
let miscDataSeason1
let dataLoaded = false;       // guard so init runs once

async function init() {
    if (dataLoaded) return; // don’t run twice
    dataLoaded = true;
    try {
        const [deaths, lootr, misc] = await Promise.all([
            fetch("./Sorted/Season1/deathsCount.json").then(r => r.json()),
            fetch("./Sorted/Season1/lootrCount.json").then(r => r.json()),
            fetch("./Sorted/Season1/misc.json").then(r => r.json()),
        ]);
        deathsDataSeason1 = deaths;
        lootrTotalDataSeason1 = lootr;
        miscDataSeason1 = misc;
        // Invalidate cached Global HTML so it rebuilds with fresh data
        season1GlobalContent = null;

        // If you need to render default view once data is ready, do it here
        // e.g., call logSelection() if inputs already have defaults
        logSelection();
    } catch (e) {
        console.error("Failed to load Season 1 data", e);
    }
}

window.addEventListener('DOMContentLoaded', init);

// Cache original Season 1 stat display
const main = document.getElementById("main");
let season1Content = main.innerHTML; // original Season 1 HTML
let season1GlobalContent = null; // will store global-specific HTML

function logSelection() {
    const selectedSeason = document.querySelector('input[name="seasonSelect"]:checked')?.value;
    const selectedStat = document.querySelector('input[name="statSelect"]:checked')?.value;

    if (!selectedSeason || !selectedStat) return;

    if (selectedSeason === "season1") {
        // Season 1 + Global
        if (selectedStat === "global") {
            // If global content is not yet cached, create it
            if (!season1GlobalContent) {
                // Clear main and insert custom global content
                main.innerHTML = "";

                const daysPlayedIRL = Math.floor(miscDataSeason1?.daysPlayedIRL ?? 0);
                const playersJoined = miscDataSeason1?.playerCount ?? 0;
                const daysPlayed = Math.floor(miscDataSeason1?.daysPlayed ?? 0);
                let deathCount = 0;
                for (let key in Usernames) {
                    deathCount += deathsDataSeason1[key];
                }
                const totalDistance = Math.floor(miscDataSeason1?.totalDistanceCM ?? 0 /1000);
                const lootrTotal = lootrTotalDataSeason1?.lootrTotal ?? 0;
                const X = "REPLACE ME" //TODO: Replace all occurances of "X" with actual values

                const headingWrapper = document.createElement("div");
                headingWrapper.classList.add("boxShadowForWrappers");
                main.appendChild(headingWrapper);

                const heading = document.createElement("h1");
                heading.innerText = "Season 1 Global Stats";
                heading.style.textAlign = "center";
                headingWrapper.appendChild(heading);

                const description = document.createElement("p");
                description.innerText = `Season 1 has come to an end after ${daysPlayedIRL} days! During this time, ${playersJoined} players joined the adventure, building incredible bases and exploring the world together. Now, as we close this chapter, we move on to a brand-new world in a fresh pack, filled with new buildings, environments, and mods to experiment with.
                
                To celebrate Season 1, we’ve compiled a set of stats for everyone to enjoy. With Season 2, new adventures await and with them, fresh new statistics! Each day, when a world backup occurs, the latest stats will be displayed for all to see, including a few extras added to the previous season.  `;
                description.style.textAlign = "center";
                headingWrapper.appendChild(description);

                const worldStatsWrapper = document.createElement("div");
                worldStatsWrapper.classList.add("boxShadowForWrappers");
                main.appendChild(worldStatsWrapper);

                const worldStatsHeading = document.createElement("h2");
                worldStatsHeading.innerText = "World Statistics:";
                worldStatsHeading.style.textAlign = "center";
                worldStatsWrapper.appendChild(worldStatsHeading);

                const worldStats = document.createElement("p");
                worldStats.innerText = `
                • Season 1 lasted ${daysPlayedIRL} days, equivalent to ${daysPlayed} Minecraft days!  
                • Throughout the life of the server, There were also ${deathCount} player deaths.
                • Exploration was a key focus this season, with an impressive ${totalDistance} blocks covered collectively by all players.
                • Looting was also a favorite pastime, resulting in ${lootrTotal} Lootr inventories opened!`;
                worldStats.style.textAlign = "center";
                worldStatsWrapper.appendChild(worldStats);

                // Season 1 has come to an end after <X> days! During this time, <X> players joined the adventure, building incredible bases and exploring the world together. Now, as we close this chapter, we move on to a brand-new world in a fresh pack, filled with new buildings, environments, and mods to experiment with.
                //
                //     To celebrate Season 1, we’ve compiled a set of stats for everyone to enjoy. With Season 2, new adventures await and with them, fresh new statistics! Each day, when a world backup occurs, the latest stats will be displayed for all to see, including a few extras added to the previous season.
                //
                //     World Statistics:
                //     - Season 1 lasted <X> days, equivalent to <X> Minecraft days!
                //         - Throughout the life of the server, There were also <X> player deaths, mostly caused by <X>.
                //             - Exploration was a key focus this season, with an impressive <X> blocks covered collectively by all players.
                //                 - Looting was also a favorite pastime, resulting in <X> Lootr inventories looted1
                //
                //                     The time spent on the server by players varied greatly, here are the top 5 players with the longest time spent on the server:
                //                     1. <Player1>
                //                         2. <Player2>
                //                         3. <Player3>
                //                         4. <Player4>
                //                         5. <Player5>

                //TODO: Replace global stats with none global stats
                                    // Cache it for later
                season1GlobalContent = main.innerHTML;
            } else {
                // Restore cached global content
                main.innerHTML = season1GlobalContent;
            }
        } else {
            // Restore regular Season 1 stat display
            main.innerHTML = season1Content;

            // Then update the stats for the selected player
            const deathCount = deathsDataSeason1?.[selectedStat] ?? 0;
            const lootrCountTotal = lootrTotalDataSeason1?.Total?.[selectedStat] ?? 0;

            const playerLootrData =
                lootrTotalDataSeason1?.ByTable?.[selectedStat] ?? {};

            const entries = Object.entries(playerLootrData);

// Cache DOM nodes
            const tableEls = [
                {
                    name: document.getElementById("statDisplayTopLootTable1"),
                    total: document.getElementById("statDisplayTopLootTableTotal1"),
                },
                {
                    name: document.getElementById("statDisplayTopLootTable2"),
                    total: document.getElementById("statDisplayTopLootTableTotal2"),
                },
                {
                    name: document.getElementById("statDisplayTopLootTable3"),
                    total: document.getElementById("statDisplayTopLootTableTotal3"),
                },
                {
                    name: document.getElementById("statDisplayTopLootTable4"),
                    total: document.getElementById("statDisplayTopLootTableTotal4"),
                },
                {
                    name: document.getElementById("statDisplayTopLootTable5"),
                    total: document.getElementById("statDisplayTopLootTableTotal5"),
                },
            ];

            if (entries.length === 0) {
                // No Lootr data at all
                tableEls[0].name.innerText = "No Lootr chests looted";
                tableEls[0].total.style.display = "none";

                for (let i = 1; i < tableEls.length; i++) {
                    tableEls[i].name.innerText = "";
                    tableEls[i].total.style.display = "none";
                }
            } else {
                // Populate available tables
                const maxTables = Math.min(entries.length, 5);
                let i = 0;

                // Fill available tables
                for (; i < maxTables; i++) {
                    const [table, total] = entries[i];
                    tableEls[i].name.innerText = `${table}:`;
                    tableEls[i].total.innerText = `Opened ${total} times`;
                    tableEls[i].total.style.display = ""; // show totals
                }

                // If fewer than 5, show "No more loot tables opened" once
                if (i < 5) {
                    tableEls[i].name.innerText = "No more loot tables opened";
                    tableEls[i].total.style.display = "none";
                    i++;
                }

                // Hide remaining rows
                for (; i < 5; i++) {
                    tableEls[i].name.innerText = "";
                    tableEls[i].total.style.display = "none";
                }
            }

            document.getElementById("statDisplayAvatar").src = `https://crafthead.net/armor/body/${selectedStat}`;
            document.getElementById("statDisplayUsername").innerText = selectedStat;
            document.getElementById("statDisplayTotalDeaths").innerText = `Total deaths: ${deathCount}`;
            document.getElementById("statDisplayTotalLootr").innerText = `Total lootr chests opened: ${lootrCountTotal}`;

            document.getElementById("statDisplayTopLootTable1").innerText = `${lootrTable1}: `;
            document.getElementById("statDisplayTopLootTableTotal1").innerText = `Opened ${lootrTableTotal1} times`;
            document.getElementById("statDisplayTopLootTable2").innerText = `${lootrTable2}: `;
            document.getElementById("statDisplayTopLootTableTotal2").innerText = `Opened ${lootrTableTotal2} times`;
            document.getElementById("statDisplayTopLootTable3").innerText = `${lootrTable3}: `;
            document.getElementById("statDisplayTopLootTableTotal3").innerText = `Opened ${lootrTableTotal3} times`;
            document.getElementById("statDisplayTopLootTable4").innerText = `${lootrTable4}: `;
            document.getElementById("statDisplayTopLootTableTotal4").innerText = `Opened ${lootrTableTotal4} times`;
            document.getElementById("statDisplayTopLootTable5").innerText = `${lootrTable5}: `;
            document.getElementById("statDisplayTopLootTableTotal5").innerText = `Opened ${lootrTableTotal5} times`;
        }
    } else if (selectedSeason === "season2") {
        main.innerHTML = "";

        const season2SoonWrapper = document.createElement("div");
        season2SoonWrapper.classList.add("boxShadowForWrappers");
        main.appendChild(season2SoonWrapper);

        const heading = document.createElement("h1");
        heading.innerText = `Season 2 is coming soon!`;
        heading.style.textAlign = "center";
        season2SoonWrapper.appendChild(heading);

        const season2StartTimeUTC = "2025-12-20T15:18:30Z";
        const season2StartTime = new Date(season2StartTimeUTC);
        const season2StartTimeFormatted = new Intl.DateTimeFormat(
            navigator.language,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(season2StartTime);
        const description = document.createElement("p");
        description.innerText = `Get ready for for the start of a new season starting on ${season2StartTimeFormatted} in...`;
        description.style.textAlign = "center";
        season2SoonWrapper.appendChild(description);

        const packLink = document.createElement("a");
        packLink.href = "https://www.curseforge.com/minecraft/modpacks/craftoria"; // target URL
        packLink.style.textDecoration = "underline"; // optional
        packLink.style.color = "inherit";       // optional

        const packName = document.createElement("h1");
        packName.innerText = "Craftoria!";
        packName.style.textAlign = "center";

        packLink.appendChild(packName);
        season2SoonWrapper.appendChild(packLink);
    }
}

// Attach listeners to both season and stat buttons
const seasonButtons = document.querySelectorAll(".seasonButton");
const statButtons = document.querySelectorAll(".statButton");

window.addEventListener('DOMContentLoaded', () => {
    logSelection();
});

seasonButtons.forEach(radio => radio.addEventListener("change", logSelection));
statButtons.forEach(radio => radio.addEventListener("change", logSelection));


