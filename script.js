const dialogueSequence = [
  {
    speaker: "छोटू",
    line: "बाप्पा बाप्पा!",
    hint: "छोटू आधी हळूच बाप्पाला हाक मारतो.",
    scene: null
  },
  {
    speaker: "बाप्पा",
    line: "काय रे छोटू?",
    hint: "बाप्पा हसत उत्तर देतात.",
    scene: null
  },
  {
    speaker: "छोटू",
    line: "तुला माहितीये का, एक सीक्रेट आहे 🤭",
    hint: "आता गुपित उलगडायला सुरुवात होते.",
    scene: null
  },
  {
    speaker: "बाप्पा",
    line: "काय 🤔",
    hint: "बाप्पाही उत्सुक झाले.",
    scene: null
  },
  {
    speaker: "छोटू",
    line: "आमच्या रोहितचं लग्न ठरलं आहे 🥳",
    hint: "आता खाली रोहितचा फोटो फ्लॅश होईल.",
    revealWeddingDecor: true,
    layout: "solo-reveal",
    scene: {
      tag: "",
      title: "चि. रोहित",
      caption: "हा आहे आपला नवरदेव रोहित.",
      placeholder: "",
      image: "./assets/web/rohit.jpg",
      imageClass: "memory-screen__photo--rohit",
      autoFocus: false
    }
  },
  {
    speaker: "बाप्पा",
    line: "वा! कोणाशी?",
    hint: "बातमी अजून रंगात आली आहे.",
    layout: "solo-reveal",
    keepScene: true,
    scene: null
  },
  {
    speaker: "छोटू",
    line: "रावांच्या चैतालीशी 🥰",
    hint: "आता रोहितच्या जागी चैतालीचा फोटो येईल.",
    layout: "solo-reveal",
    scene: {
      tag: "",
      title: "चि.सौं.का. चैताली",
      caption: "आणि ही आहे आपली नवरी चैताली.",
      placeholder: "",
      image: "./assets/web/chaitali.jpg",
      imageClass: "memory-screen__photo--chaitali",
      autoFocus: false
    }
  },
  {
    speaker: "बाप्पा",
    line: "वा! फारच छान बातमी आहे. माझा आशीर्वाद त्यांच्या पाठीशी आहे ✋",
    hint: "आता दोघांचा एकत्र फोटो दिसेल.",
    layout: "bappa-blessing",
    duration: 4400,
    scene: {
      tag: "आशीर्वाद",
      title: "रोहित आणि चैताली",
      caption: "दोघांच्या नव्या प्रवासाला आपले आशीर्वाद हवेत.",
      placeholder: "",
      image: "./assets/web/rohit-chaitali.jpg",
      imageClass: "memory-screen__photo--couple",
      autoFocus: false
    }
  },
  {
    speaker: "बाप्पा",
    line: "मी तर ह्यांना आशीर्वाद दिलाय. आता तुम्ही सुद्धा द्यायला आवर्जून या",
    hint: "आता खाली घरच्यांची ओळख एकामागून एक दिसेल.",
    layout: "bappa-focus",
    scene: null
  }
];

const inviteeOrder = [
  "vikas",
  "chaitali-dharap",
  "neha-kaustubh",
  "kaku-dada-vahini",
  "dharap-pets",
  "anya"
];
const inviteeDisplayDuration = 2700;
const dialogueStepDuration = 3400;
const dialogueEndingDelay = 2200;
const memorySwapDuration = 240;
const sectionRevealDuration = 620;
const sceneImageUrls = dialogueSequence
  .map((step) => step.scene?.image)
  .filter(Boolean);

sceneImageUrls.forEach((imageUrl) => {
  const image = new Image();
  image.src = imageUrl;
});

