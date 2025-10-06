/**
 * Mobile App Detection Utilities
 * Provides functions to detect if mobile applications are installed
 */

class MobileAppDetector {
  constructor() {
    this.detectionResults = new Map();
    this.timeoutDuration = 5000; // 5 seconds timeout for detection
    this.enableLogging = true; // Enable detailed logging
  }

  /**
   * Log messages with timestamp
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {*} data - Additional data to log
   */
  log(level, message, data = null) {
    if (!this.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case "error":
        console.error(logMessage, data || "");
        break;
      case "warn":
        console.warn(logMessage, data || "");
        break;
      default:
        console.log(logMessage, data || "");
    }
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

    this.log("info", `Starting detection for ${appName}`, config);

    const deviceInfo = this.getDeviceInfo();
    this.log("info", `Device info detected`, deviceInfo);

    let detectionMethod = "";
    let isInstalled = false;
    const startTime = Date.now();

    try {
      if (deviceInfo.isIOS && iosScheme) {
        detectionMethod = "iOS URL Scheme";
        this.log(
          "info",
          `Using iOS detection method for ${appName} with scheme: ${iosScheme}`
        );
        isInstalled = await this.detectIOSApp(iosScheme);
      } else if (deviceInfo.isAndroid && (androidScheme || androidPackage)) {
        detectionMethod = "Android Intent/Scheme";
        this.log("info", `Using Android detection method for ${appName}`, {
          androidScheme,
          androidPackage,
        });
        isInstalled = await this.detectAndroidApp(
          androidScheme,
          androidPackage
        );
      } else if (deviceInfo.isMobile) {
        detectionMethod = "Generic Mobile Detection";
        const scheme = iosScheme || androidScheme;
        this.log(
          "info",
          `Using generic mobile detection for ${appName} with scheme: ${scheme}`
        );
        isInstalled = await this.detectGenericMobile(scheme);
      } else {
        detectionMethod = "Desktop/Unsupported";
        this.log(
          "info",
          `Desktop/unsupported platform detected for ${appName}`
        );
        isInstalled = false;
      }

      const detectionTime = Date.now() - startTime;
      this.log("info", `Detection completed for ${appName}`, {
        isInstalled,
        detectionMethod,
        detectionTime: `${detectionTime}ms`,
      });
    } catch (error) {
      const detectionTime = Date.now() - startTime;
      this.log("error", `App detection failed for ${appName}`, {
        error: error.message,
        detectionTime: `${detectionTime}ms`,
      });
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
    this.log("info", `Starting iOS detection with scheme: ${scheme}`);

    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const timeElapsed = Date.now() - startTime;
          this.log(
            "info",
            `iOS detection timeout reached after ${timeElapsed}ms - app likely not installed`
          );
          resolve(false);
        }
      }, this.timeoutDuration);

      // Create a hidden iframe to test the scheme
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = scheme;

      this.log("info", `Created iframe for iOS detection with src: ${scheme}`);
      document.body.appendChild(iframe);

      // Check if we're still on the page after attempting to open the scheme
      const checkInstallation = () => {
        const timeElapsed = Date.now() - startTime;
        if (timeElapsed < this.timeoutDuration && !resolved) {
          if (document.hidden || document.webkitHidden) {
            // App likely opened (page became hidden)
            resolved = true;
            const detectionTime = Date.now() - startTime;
            this.log(
              "info",
              `iOS app detected - page became hidden after ${detectionTime}ms`
            );
            clearTimeout(timeout);
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve(true);
          } else {
            setTimeout(checkInstallation, 200); // Increased check interval
          }
        }
      };

      // Start checking after a brief delay
      setTimeout(() => {
        this.log("info", `Starting iOS visibility checks`);
        checkInstallation();

        // Cleanup iframe after detection period
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            this.log("info", `Cleaning up iOS detection iframe`);
            document.body.removeChild(iframe);
          }
        }, 500); // Increased cleanup delay
      }, 300); // Increased initial delay
    });
  }

  /**
   * Detect Android app using intent or scheme
   * @param {string} scheme - Android scheme or intent URL
   * @param {string} packageName - Android package name
   * @returns {Promise<boolean>} Whether the app is installed
   */
  async detectAndroidApp(scheme, packageName) {
    this.log("info", `Starting Android detection`, { scheme, packageName });

    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const timeElapsed = Date.now() - startTime;
          this.log(
            "info",
            `Android detection timeout reached after ${timeElapsed}ms - app likely not installed`
          );
          resolve(false);
        }
      }, this.timeoutDuration);

      // Method 1: Try intent URL if package name is provided
      if (packageName) {
        const intentUrl = `intent://launch#Intent;package=${packageName};end`;
        this.log("info", `Trying Android intent URL: ${intentUrl}`);

        try {
          window.location.href = intentUrl;

          setTimeout(() => {
            if (!resolved && (document.hidden || document.webkitHidden)) {
              resolved = true;
              const detectionTime = Date.now() - startTime;
              this.log(
                "info",
                `Android app detected via intent - page became hidden after ${detectionTime}ms`
              );
              clearTimeout(timeout);
              resolve(true);
            } else if (!resolved) {
              this.log(
                "info",
                `Intent method did not trigger app launch, page still visible`
              );
            }
          }, 1500); // Increased delay for intent detection
        } catch (error) {
          this.log("warn", `Intent URL failed`, { error: error.message });
        }
      }

      // Method 2: Try custom scheme
      if (scheme && !resolved) {
        setTimeout(() => {
          if (!resolved) {
            this.log("info", `Trying Android custom scheme: ${scheme}`);
            try {
              const iframe = document.createElement("iframe");
              iframe.style.display = "none";
              iframe.src = scheme;
              document.body.appendChild(iframe);

              setTimeout(() => {
                if (!resolved && (document.hidden || document.webkitHidden)) {
                  resolved = true;
                  const detectionTime = Date.now() - startTime;
                  this.log(
                    "info",
                    `Android app detected via scheme - page became hidden after ${detectionTime}ms`
                  );
                  clearTimeout(timeout);
                  resolve(true);
                } else if (!resolved) {
                  this.log(
                    "info",
                    `Scheme method did not trigger app launch, page still visible`
                  );
                }

                if (document.body.contains(iframe)) {
                  this.log("info", `Cleaning up Android detection iframe`);
                  document.body.removeChild(iframe);
                }
              }, 1500); // Increased delay for scheme detection
            } catch (error) {
              this.log("warn", `Scheme detection failed`, {
                error: error.message,
              });
            }
          }
        }, 1000); // Increased delay before trying scheme method
      }
    });
  }

  /**
   * Generic mobile app detection fallback
   * @param {string} scheme - URL scheme to test
   * @returns {Promise<boolean>} Whether the app might be installed
   */
  async detectGenericMobile(scheme) {
    if (!scheme) {
      this.log("warn", `Generic mobile detection called without scheme`);
      return false;
    }

    this.log(
      "info",
      `Starting generic mobile detection with scheme: ${scheme}`
    );

    return new Promise((resolve) => {
      const startTime = Date.now();
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const timeElapsed = Date.now() - startTime;
          this.log(
            "info",
            `Generic mobile detection timeout reached after ${timeElapsed}ms - app likely not installed`
          );
          resolve(false);
        }
      }, this.timeoutDuration);

      try {
        // Try to open the scheme
        const link = document.createElement("a");
        link.href = scheme;
        link.style.display = "none";
        document.body.appendChild(link);

        this.log(
          "info",
          `Created link element for generic detection, clicking...`
        );
        link.click();
        document.body.removeChild(link);

        // Check if page becomes hidden (app opened)
        const checkVisibility = () => {
          const timeElapsed = Date.now() - startTime;
          if (!resolved) {
            if (document.hidden || document.webkitHidden) {
              resolved = true;
              this.log(
                "info",
                `Generic mobile app detected - page became hidden after ${timeElapsed}ms`
              );
              clearTimeout(timeout);
              resolve(true);
            } else if (timeElapsed < this.timeoutDuration) {
              setTimeout(checkVisibility, 200); // Increased check interval
            }
          }
        };

        setTimeout(() => {
          this.log("info", `Starting generic mobile visibility checks`);
          checkVisibility();
        }, 800); // Increased initial delay
      } catch (error) {
        resolved = true;
        this.log("error", `Generic mobile detection failed`, {
          error: error.message,
        });
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
    this.log("info", "Clearing all detection results");
    this.detectionResults.clear();
  }

  /**
   * Enable or disable logging
   * @param {boolean} enabled - Whether to enable logging
   */
  setLogging(enabled) {
    this.enableLogging = enabled;
    this.log("info", `Logging ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return {
      timeoutDuration: this.timeoutDuration,
      enableLogging: this.enableLogging,
      resultsCacheSize: this.detectionResults.size,
    };
  }

  /**
   * Batch detect multiple apps
   * @param {Array} appConfigs - Array of app configuration objects
   * @returns {Promise<Array>} Array of detection results
   */
  async detectMultipleApps(appConfigs) {
    this.log("info", `Starting batch detection for ${appConfigs.length} apps`);

    const results = [];
    for (let i = 0; i < appConfigs.length; i++) {
      const config = appConfigs[i];
      this.log(
        "info",
        `Processing app ${i + 1}/${appConfigs.length}: ${config.appName}`
      );

      const result = await this.detectApp(config);
      results.push(result);

      // Increased delay between detections to avoid conflicts
      if (i < appConfigs.length - 1) {
        this.log("info", `Waiting 1 second before next detection...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    this.log("info", `Batch detection completed`, {
      totalApps: appConfigs.length,
      installedApps: results.filter((r) => r.isInstalled).length,
    });

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
    appDetector.log("error", `App ${appName} not found in demo apps`);
    return null;
  }

  appDetector.log("info", `=== Starting demo test for ${appName} ===`);
  const result = await appDetector.detectApp(app);
  appDetector.log("info", `=== Demo test completed for ${appName} ===`, result);

  return result;
}

