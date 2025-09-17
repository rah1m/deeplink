// Device detection and redirect logic for deep linking
function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "ios";
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return "android";
  }

  return "other";
}

function getPathname() {
  // Get the current pathname, removing the leading slash
  const pathname = window.location.pathname.slice(1);
  return pathname || "";
}

function redirectBasedOnDevice() {
  const device = detectDevice();
  const pathname = getPathname();
  const MY_LINK = "https://your-domain.com"; // Replace with your actual domain

  console.log(`Detected device: ${device}, pathname: ${pathname}`);

  switch (device) {
    case "ios":
      // Redirect to iOS deep link path
      const iosUrl = `${MY_LINK}/.well-known/assetlinks.json/${pathname}`;
      console.log(`Redirecting iOS to: ${iosUrl}`);
      window.location.href = iosUrl;
      break;

    case "android":
      // Redirect to Android deep link path
      const androidUrl = `${MY_LINK}/.pathfor-android/${pathname}`;
      console.log(`Redirecting Android to: ${androidUrl}`);
      window.location.href = androidUrl;
      break;

    default:
      // Handle non-mobile devices or unknown devices
      console.log("Non-mobile device detected, staying on current page");
      document.getElementById("app").innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
          <h2>Deep Link Handler</h2>
          <p>This page handles deep links for mobile devices.</p>
          <p>Device: ${device}</p>
          <p>Pathname: ${pathname}</p>
          <p>Please visit this link on a mobile device to be redirected appropriately.</p>
        </div>
      `;
      break;
  }
}

// Run the redirect logic when the page loads
document.addEventListener("DOMContentLoaded", redirectBasedOnDevice);

// Also run immediately in case DOMContentLoaded has already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", redirectBasedOnDevice);
} else {
  redirectBasedOnDevice();
}