const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueLine = document.getElementById("dialogue-line");
const speechBubble = document.getElementById("speech-bubble");
const comicStage = document.getElementById("comic-stage");
const chotuCharacter = document.getElementById("character-chotu");
const bappaCharacter = document.getElementById("character-bappa");
const memoryScreen = document.getElementById("memory-screen");
const memoryCard = document.getElementById("memory-card");
const memoryImage = document.getElementById("memory-image");
const memoryTag = document.getElementById("memory-tag");
const memoryTitle = document.getElementById("memory-title");
const memoryCaption = document.getElementById("memory-caption");
const memoryPlaceholder = document.getElementById("memory-placeholder");
const comicFooter = document.querySelector(".comic__footer");
const comicSection = document.getElementById("comic");
const replayButton = document.getElementById("replay-button");
const dialogueResumeButton = document.getElementById("dialogue-resume-button");
const inviteeCards = Array.from(document.querySelectorAll(".invitee-card"));
const inviteesList = document.getElementById("invitees-list");
const previousInviteeButton = document.getElementById("previous-invitee");
const nextInviteeButton = document.getElementById("next-invitee");
const inviteesSection = document.getElementById("invitees");
const detailsSection = document.getElementById("details");

let timeouts = [];
let activeInviteeIndex = 0;
let swipeStartX = null;
let swipeStartY = null;
let screenWakeLock = null;
let conversationTimeoutId = null;
let conversationTimeoutDelay = 0;
let conversationTimeoutStartedAt = 0;
let pendingConversationAction = null;
let remainingConversationDelay = 0;
let currentDialogueIndex = 0;
let isConversationPaused = false;
let isDialoguePauseEnabled = false;

function clearTimeline() {
  timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  timeouts = [];
  if (conversationTimeoutId !== null) {
    window.clearTimeout(conversationTimeoutId);
    conversationTimeoutId = null;
  }
  conversationTimeoutDelay = 0;
  conversationTimeoutStartedAt = 0;
  pendingConversationAction = null;
  remainingConversationDelay = 0;
}

function setDialogueStep(step) {
  if (
    !dialogueSpeaker ||
    !dialogueLine ||
    !speechBubble ||
    !comicStage ||
    !chotuCharacter ||
    !bappaCharacter
  ) {
    return;
  }

  const isChotuSpeaking = step.speaker === "छोटू";
  const isBappaBlessing = step.layout === "bappa-blessing";
  const isBappaFocus = step.layout === "bappa-focus";
  const isSoloReveal = step.layout === "solo-reveal";

  dialogueSpeaker.textContent = step.speaker;
  dialogueLine.textContent = step.line;
  comicStage.classList.toggle("is-bappa-blessing", isBappaBlessing);
  comicStage.classList.toggle("is-bappa-focus", isBappaFocus);
  comicStage.classList.toggle("is-solo-reveal", isSoloReveal);
  if (step.revealWeddingDecor) {
    comicStage.classList.add("is-wedding-revealed");
  }
  memoryScreen?.toggleAttribute("hidden", isBappaFocus);
  speechBubble.classList.toggle("speech-bubble--left", isChotuSpeaking);
  speechBubble.classList.toggle("speech-bubble--right", !isChotuSpeaking);
  chotuCharacter.classList.toggle("is-speaking", isChotuSpeaking);
  chotuCharacter.classList.toggle("is-listening", !isChotuSpeaking);
  bappaCharacter.classList.toggle("is-speaking", !isChotuSpeaking);
  bappaCharacter.classList.toggle("is-listening", isChotuSpeaking);

  if (isBappaFocus) {
    hideMemoryScene();
  }
}

function hideMemoryScene() {
  if (!memoryScreen || !memoryCard || !memoryImage) {
    return;
  }

  memoryScreen.classList.remove("is-active");
  memoryCard.classList.remove("is-visible");
  memoryImage.classList.remove("has-image");
  memoryImage.innerHTML =
    '<span class="memory-screen__placeholder" id="memory-placeholder">फोटो इथे दिसेल</span>';
}

