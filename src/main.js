// Simple App Installation Checker
function checkAppInstalled(appScheme) {
  console.log("Checking app installed", appScheme);
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 3000);

    // Try to open the app
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = appScheme;
    document.body.appendChild(iframe);

    // Check if page becomes hidden (app opened)
    const checkHidden = () => {
      if (document.hidden || document.webkitHidden) {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(true);
      } else {
        setTimeout(checkHidden, 100);
      }
    };

    setTimeout(checkHidden, 500);
  });
}

// Hardcoded app schemes
const apps = {
  whatsapp: "whatsapp://",
  instagram: "instagram://",
  telegram: "tg://",
  twitter: "twitter://",
};

// Simple detection function
async function detectApp(appName) {
  const scheme = apps[appName];
  if (!scheme) return false;

  const isInstalled = await checkAppInstalled(scheme);
  console.log(`${appName}: ${isInstalled ? "Installed" : "Not installed"}`);
  return isInstalled;
}

// Simple demo interface
function initializeDemo() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="app-detector-demo">
      <h1>Simple App Detection</h1>
      <div class="app-buttons">
        <button onclick="testApp('whatsapp')">Test WhatsApp</button>
        <button onclick="testApp('instagram')">Test Instagram</button>
        <button onclick="testApp('telegram')">Test Telegram</button>
        <button onclick="testApp('twitter')">Test Twitter</button>
      </div>
      <div id="results"></div>
    </div>
  `;
}
// Global test function
window.testApp = async function (appName) {
  const result = await detectApp(appName);
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<p>${appName}: ${
    result ? "✅ Installed" : "❌ Not installed"
  }</p>`;
};

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDemo);
} else {
  initializeDemo();
}
