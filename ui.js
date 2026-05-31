import {getNumMsps} from "./data.js";
import {getMspObject} from "./data.js";

function attachEventHandlers() {
  const headerDiv = document.getElementById("header");
  headerDiv.addEventListener("click", (e) => {
    if (e.target.type === "button") {
      const button = e.target.id;
      if (button === "colorModeBtn") {
        toggleColorMode();
      };
      if (button === "redealBtn") {
        reDeal(); 
      };
      if (button === "warningBtn") {
        panelButton(e.target);
      };
      if (button === "infoBtn") {
        panelButton(e.target);
      };
    };
  });
  const answeringDiv = document.getElementById("answering");
  answeringDiv.addEventListener("click", (e) => {
    if (e.target.type === "button") {
      const pressed = e.target.textContent;
      if (pressed === "check") {
        rightAnswer();
      } else if (pressed === "close") {
        wrongAnswer();
      };
    };
  });
  const deckDiv = document.getElementById("deck");
  deckDiv.addEventListener("click", (e) => {
    if (e.target.type === "button") {
      revealDetails(e.target.parentElement);
    };
  });
}

function revealDetails(container) {
  const elements = container.children;
  for (const element of elements) {
    element.classList.toggle("w3-hide");
  };
}

function panelButton(button) {
  const isToggled = (button.classList.contains("bouncing")) ? true: false; 
  const targetPanel = document.getElementById(button.dataset.target);
  if (isToggled) {
    targetPanel.classList.add("w3-hide");
    button.classList.remove("bouncing");
    const restoreElem = document.querySelector(".toBeRestored")
    restoreElem.classList.remove("w3-hide","toBeRestored");
  } else {
    const panels = document.querySelectorAll(".msgPanel");
    panels.forEach((panel) => {
      panel.classList.add("w3-hide");
    });
    targetPanel.classList.remove("w3-hide");
    const core = document.getElementById("core");
    const tempHideId = (core.classList.contains("w3-hide")) ? "loadScreen" : "core";
    const tempHideObj = document.getElementById(tempHideId);
    tempHideObj.classList.add("w3-hide","toBeRestored");
    const headerBtns = document.getElementById("header").querySelectorAll("button");
    headerBtns.forEach((headerButton) => {
      headerButton.classList.remove("bouncing");
    });
    button.classList.add("bouncing");
  };
}

function rightAnswer() {
  const deck = document.getElementById("deck");
  const holdingArea = document.getElementById("holdingArea");
  const topCard = deck.lastChild;
  concealAnswers(topCard);
  holdingArea.appendChild(topCard);
  if (deck.childElementCount >= 1) {
    setTopCard();
  } else {
    const answeringArea = document.getElementById("answering");
    answeringArea.classList.add("w3-hide");
  };
}

function wrongAnswer() {
  const deck = document.getElementById("deck");
  let topCard = deck.lastChild;
  concealAnswers(topCard);
  if (deck.childElementCount > 1) {
    deck.insertBefore(topCard,deck.firstChild);
  } else {
    deck.append(topCard);
  };
  const failCounter = document.getElementById("failCounter");
  const updatedCount = parseInt(failCounter.textContent)+1;
  failCounter.textContent = updatedCount;
  tidyDeck();
  setTopCard();
}

function concealAnswers(card) {
  const concealers = card.querySelectorAll("button");
  for (const concealer of concealers) {
    concealer.classList.remove("w3-hide");
    concealer.disabled = true;
    const container = concealer.parentElement;
    const revealer = container.lastChild;
    revealer.classList.add("w3-hide");
  };
}

function toggleColorMode() {
  const button = document.getElementById("colorModeBtn");
  const elements = document.querySelectorAll('[class*="w3-theme-"]');
  const newMode = button.textContent;
  const oldModeChar = (newMode === "light_mode") ? "d" : "l";
  const newModeChar = (newMode === "light_mode") ? "l" : "d";
  elements.forEach((element) => {
    element.classList.forEach((className) => {
      if (className.startsWith(`w3-theme-${oldModeChar}`)) {
        const newClassName = className.replace(`theme-${oldModeChar}`,`theme-${newModeChar}`);
        element.classList.remove(className);
        element.classList.add(newClassName);
      };
    });
  });
  if (newMode === "light_mode") {
    button.textContent = "dark_mode";
  } else {
    button.textContent = "light_mode";
  };
  const bwElements = document.querySelectorAll(".w3-black, .w3-white");
  bwElements.forEach((element) => {
    element.classList.toggle("w3-black");
    element.classList.toggle("w3-white");
  });
}

export async function buildDeck() {
  const holdingArea = document.getElementById("holdingArea");
  let myRotation = -25;
  let myYpos = 0;
  let myXpos = 0;
  for (let i = 0; i < getNumMsps(); i++) {
     const card = await buildCard(i);
   holdingArea.appendChild(card);
  };
  monitorImgRendering();
  deal();
}

function progressUpdateCards(i) {
  const processName = document.getElementById("processName");
  const progressBar = document.getElementById("progressBar");
  const progressMsg = document.getElementById("progressMsg");
  const numMsps = getNumMsps();
  const progressPercent = ((i+1) / numMsps) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressMsg.textContent = `making card ${i+1} of ${numMsps}`;
}

function progressUpdateImgRender() {
  const processName = document.getElementById("processName");
  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressMsg = document.getElementById("progressMsg");
  const progressSpinContainer = document.getElementById("progressSpinContainer");
  const progressSpinner = progressSpinContainer.firstChild;
  processName.textContent = "Waiting for image render";
  progressBarContainer.remove();
  progressMsg.remove();
  progressSpinContainer.classList.remove("w3-hide");
}