function showMemoryScene(scene) {
  if (!memoryScreen || !memoryCard || !memoryImage || !memoryTag || !memoryTitle || !memoryCaption) {
    return;
  }

  const isReplacingVisibleScene = memoryScreen.classList.contains("is-active");

  const renderScene = () => {
    memoryTag.textContent = scene.tag;
    memoryTitle.textContent = scene.title;
    memoryCaption.textContent = scene.caption;
    memoryImage.classList.remove("has-image");

    if (scene.image) {
      memoryImage.classList.add("has-image");
      memoryImage.innerHTML =
        `<img src="${scene.image}" alt="${scene.title}" class="${scene.imageClass || ""}" />`;
    } else {
      memoryImage.innerHTML = `<span class="memory-screen__placeholder">${scene.placeholder}</span>`;
    }

    memoryScreen.classList.add("is-active");
    memoryCard.classList.add("is-visible");
    memoryCard.classList.remove("is-swapping");

    if (scene.autoFocus !== false) {
      window.requestAnimationFrame(() => {
        memoryCard.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  if (isReplacingVisibleScene) {
    memoryCard.classList.add("is-swapping");
    timeouts.push(window.setTimeout(renderScene, memorySwapDuration));
    return;
  }

  renderScene();
}

function resetInvitees() {
  activeInviteeIndex = 0;
  inviteesSection?.classList.remove("is-revealed");
  detailsSection?.classList.remove("is-revealed");

  inviteeCards.forEach((card) => {
    card.classList.remove("is-active");
    card.setAttribute("aria-hidden", "true");
  });
}

function showInviteeAt(index) {
  if (inviteeCards.length === 0) {
    return;
  }

  activeInviteeIndex = (index + inviteeCards.length) % inviteeCards.length;

  inviteeCards.forEach((card, cardIndex) => {
    const isActive = cardIndex === activeInviteeIndex;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-hidden", String(!isActive));
  });
}

function handleInviteePointerDown(event) {
  swipeStartX = event.clientX;
  swipeStartY = event.clientY;
}

function handleInviteePointerUp(event) {
  if (swipeStartX === null || swipeStartY === null) {
    return;
  }

  const horizontalDistance = event.clientX - swipeStartX;
  const verticalDistance = event.clientY - swipeStartY;
  swipeStartX = null;
  swipeStartY = null;

  if (Math.abs(horizontalDistance) < 45 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) {
    return;
  }

  showInviteeAt(activeInviteeIndex + (horizontalDistance < 0 ? 1 : -1));
}

async function requestScreenWakeLock() {
  if (
    !("wakeLock" in navigator) ||
    screenWakeLock !== null ||
    document.visibilityState !== "visible"
  ) {
    return;
  }

  try {
    const wakeLock = await navigator.wakeLock.request("screen");
    screenWakeLock = wakeLock;
    wakeLock.addEventListener(
      "release",
      () => {
        if (screenWakeLock === wakeLock) {
          screenWakeLock = null;
        }
      },
      { once: true }
    );
  } catch {
    screenWakeLock = null;
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    requestScreenWakeLock();
  }
}

function revealAndScrollTo(section, block = "center") {
  section.classList.add("is-revealed");
  timeouts.push(
    window.setTimeout(() => {
      section.scrollIntoView({ behavior: "smooth", block });
    }, sectionRevealDuration)
  );
}

function hideReplayButton() {
  comicFooter?.classList.remove("is-visible");
  replayButton?.classList.remove("is-visible");
  replayButton?.setAttribute("aria-hidden", "true");
  replayButton?.setAttribute("tabindex", "-1");
}

function hideDialogueResumeButton() {
  dialogueResumeButton?.classList.remove("is-visible");
  dialogueResumeButton?.setAttribute("aria-hidden", "true");
  dialogueResumeButton?.setAttribute("tabindex", "-1");
}

function showDialogueResumeButton() {
  dialogueResumeButton?.classList.add("is-visible");
  dialogueResumeButton?.setAttribute("aria-hidden", "false");
  dialogueResumeButton?.removeAttribute("tabindex");
}

function showReplayButton() {
  comicFooter?.classList.add("is-visible");
  replayButton?.classList.add("is-visible");
  replayButton?.setAttribute("aria-hidden", "false");
  replayButton?.removeAttribute("tabindex");
}

function scheduleConversationAction(action, delay) {
  pendingConversationAction = action;
  conversationTimeoutDelay = delay;
  conversationTimeoutStartedAt = window.performance.now();
  conversationTimeoutId = window.setTimeout(() => {
    conversationTimeoutId = null;
    conversationTimeoutDelay = 0;
    conversationTimeoutStartedAt = 0;
    remainingConversationDelay = 0;
    const nextAction = pendingConversationAction;
    pendingConversationAction = null;
    nextAction?.();
  }, delay);
}

function finishConversation() {
  isDialoguePauseEnabled = false;
  isConversationPaused = false;
  hideDialogueResumeButton();
  playInviteesSequence();
}

function advanceConversation() {
  if (currentDialogueIndex >= dialogueSequence.length) {
    scheduleConversationAction(finishConversation, dialogueEndingDelay);
    return;
  }

  const step = dialogueSequence[currentDialogueIndex];
  setDialogueStep(step);

  if (step.scene) {
    showMemoryScene(step.scene);
  } else if (currentDialogueIndex >= 4 && !step.keepScene) {
    hideMemoryScene();
  }

  currentDialogueIndex += 1;
  scheduleConversationAction(
    currentDialogueIndex >= dialogueSequence.length ? finishConversation : advanceConversation,
    currentDialogueIndex >= dialogueSequence.length
      ? dialogueEndingDelay
      : (step.duration ?? dialogueStepDuration)
  );
}

function pauseConversation() {
  if (!isDialoguePauseEnabled || isConversationPaused || conversationTimeoutId === null) {
    return;
  }

  const elapsed = window.performance.now() - conversationTimeoutStartedAt;
  remainingConversationDelay = Math.max(0, conversationTimeoutDelay - elapsed);
  window.clearTimeout(conversationTimeoutId);
  conversationTimeoutId = null;
  conversationTimeoutDelay = 0;
  conversationTimeoutStartedAt = 0;
  isConversationPaused = true;
  showDialogueResumeButton();
}

function resumeConversation() {
  if (!isConversationPaused || !pendingConversationAction) {
    return;
  }

  isConversationPaused = false;
  hideDialogueResumeButton();
  scheduleConversationAction(pendingConversationAction, remainingConversationDelay);
}

function playInviteesSequence() {
  if (!inviteesSection) {
    return;
  }

  revealAndScrollTo(inviteesSection);

  inviteeOrder.forEach((personKey, index) => {
    timeouts.push(
      window.setTimeout(() => {
        const inviteeIndex = inviteeCards.findIndex((card) => card.dataset.person === personKey);
        showInviteeAt(inviteeIndex);
      }, index * inviteeDisplayDuration + 500)
    );
  });

  if (detailsSection) {
    timeouts.push(
      window.setTimeout(() => {
        showReplayButton();
        revealAndScrollTo(detailsSection, "start");
      }, inviteeOrder.length * inviteeDisplayDuration + 1800)
    );
  }
}

function playConversation() {
  clearTimeline();
  comicStage?.classList.remove("is-bappa-blessing");
  comicStage?.classList.remove("is-bappa-focus");
  comicStage?.classList.remove("is-solo-reveal");
  comicStage?.classList.remove("is-wedding-revealed");
  hideReplayButton();
  hideDialogueResumeButton();
  hideMemoryScene();
  resetInvitees();
  currentDialogueIndex = 0;
  isConversationPaused = false;
  isDialoguePauseEnabled = true;
  advanceConversation();
}

if (replayButton) {
  replayButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    playConversation();
  });
}

dialogueResumeButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  resumeConversation();
});

comicSection?.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest("#dialogue-resume-button, #replay-button")) {
    return;
  }

  if (isConversationPaused) {
    resumeConversation();
    return;
  }

  pauseConversation();
});

inviteesList?.addEventListener("pointerdown", handleInviteePointerDown);
inviteesList?.addEventListener("pointerup", handleInviteePointerUp);
inviteesList?.addEventListener("pointercancel", () => {
  swipeStartX = null;
  swipeStartY = null;
});

previousInviteeButton?.addEventListener("click", () => {
  showInviteeAt(activeInviteeIndex - 1);
});

nextInviteeButton?.addEventListener("click", () => {
  showInviteeAt(activeInviteeIndex + 1);
});

document.addEventListener("visibilitychange", handleVisibilityChange);
document.addEventListener("pointerdown", requestScreenWakeLock, { once: true });

playConversation();
requestScreenWakeLock();
