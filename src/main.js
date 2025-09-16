// Function to detect user's phone operating system
function detectPhoneOS() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for iOS devices
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  // Check for Android devices
  if (/android/i.test(userAgent)) {
    return "Android";
  }

  // Check for Windows Phone
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }

  // Check for BlackBerry
  if (/blackberry/i.test(userAgent)) {
    return "BlackBerry";
  }

  // Check for other mobile devices
  if (/mobile/i.test(userAgent)) {
    return "Unknown Mobile OS";
  }

  // Not a mobile device
  return "Not a mobile device";
}

// Function to get detailed device information
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const os = detectPhoneOS();

  let osVersion = "Unknown";

  // Extract OS version for iOS
  if (os === "iOS") {
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      osVersion = match[1] + "." + match[2] + (match[3] ? "." + match[3] : "");
    }
  }

  // Extract OS version for Android
  if (os === "Android") {
    const match = userAgent.match(/Android (\d+\.?\d*\.?\d*)/);
    if (match) {
      osVersion = match[1];
    }
  }

  return {
    operatingSystem: os,
    version: osVersion,
    userAgent: userAgent,
    isMobile: os !== "Not a mobile device",
    timestamp: new Date().toISOString(),
  };
}

// Log the phone OS information
function logPhoneOS() {
  const deviceInfo = getDeviceInfo();

  console.log("=== Phone OS Detection ===");
  console.log("Operating System:", deviceInfo.operatingSystem);
  console.log("OS Version:", deviceInfo.version);
  console.log("Is Mobile Device:", deviceInfo.isMobile);
  console.log("Timestamp:", deviceInfo.timestamp);
  console.log("Full User Agent:", deviceInfo.userAgent);
  console.log("========================");

  // Also display on the page
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1>Phone OS Detection</h1>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <h3>Device Information:</h3>
          <p><strong>Operating System:</strong> ${
            deviceInfo.operatingSystem
          }</p>
          <p><strong>OS Version:</strong> ${deviceInfo.version}</p>
          <p><strong>Is Mobile Device:</strong> ${
            deviceInfo.isMobile ? "Yes" : "No"
          }</p>
          <p><strong>Detection Time:</strong> ${new Date(
            deviceInfo.timestamp
          ).toLocaleString()}</p>
        </div>
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <h3>Technical Details:</h3>
          <p><strong>User Agent:</strong></p>
          <code style="word-break: break-all; font-size: 12px;">${
            deviceInfo.userAgent
          }</code>
        </div>
        <button onclick="logPhoneOS()" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
          Refresh Detection
        </button>
      </div>
    `;
  }

  return deviceInfo;
}

// Make functions globally available
window.logPhoneOS = logPhoneOS;
window.detectPhoneOS = detectPhoneOS;
window.getDeviceInfo = getDeviceInfo;

// Run the detection when the page loads
document.addEventListener("DOMContentLoaded", () => {
  logPhoneOS();
});

// Also run immediately if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", logPhoneOS);
} else {
  logPhoneOS();
}
