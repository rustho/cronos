const cron = require("node-cron");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Function to log to file
function logToFile(message) {
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `health-check-${date}.log`);
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

// List of APIs to monitor
const apis = [
  {
    name: "witchhuntserver",
    url: "https://witchhuntserver.onrender.com/health",
  },
];

async function checkApiHealth(api) {
  try {
    const response = await axios.get(api.url, {
      timeout: 5000, // 5 seconds timeout
    });

    if (response.status === 200) {
      logToFile(`${api.name} is healthy`);
    } else {
      logToFile(`${api.name} returned status ${response.status}`);
    }
  } catch (error) {
    logToFile(`${api.name} health check failed: ${error.message}`);
  }
}

async function performHealthChecks() {
  logToFile("Starting health checks...");

  for (const api of apis) {
    await checkApiHealth(api);
  }
}

// Run health checks every evening at 8 PM Bali time (UTC+8)
cron.schedule("0 20 * * *", () => {
  performHealthChecks();
}, {
  timezone: "Asia/Makassar"
});

// Initial health check when starting the application
performHealthChecks();

logToFile("Health checker started. Monitoring APIs every evening at 8 PM Bali time (UTC+8).");
