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

// Function to get user's IP address and location
async function getUserIP() {
  try {
    // Try multiple IP detection services for reliability
    const services = [
      "https://api.ipify.org?format=json",
      "https://ipapi.co/json/",
      "https://ipinfo.io/json",
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();

        if (data.ip) {
          return {
            ip: data.ip,
            country: data.country || data.country_name || "Unknown",
            city: data.city || "Unknown",
            region: data.region || data.region_name || "Unknown",
            timezone: data.timezone || "Unknown",
            isp: data.org || data.isp || "Unknown",
            service: service,
          };
        }
      } catch (error) {
        console.warn(`Failed to get IP from ${service}:`, error);
        continue;
      }
    }

    return {
      ip: "Unable to detect",
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
      timezone: "Unknown",
      isp: "Unknown",
      service: "None available",
    };
  } catch (error) {
    console.error("Error getting IP information:", error);
    return {
      ip: "Error occurred",
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
      timezone: "Unknown",
      isp: "Unknown",
      service: "Error",
    };
  }
}

// Function to get additional device and browser information
function getAdditionalDeviceInfo() {
  const nav = navigator;
  const screen = window.screen;

  // Get browser information
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  // Check for Edge first (as it may contain Chrome in user agent)
  if (nav.userAgent.indexOf("Edg/") > -1) {
    browserName = "Edge";
    const match = nav.userAgent.match(/Edg\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (nav.userAgent.indexOf("Edge/") > -1) {
    browserName = "Edge Legacy";
    const match = nav.userAgent.match(/Edge\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }
  // Check for Chrome (but not if it's Edge)
  else if (
    nav.userAgent.indexOf("Chrome") > -1 &&
    nav.userAgent.indexOf("Edg") === -1
  ) {
    browserName = "Chrome";
    const match = nav.userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }
  // Check for Firefox
  else if (nav.userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    const match = nav.userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }
  // Check for Safari (but not if it contains Chrome, as Chrome also has Safari in user agent)
  else if (
    nav.userAgent.indexOf("Safari") > -1 &&
    nav.userAgent.indexOf("Chrome") === -1
  ) {
    browserName = "Safari";
    const match = nav.userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  return {
    // Browser info
    browserName,
    browserVersion,
    language: nav.language || nav.userLanguage || "Unknown",
    languages: nav.languages ? nav.languages.join(", ") : "Unknown",

    // Screen info
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    screenPixelDepth: screen.pixelDepth,

    // Window info
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,

    // Device info
    platform: nav.platform || "Unknown",
    cookieEnabled: nav.cookieEnabled,
    onlineStatus: nav.onLine,

    // Hardware info (if available)
    hardwareConcurrency: nav.hardwareConcurrency || "Unknown",
    maxTouchPoints: nav.maxTouchPoints || 0,

    // Time zone
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",

    // Connection info (if available)
    connectionType: nav.connection ? nav.connection.effectiveType : "Unknown",
    connectionDownlink: nav.connection ? nav.connection.downlink : "Unknown",
  };
}

// Function to get detailed device information
async function getDeviceInfo() {
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

  // Get IP and location information
  const ipInfo = await getUserIP();

  // Get additional device information
  const additionalInfo = getAdditionalDeviceInfo();

  return {
    // Basic OS info
    operatingSystem: os,
    version: osVersion,
    userAgent: userAgent,
    isMobile: os !== "Not a mobile device",
    timestamp: new Date().toISOString(),

    // IP and location info
    ipAddress: ipInfo.ip,
    country: ipInfo.country,
    city: ipInfo.city,
    region: ipInfo.region,
    timezone: ipInfo.timezone,
    isp: ipInfo.isp,

    // Browser and device info
    ...additionalInfo,
  };
}

// Log the phone OS information
async function logPhoneOS() {
  // Show loading state
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1>Device & Network Detection</h1>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center;">
          <p>🔍 Detecting device information and IP address...</p>
        </div>
      </div>
    `;
  }

  try {
    const deviceInfo = await getDeviceInfo();

    console.log("=== Complete Device & Network Detection ===");
    console.log("Operating System:", deviceInfo.operatingSystem);
    console.log("OS Version:", deviceInfo.version);
    console.log("Is Mobile Device:", deviceInfo.isMobile);
    console.log("IP Address:", deviceInfo.ipAddress);
    console.log(
      "Location:",
      `${deviceInfo.city}, ${deviceInfo.region}, ${deviceInfo.country}`
    );
    console.log("ISP:", deviceInfo.isp);
    console.log(
      "Browser:",
      `${deviceInfo.browserName} ${deviceInfo.browserVersion}`
    );
    console.log(
      "Screen Resolution:",
      `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`
    );
    console.log("Language:", deviceInfo.language);
    console.log("Time Zone:", deviceInfo.timeZone);
    console.log("Platform:", deviceInfo.platform);
    console.log("Connection Type:", deviceInfo.connectionType);
    console.log("Timestamp:", deviceInfo.timestamp);
    console.log("Full User Agent:", deviceInfo.userAgent);
    console.log("==========================================");

    // Display comprehensive information on the page
    if (app) {
      app.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
          <h1>📱 Device & Network Detection</h1>
          
          <!-- Basic Device Info -->
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>📱 Device Information</h3>
            <p><strong>Operating System:</strong> ${
              deviceInfo.operatingSystem
            }</p>
            <p><strong>OS Version:</strong> ${deviceInfo.version}</p>
            <p><strong>Is Mobile Device:</strong> ${
              deviceInfo.isMobile ? "Yes" : "No"
            }</p>
            <p><strong>Platform:</strong> ${deviceInfo.platform}</p>
            <p><strong>Touch Points:</strong> ${deviceInfo.maxTouchPoints}</p>
            <p><strong>CPU Cores:</strong> ${deviceInfo.hardwareConcurrency}</p>
          </div>

          <!-- Network & Location Info -->
          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>🌐 Network & Location</h3>
            <p><strong>IP Address:</strong> ${deviceInfo.ipAddress}</p>
            <p><strong>Country:</strong> ${deviceInfo.country}</p>
            <p><strong>City:</strong> ${deviceInfo.city}</p>
            <p><strong>Region:</strong> ${deviceInfo.region}</p>
            <p><strong>ISP:</strong> ${deviceInfo.isp}</p>
            <p><strong>Connection Type:</strong> ${
              deviceInfo.connectionType
            }</p>
            <p><strong>Connection Speed:</strong> ${
              deviceInfo.connectionDownlink
            } Mbps</p>
            <p><strong>Online Status:</strong> ${
              deviceInfo.onlineStatus ? "Online" : "Offline"
            }</p>
          </div>

          <!-- Browser Info -->
          <div style="background: #fff2e6; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>🌐 Browser Information</h3>
            <p><strong>Browser:</strong> ${deviceInfo.browserName} ${
        deviceInfo.browserVersion
      }</p>
            <p><strong>Language:</strong> ${deviceInfo.language}</p>
            <p><strong>Supported Languages:</strong> ${deviceInfo.languages}</p>
            <p><strong>Cookies Enabled:</strong> ${
              deviceInfo.cookieEnabled ? "Yes" : "No"
            }</p>
          </div>

          <!-- Screen & Display Info -->
          <div style="background: #f0f8f0; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>🖥️ Screen & Display</h3>
            <p><strong>Screen Resolution:</strong> ${
              deviceInfo.screenWidth
            } × ${deviceInfo.screenHeight}</p>
            <p><strong>Window Size:</strong> ${deviceInfo.windowWidth} × ${
        deviceInfo.windowHeight
      }</p>
            <p><strong>Color Depth:</strong> ${
              deviceInfo.screenColorDepth
            } bits</p>
            <p><strong>Pixel Depth:</strong> ${
              deviceInfo.screenPixelDepth
            } bits</p>
          </div>

          <!-- Time & Location Info -->
          <div style="background: #fef7ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>🕒 Time & Location</h3>
            <p><strong>Time Zone:</strong> ${deviceInfo.timeZone}</p>
            <p><strong>Detected Time Zone:</strong> ${deviceInfo.timezone}</p>
            <p><strong>Detection Time:</strong> ${new Date(
              deviceInfo.timestamp
            ).toLocaleString()}</p>
          </div>

          <!-- Technical Details -->
          <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>🔧 Technical Details</h3>
            <p><strong>User Agent:</strong></p>
            <code style="word-break: break-all; font-size: 11px; background: white; padding: 10px; border-radius: 4px; display: block; margin: 10px 0;">${
              deviceInfo.userAgent
            }</code>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <button onclick="logPhoneOS()" style="background: #007cba; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-right: 10px;">
              🔄 Refresh Detection
            </button>
            <button onclick="copyToClipboard()" style="background: #28a745; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-right: 10px;">
              📋 Copy Data
            </button>
            <button onclick="clearCache()" style="background: #dc3545; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px;">
              🗑️ Clear Cache & Reload
            </button>
          </div>
        </div>
      `;
    }

    return deviceInfo;
  } catch (error) {
    console.error("Error during device detection:", error);

    if (app) {
      app.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
          <h1>Device & Network Detection</h1>
          <div style="background: #ffe6e6; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3>❌ Error</h3>
            <p>Failed to detect device information: ${error.message}</p>
            <button onclick="logPhoneOS()" style="background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
              Try Again
            </button>
          </div>
        </div>
      `;
    }

    return null;
  }
}

// Function to clear cache and force fresh detection
function clearCache() {
  // Clear any stored data
  if (typeof Storage !== "undefined") {
    localStorage.removeItem("deviceInfo");
    sessionStorage.removeItem("deviceInfo");
  }

  // Force reload without cache
  location.reload(true);
}

// Function to copy device information to clipboard
async function copyToClipboard() {
  try {
    const deviceInfo = await getDeviceInfo();

    const dataText = `
=== Device & Network Detection Report ===
Generated: ${new Date().toLocaleString()}

📱 DEVICE INFORMATION:
Operating System: ${deviceInfo.operatingSystem}
OS Version: ${deviceInfo.version}
Is Mobile Device: ${deviceInfo.isMobile ? "Yes" : "No"}
Platform: ${deviceInfo.platform}
Touch Points: ${deviceInfo.maxTouchPoints}
CPU Cores: ${deviceInfo.hardwareConcurrency}

🌐 NETWORK & LOCATION:
IP Address: ${deviceInfo.ipAddress}
Country: ${deviceInfo.country}
City: ${deviceInfo.city}
Region: ${deviceInfo.region}
ISP: ${deviceInfo.isp}
Connection Type: ${deviceInfo.connectionType}
Connection Speed: ${deviceInfo.connectionDownlink} Mbps
Online Status: ${deviceInfo.onlineStatus ? "Online" : "Offline"}

🌐 BROWSER INFORMATION:
Browser: ${deviceInfo.browserName} ${deviceInfo.browserVersion}
Language: ${deviceInfo.language}
Supported Languages: ${deviceInfo.languages}
Cookies Enabled: ${deviceInfo.cookieEnabled ? "Yes" : "No"}

🖥️ SCREEN & DISPLAY:
Screen Resolution: ${deviceInfo.screenWidth} × ${deviceInfo.screenHeight}
Window Size: ${deviceInfo.windowWidth} × ${deviceInfo.windowHeight}
Color Depth: ${deviceInfo.screenColorDepth} bits
Pixel Depth: ${deviceInfo.screenPixelDepth} bits

🕒 TIME & LOCATION:
Time Zone: ${deviceInfo.timeZone}
Detected Time Zone: ${deviceInfo.timezone}

🔧 TECHNICAL DETAILS:
User Agent: ${deviceInfo.userAgent}

========================================
    `.trim();

    await navigator.clipboard.writeText(dataText);

    // Show success message
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = "✅ Copied!";
    button.style.background = "#28a745";

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = "#28a745";
    }, 2000);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    alert(
      "Failed to copy data to clipboard. Please check the console for the full report."
    );
  }
}

// Make functions globally available
window.logPhoneOS = logPhoneOS;
window.detectPhoneOS = detectPhoneOS;
window.getDeviceInfo = getDeviceInfo;
window.copyToClipboard = copyToClipboard;
window.clearCache = clearCache;

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
