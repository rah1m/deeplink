function tryOpenApp(scheme, { timeout = 1500, openMethod = "href" } = {}) {
  return new Promise((resolve) => {
    let done = false;

    const finish = (value) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(value);
    };

    const onHide = () => finish(true); // likely switched to the app
    const onBlur = () => {
      // Some browsers fire blur instead of visibilitychange
      if (document.visibilityState === "hidden") finish(true);
    };

    const cleanup = () => {
      document.removeEventListener("visibilitychange", onHide, true);
      window.removeEventListener("pagehide", onHide, true);
      window.removeEventListener("blur", onBlur, true);
      clearTimeout(t);
    };

    document.addEventListener("visibilitychange", onHide, true);
    window.addEventListener("pagehide", onHide, true);
    window.addEventListener("blur", onBlur, true);

    const t = setTimeout(() => finish(false), timeout);

    // Attempt launch
    if (openMethod === "iframe") {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = scheme;
      document.body.appendChild(iframe);
      // Remove after a bit to avoid leaks
      setTimeout(() => iframe.remove(), timeout + 500);
    } else {
      // Safer across iOS/Android
      window.location.href = scheme;
    }
  });
}

// Example usage with fallback to store if not installed
async function openOrStore() {
  const installed = await tryOpenApp("whatsapp://", { timeout: 1600 });
  if (!installed) {
    // Android Play Store
    // location.href = 'https://play.google.com/store/apps/details?id=com.whatsapp';
    // iOS App Store
    location.href = "https://apps.apple.com/app/whatsapp-messenger/id310633997";
  }
}
if (navigator.getInstalledRelatedApps) {
  const apps = await navigator.getInstalledRelatedApps(); // only your related PWAs
  console.log(apps);
}
