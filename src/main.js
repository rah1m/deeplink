/**
 * Mobile App Detection Utilities
 * Provides functions to detect if mobile applications are installed
 */

class MobileAppDetector {
  constructor() {
    this.detectionResults = new Map();
    this.timeoutDuration = 2500; // 2.5 seconds timeout for detection
  }

  /**
   * Main function to detect if a mobile app is installed
   * @param {Object} config - Configuration object
   * @param {string} config.appName - Name of the app for identification
   * @param {string} config.iosScheme - iOS URL scheme (e.g., 'myapp://')
   * @param {string} config.androidScheme - Android URL scheme or intent
   * @param {string} config.androidPackage - Android package name
   * @param {string} config.fallbackUrl - Fallback URL if app is not installed
   * @returns {Promise<Object>} Detection result
   */
  async detectApp(config) {
    const { appName, iosScheme, androidScheme, androidPackage, fallbackUrl } =
      config;

    const deviceInfo = this.getDeviceInfo();
    let detectionMethod = "";
    let isInstalled = false;

    try {
      if (deviceInfo.isIOS && iosScheme) {
        detectionMethod = "iOS URL Scheme";
        isInstalled = await this.detectIOSApp(iosScheme);
      } else if (deviceInfo.isAndroid && (androidScheme || androidPackage)) {
        detectionMethod = "Android Intent/Scheme";
        isInstalled = await this.detectAndroidApp(
          androidScheme,
          androidPackage
        );
      } else if (deviceInfo.isMobile) {
        detectionMethod = "Generic Mobile Detection";
        isInstalled = await this.detectGenericMobile(
          iosScheme || androidScheme
        );
      } else {
        detectionMethod = "Desktop/Unsupported";
        isInstalled = false;
      }
    } catch (error) {
      console.warn(`App detection failed for ${appName}:`, error);
      isInstalled = false;
    }

    const result = {
      appName,
      isInstalled,
      detectionMethod,
      deviceInfo,
      timestamp: new Date().toISOString(),
      fallbackUrl,
    };

    this.detectionResults.set(appName, result);
    return result;
  }

  /**
   * Detect iOS app using URL scheme
   * @param {string} scheme - iOS URL scheme
   * @returns {Promise<boolean>} Whether the app is installed
   */
  async detectIOSApp(scheme) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        resolve(false);
      }, this.timeoutDuration);

      // Create a hidden iframe to test the scheme
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = scheme;

      document.body.appendChild(iframe);

      // Check if we're still on the page after attempting to open the scheme
      const checkInstallation = () => {
        const timeElapsed = Date.now() - startTime;
        if (timeElapsed < this.timeoutDuration) {
          if (document.hidden || document.webkitHidden) {
            // App likely opened (page became hidden)
            clearTimeout(timeout);
            document.body.removeChild(iframe);
            resolve(true);
          } else {
            setTimeout(checkInstallation, 100);
          }
        }
      };

      setTimeout(() => {
        checkInstallation();
        // Cleanup
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 100);
      }, 100);
    });
  }

  /**
   * Detect Android app using intent or scheme
   * @param {string} scheme - Android scheme or intent URL
   * @param {string} packageName - Android package name
   * @returns {Promise<boolean>} Whether the app is installed
   */
  async detectAndroidApp(scheme, packageName) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, this.timeoutDuration);

      // Method 1: Try intent URL if package name is provided
      if (packageName) {
        const intentUrl = `intent://launch#Intent;package=${packageName};end`;
        try {
          window.location.href = intentUrl;

          setTimeout(() => {
            if (!resolved && (document.hidden || document.webkitHidden)) {
              resolved = true;
              clearTimeout(timeout);
              resolve(true);
            }
          }, 1000);
        } catch (error) {
          console.warn("Intent URL failed:", error);
        }
      }

      // Method 2: Try custom scheme
      if (scheme && !resolved) {
        setTimeout(() => {
          if (!resolved) {
            try {
              const iframe = document.createElement("iframe");
              iframe.style.display = "none";
              iframe.src = scheme;
              document.body.appendChild(iframe);

              setTimeout(() => {
                if (!resolved && (document.hidden || document.webkitHidden)) {
                  resolved = true;
                  clearTimeout(timeout);
                  resolve(true);
                }
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 1000);
            } catch (error) {
              console.warn("Scheme detection failed:", error);
            }
          }
        }, 500);
      }
    });
  }

  /**
   * Generic mobile app detection fallback
   * @param {string} scheme - URL scheme to test
   * @returns {Promise<boolean>} Whether the app might be installed
   */
  async detectGenericMobile(scheme) {
    if (!scheme) return false;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => resolve(false), this.timeoutDuration);

      try {
        // Try to open the scheme
        const link = document.createElement("a");
        link.href = scheme;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Check if page becomes hidden (app opened)
        const checkVisibility = () => {
          if (document.hidden || document.webkitHidden) {
            clearTimeout(timeout);
            resolve(true);
          } else if (Date.now() - startTime < this.timeoutDuration) {
            setTimeout(checkVisibility, 100);
          }
        };

        setTimeout(checkVisibility, 500);
      } catch (error) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  /**
   * Get device information
   * @returns {Object} Device information
   */
  getDeviceInfo() {
    const userAgent = navigator.userAgent.toLowerCase();

    return {
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent),
      isMobile:
        /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
          userAgent
        ),
      isTablet: /ipad|android(?!.*mobile)/.test(userAgent),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor || "unknown",
    };
  }

  /**
   * Get all detection results
   * @returns {Map} All detection results
   */
  getDetectionResults() {
    return this.detectionResults;
  }

  /**
   * Clear detection results
   */
  clearResults() {
    this.detectionResults.clear();
  }

  /**
   * Batch detect multiple apps
   * @param {Array} appConfigs - Array of app configuration objects
   * @returns {Promise<Array>} Array of detection results
   */
  async detectMultipleApps(appConfigs) {
    const results = [];
    for (const config of appConfigs) {
      const result = await this.detectApp(config);
      results.push(result);
      // Small delay between detections to avoid conflicts
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return results;
  }
}

