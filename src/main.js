const CONFIG = {
  deepLink: "az.azerconnect.nar://",
  androidPackage: "az.azerconnect.nar",
  androidStore:
    "https://play.google.com/store/apps/details?id=az.azerconnect.nar",
  iosStore: "https://apps.apple.com/us/app/nar/id6444889671",
  apiUrl: "https://app.nar.az/api/v1/loyalty-service/clipboards",
};

const message = document.getElementById("message");
const spinner = document.getElementById("spinner");
const storeBtn = document.getElementById("storeBtn");

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
const isMobile = isIOS || isAndroid;

async function sendToAPI() {
  try {
    await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link: window.location.href,
      }),
    });
  } catch (error) {
    console.log("API error:", error);
  }
}

function openApp() {
  return new Promise((resolve) => {
    let opened = false;

    const detectOpen = () => {
      if (document.hidden || document.webkitHidden) {
        opened = true;
        resolve(true);
      }
    };

    document.addEventListener("visibilitychange", detectOpen);
    window.addEventListener("pagehide", detectOpen);

    setTimeout(() => {
      document.removeEventListener("visibilitychange", detectOpen);
      window.removeEventListener("pagehide", detectOpen);
      resolve(opened);
    }, 2500);

    if (isIOS) {
      window.location.href = CONFIG.deepLink;
    } else if (isAndroid) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = CONFIG.deepLink;
      document.body.appendChild(iframe);

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  });
}

function redirectToStore() {
  const storeUrl = isIOS ? CONFIG.iosStore : CONFIG.androidStore;
  window.location.href = storeUrl;
}

function showLoading(text) {
  message.textContent = text;
  spinner.classList.remove("hidden");
  storeBtn.classList.add("hidden");
}

function showStore() {
  message.textContent = "Tətbiq tapılmadı";
  spinner.classList.add("hidden");
  storeBtn.classList.remove("hidden");
}

function showDesktop() {
  message.textContent = "Bu link mobil cihazlarda işləyir";
  spinner.classList.add("hidden");
}

async function main() {
  sendToAPI();

  if (!isMobile) {
    showDesktop();
    return;
  }

  showLoading("Tətbiq açılır...");
  const appOpened = await openApp();

  if (!appOpened) {
    showStore();

    storeBtn.onclick = redirectToStore;

    setTimeout(redirectToStore, 2000);
  }
}

main();
