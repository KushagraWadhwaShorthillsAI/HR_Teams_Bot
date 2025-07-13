const { getGraphToken } = require("./utils/graphToken");

getGraphToken()
  .then(token => {
    console.log("✅ Graph Token:", token);
  })
  .catch(err => {
    console.error("❌ Token fetch failed:", err.message);
  });