// Create global instance
const appDetector = new MobileAppDetector();

// Example usage and demo functions
const demoApps = [
  {
    appName: "WhatsApp",
    iosScheme: "whatsapp://",
    androidScheme: "whatsapp://send",
    androidPackage: "com.whatsapp",
    fallbackUrl: "https://web.whatsapp.com",
  },
  {
    appName: "Instagram",
    iosScheme: "instagram://",
    androidScheme: "instagram://user",
    androidPackage: "com.instagram.android",
    fallbackUrl: "https://instagram.com",
  },
  {
    appName: "Twitter/X",
    iosScheme: "twitter://",
    androidScheme: "twitter://user",
    androidPackage: "com.twitter.android",
    fallbackUrl: "https://twitter.com",
  },
  {
    appName: "Telegram",
    iosScheme: "tg://",
    androidScheme: "tg://resolve",
    androidPackage: "org.telegram.messenger",
    fallbackUrl: "https://web.telegram.org",
  },
];

/**
 * Demo function to test app detection
 */
async function testAppDetection(appName) {
  const app = demoApps.find((a) => a.appName === appName);
  if (!app) {
    console.error(`App ${appName} not found in demo apps`);
    return null;
  }

  console.log(`Testing ${appName} detection...`);
  const result = await appDetector.detectApp(app);
  console.log(`${appName} detection result:`, result);

  return result;
}

/**
 * Test all demo apps
 */
async function testAllApps() {
  console.log("Testing all demo apps...");
  const results = await appDetector.detectMultipleApps(demoApps);
  console.log("All detection results:", results);
  return results;
}

// Initialize demo interface
function initializeDemo() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="app-detector-demo">
      <h1>Mobile App Detection Demo</h1>
      
      <div class="device-info">
        <h2>Device Information</h2>
        <div id="deviceInfo"></div>
      </div>

      <div class="detection-controls">
        <h2>Test App Detection</h2>
        <div class="app-buttons">
          ${demoApps
            .map(
              (app) => `
            <button onclick="testSingleApp('${app.appName}')" class="app-btn">
              Test ${app.appName}
            </button>
          `
            )
            .join("")}
        </div>
        <button onclick="testAllAppsDemo()" class="test-all-btn">Test All Apps</button>
        <button onclick="clearResults()" class="clear-btn">Clear Results</button>
      </div>

      <div class="results">
        <h2>Detection Results</h2>
        <div id="results"></div>
      </div>
    </div>
  `;

  // Display device info
  const deviceInfo = appDetector.getDeviceInfo();
  document.getElementById("deviceInfo").innerHTML = `
    <p><strong>Platform:</strong> ${deviceInfo.platform}</p>
    <p><strong>Is Mobile:</strong> ${deviceInfo.isMobile ? "Yes" : "No"}</p>
    <p><strong>Is iOS:</strong> ${deviceInfo.isIOS ? "Yes" : "No"}</p>
    <p><strong>Is Android:</strong> ${deviceInfo.isAndroid ? "Yes" : "No"}</p>
    <p><strong>Is Tablet:</strong> ${deviceInfo.isTablet ? "Yes" : "No"}</p>
    <p><strong>User Agent:</strong> ${deviceInfo.userAgent}</p>
  `;
}

// Demo interface functions
async function testSingleApp(appName) {
  const result = await testAppDetection(appName);
  updateResults();
}

async function testAllAppsDemo() {
  await testAllApps();
  updateResults();
}

function clearResults() {
  appDetector.clearResults();
  updateResults();
}

function updateResults() {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  const results = Array.from(appDetector.getDetectionResults().values());

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No detection results yet. Test some apps!</p>";
    return;
  }

  resultsDiv.innerHTML = results
    .map(
      (result) => `
    <div class="result-item ${
      result.isInstalled ? "installed" : "not-installed"
    }">
      <h3>${result.appName}</h3>
      <p><strong>Status:</strong> ${
        result.isInstalled ? "✅ Installed" : "❌ Not Installed"
      }</p>
      <p><strong>Detection Method:</strong> ${result.detectionMethod}</p>
      <p><strong>Timestamp:</strong> ${new Date(
        result.timestamp
      ).toLocaleString()}</p>
      ${
        result.fallbackUrl
          ? `<p><strong>Fallback:</strong> <a href="${result.fallbackUrl}" target="_blank">${result.fallbackUrl}</a></p>`
          : ""
      }
    </div>
  `
    )
    .join("");
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeDemo);
} else {
  initializeDemo();
}

// Export for use in other modules
export { MobileAppDetector, appDetector, testAppDetection, testAllApps };