async function monitorImgRendering() {
  progressUpdateImgRender();
  const core = document.getElementById("core");
  const images = Array.from(core.querySelectorAll("img"));
  const resolve = () => {
    console.log("resolve called");
  };
  const reject = () => {
    console.log("reject called");
  };
  const imgPromises = images.map(img => {
    return new Promise((resolve, reject) => {
      const resolveWrapper = (value) => {
        resolve(value);
      };
      const rejectWrapper = (error) => {
        reject(error);
      };
      if (img.complete) {
        resolve();
      } else {
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',reject,{once:true});
      };
    });
  });
  await Promise.all(imgPromises);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const loadScreen = document.getElementById("loadScreen");
      loadScreen.remove();
      core.classList.remove("w3-hide");
    });
  });
}

function deal() {
  const holdingArea = document.getElementById("holdingArea");
  const deck = document.getElementById("deck");
  let dealt = 0;
  while (holdingArea.childElementCount > 0) {
    const max = holdingArea.childElementCount - 1;
    const randomNum = Math.floor(Math.random() * (max+1)) ;
    const card = holdingArea.childNodes[randomNum];
    deck.appendChild(card);
  };
  tidyDeck();
  setTopCard();
}

function reDeal() {
  const deck = document.getElementById("deck");
  const holdingArea = document.getElementById("holdingArea");
  const deckCards = deck.children;
  for (const card of deckCards) {
    concealAnswers(card);
    holdingArea.append(card);
  };
  document.getElementById("failCounter").textContent = 0;
  const answeringArea = document.getElementById("answering");
  answeringArea.classList.remove("w3-hide");
  deal();
}

function tidyDeck() {
  const deck = document.getElementById("deck");
  const deckSize = deck.childElementCount;
  for (let i = 0; i < deckSize; i++) {
    const card = deck.childNodes[i];
    const tens = Math.floor(i/10);
    const units = i - (tens * 10);
    let myRotation;
    let myYpos;
    const rotationValues = [
      -90,
      -45,
      -97,
      -20,
      -36,
      -51,
      -69,
      -93,
      -88,
      -34
    ];
    myRotation = rotationValues[tens] + (0.1 * units);
    myYpos = (((tens * 10) + units) - deckSize + 50) * -1;
    Object.assign(card.style, {
      transform:`rotate(${myRotation}deg)`,
      zIndex:i,
      top:`${myYpos}px`,
    });
  };
}

async function buildCard(mspIndexNum) {
  progressUpdateCards(mspIndexNum);
  const card = document.createElement("div");
  card.classList.add("w3-card-2","w3-theme-l4","mspCard");
  const mspObject = getMspObject(mspIndexNum);
  const imgContainer = document.createElement("div");
  imgContainer.classList.add("w3-container","w3-margin-top");
  imgContainer.style.maxWidth = "400px"; 
  const photo = document.createElement("img");
  await safePhotoSetting(photo,mspObject.PhotoURL);
  if (photo.src.includes("photoFallback")) {
    warnMissingPhoto(mspObject.displayName);
  };
  photo.classList.add("w3-image");
  photo.style.width = "95%";
  photo.style.maxHeight = "210px";
  photo.alt = "a photo of an MSP";
  imgContainer.appendChild(photo);
  card.appendChild(imgContainer);
  const memberInfoContainer = document.createElement("div");
  memberInfoContainer.classList.add("w3-container","w3-center");
  const memberFields = ["displayName","party","electoralArea"];
  const fieldDisplayNames = ["name","party","electoral area"];
  for (let i = 0; i < memberFields.length; i++) {
    const detailBlock = document.createElement("div");
    detailBlock.classList.add("w3-container","w3-padding");
    if (i < memberFields.length - 1) {
      detailBlock.classList.add("w3-border-bottom");
    };
    const concealer = document.createElement("button");
    concealer.classList.add("w3-button","w3-block","w3-theme");
    concealer.type = "button";
    concealer.disabled = true;
    const concealMsg = document.createTextNode(`click to reveal ${fieldDisplayNames[i]}`);
    concealer.appendChild(concealMsg);
    const revealer = document.createElement("div");
    revealer.classList.add("w3-hide","w3-padding");
    const revealMsg = document.createTextNode(`${mspObject[memberFields[i]]}`);
    revealer.appendChild(revealMsg);
    detailBlock.appendChild(concealer);
    detailBlock.appendChild(revealer);
    memberInfoContainer.appendChild(detailBlock);
  };
  card.appendChild(memberInfoContainer);
  if (mspIndexNum === getNumMsps()) {
    progressUpdateLoading();
  };
  return card;
}

function warnMissingPhoto(msp) {
  const warningBtn = document.getElementById("warningBtn");
  warningBtn.classList.remove("w3-hide");
  const warnPanel = document.getElementById("warnPanel");
  const warnPara = document.createElement("p");
  const textNode = document.createTextNode(`Failed to get image for ${msp}`);
  warnPara.appendChild(textNode);
  warnPanel.appendChild(warnPara);
}

async function safePhotoSetting(element,src) {
  const fallbackSrc = "photoFallback.webp"
  const ok = await new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth > 1 && probe.naturalHeight > 1) {
        resolve(true);
      } else {
        resolve(false);
      };
    };
    probe.onerror = () => resolve(false);
    probe.src = src;
  });
  element.src = ok ? src : fallbackSrc;
}

function setTopCard() {
  const topCard = document.getElementById("deck").lastChild;
  topCard.classList.remove("w3-card-2");
  topCard.classList.add("w3-card-4","topCard");
  topCard.style.removeProperty("transform");
  const buttons = topCard.querySelectorAll("button");
  for (const button of buttons) {
    button.disabled = false;
  };
}

attachEventHandlers();
