const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_NEXT_GAME") {
            console.log("Received GET_NEXT_GAME notification with payload:", payload);
            this.getNextGame(payload);
        }
    },

    getNextGame: async function(payload) {
        const { url, instanceId } = payload;
        try {
            console.log("Fetching data from URL:", url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log("Fetched data:", result);
            this.sendSocketNotification("NEXT_GAME_RESULT", { data: result, instanceId: instanceId });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
});
