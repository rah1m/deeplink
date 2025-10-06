function openAppOrStore(deepLink, androidStoreLink, iosStoreLink, appName) {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSafari =
    /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
  const statusDiv = document.getElementById("status");

  if (isiOS || isAndroid) {
    statusDiv.innerHTML = `<p class="status-message">Attempting to open ${appName}...</p>`;

    // Safari requires a different approach
    if (isSafari && isiOS) {
      // For Safari on iOS, use iframe method which is more reliable
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      const startTime = Date.now();
      let hasRedirected = false;

      // Set a longer timeout for Safari
      const fallbackTimeout = setTimeout(() => {
        if (!hasRedirected) {
          statusDiv.innerHTML = `<p class="status-message warning">App not found, redirecting to store...</p>`;
          window.location.href = iosStoreLink;
          hasRedirected = true;
        }
      }, 3000);

      // Listen for page visibility changes
      const visibilityHandler = () => {
        if (document.visibilityState === "hidden") {
          clearTimeout(fallbackTimeout);
          statusDiv.innerHTML = `<p class="status-message success">Opening ${appName}...</p>`;
          hasRedirected = true;
        }
      };

      document.addEventListener("visibilitychange", visibilityHandler);

      // Clean up iframe after timeout
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        document.removeEventListener("visibilitychange", visibilityHandler);
      }, 4000);
    } else {
      // Standard approach for Chrome, Firefox, and Android
      const fallbackTimeout = setTimeout(() => {
        statusDiv.innerHTML = `<p class="status-message warning">App not found, redirecting to store...</p>`;
        if (isiOS) {
          window.location.href = iosStoreLink;
        } else if (isAndroid) {
          window.location.href = androidStoreLink;
        }
      }, 250);

      window.location.href = deepLink;

      // Clear timeout if the app opens successfully
      window.addEventListener("blur", () => {
        clearTimeout(fallbackTimeout);
        statusDiv.innerHTML = `<p class="status-message success">Opening ${appName}...</p>`;
      });
    }
  } else {
    // Handle desktop or other platforms
    statusDiv.innerHTML = `<p class="status-message info">This feature works on mobile devices only. Your device: ${
      navigator.userAgent.split(" ")[0]
    }</p>`;
    console.log("Not a mobile device.");
  }
}

// App configurations
const apps = {
  whatsapp: {
    deepLink: "whatsapp://",
    androidStore: "https://play.google.com/store/apps/details?id=com.whatsapp",
    iosStore: "https://apps.apple.com/app/whatsapp-messenger/id310633997",
    name: "WhatsApp",
  },
  telegram: {
    deepLink: "tg://",
    androidStore:
      "https://play.google.com/store/apps/details?id=org.telegram.messenger",
    iosStore: "https://apps.apple.com/app/telegram/id686449807",
    name: "Telegram",
  },
  instagram: {
    deepLink: "instagram://",
    androidStore:
      "https://play.google.com/store/apps/details?id=com.instagram.android",
    iosStore: "https://apps.apple.com/app/instagram/id389801252",
    name: "Instagram",
  },
};

// Set up event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // WhatsApp button
  document
    .getElementById("whatsapp-btn")
    .addEventListener("click", function () {
      openAppOrStore(
        apps.whatsapp.deepLink,
        apps.whatsapp.androidStore,
        apps.whatsapp.iosStore,
        apps.whatsapp.name
      );
    });

  // Telegram button
  document
    .getElementById("telegram-btn")
    .addEventListener("click", function () {
      openAppOrStore(
        apps.telegram.deepLink,
        apps.telegram.androidStore,
        apps.telegram.iosStore,
        apps.telegram.name
      );
    });

  // Instagram button
  document
    .getElementById("instagram-btn")
    .addEventListener("click", function () {
      openAppOrStore(
        apps.instagram.deepLink,
        apps.instagram.androidStore,
        apps.instagram.iosStore,
        apps.instagram.name
      );
    });
});