/**
 * Test all demo apps
 */
async function testAllApps() {
  appDetector.log("info", "=== Starting demo test for ALL apps ===");
  const results = await appDetector.detectMultipleApps(demoApps);
  appDetector.log("info", "=== Demo test completed for ALL apps ===", {
    totalTested: results.length,
    installed: results.filter((r) => r.isInstalled).map((r) => r.appName),
    notInstalled: results.filter((r) => !r.isInstalled).map((r) => r.appName),
  });
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
          <div class="config-info">
            <p><strong>Timeout:</strong> ${appDetector.timeoutDuration}ms</p>
            <p><strong>Logging:</strong> <span id="loggingStatus">${
              appDetector.enableLogging ? "Enabled" : "Disabled"
            }</span></p>
            <button onclick="toggleLogging()" class="toggle-logging-btn" id="toggleLoggingBtn">
              ${appDetector.enableLogging ? "Disable" : "Enable"} Logging
            </button>
          </div>
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

// Demo interface functions - make them globally accessible
window.testSingleApp = async function testSingleApp(appName) {
  const result = await testAppDetection(appName);
  updateResults();
};

window.testAllAppsDemo = async function testAllAppsDemo() {
  await testAllApps();
  updateResults();
};

window.clearResults = function clearResults() {
  appDetector.clearResults();
  updateResults();
};

window.toggleLogging = function toggleLogging() {
  const newState = !appDetector.enableLogging;
  appDetector.setLogging(newState);

  // Update UI
  const statusSpan = document.getElementById("loggingStatus");
  const toggleBtn = document.getElementById("toggleLoggingBtn");

  if (statusSpan) {
    statusSpan.textContent = newState ? "Enabled" : "Disabled";
  }

  if (toggleBtn) {
    toggleBtn.textContent = newState ? "Disable Logging" : "Enable Logging";
  }
};

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
