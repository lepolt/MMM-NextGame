/* Magic Mirror
 * Module: MMM-NextGame
 *
 * By Your Name
 * MIT Licensed.
 */

Module.register("MMM-NextGame", {
    defaults: {
        // teamId: "18267",
        // team: "Los Angeles FC", // Default team ID
        updateInterval: 60 * 60 * 1000, // Update every hour
        apiEndpoint: 'http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams/18267',
        sportImageHref: null
        // apiEndpoint: "https://api.example.com/nextmlsgame", // Hypothetical API endpoint
        // http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams/18267
        // apiKey: "YOUR_API_KEY" // API Key for authentication
    },

    start: function() {
        this.nextGame = null;
        this.instanceId = this.identifier;
        this.getNextGame();
        this.scheduleUpdate();
    },

    getStyles: function() {
        return ["MMM-NextGame.css"];
    },

    getNextGame: function() {
        // var url = `${this.config.apiEndpoint}/${encodeURIComponent(this.config.teamId)}`;
        console.log(`this.config.apiEndpoint: ${this.config.apiEndpoint}`);
        this.sendSocketNotification("GET_NEXT_GAME", {
            url: this.config.apiEndpoint,
            instanceId: this.instanceId
        });
        // this.sendSocketNotification("GET_NEXT_GAME", url);
    },

    scheduleUpdate: function() {
        var self = this;
        setInterval(function() {
            self.getNextGame();
        }, this.config.updateInterval);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEXT_GAME_RESULT" && payload.instanceId === this.instanceId) {
            const teamName = payload.data.team.displayName;
            const nextEvents = payload.data.team.nextEvent;

            const logos = payload.data.team.logos.filter((logo) => logo.rel.includes('dark'));
            if (logos.length > 0) {
              logoHref = logos[0].href;
            }
        

            if (nextEvents.length > 0) {
                const nextEvent = nextEvents[0];
                const competition = nextEvent.competitions && nextEvent.competitions[0];
                const competitors = competition ? competition.competitors : [];

                this.nextGame = {
                    teamName: teamName,
                    date: nextEvent.date,
                    name: nextEvent.name,
                    logo: logoHref,
                    competitors: competitors
                }

                this.updateDom();
            }                
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");

        if (!this.nextGame) {
            wrapper.innerHTML = "Loading next game...";
            return wrapper;
        }

        var gameInfo = document.createElement("div");
        gameInfo.className = "game-info";

        const gameDate = new Date(this.nextGame.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const gameDateOnly = new Date(gameDate);
        gameDateOnly.setHours(0, 0, 0, 0);
        const diffDays = Math.round((gameDateOnly - today) / (1000 * 60 * 60 * 24));

        var isPastGame = diffDays <= -1;

        var dateString;
        if (isPastGame) {
            dateString = "Last Game";
        } else if (diffDays === 0) {
            dateString = "Today";
        } else if (diffDays === 1) {
            dateString = "Tomorrow";
        } else {
            dateString = gameDate.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
        }
        const timeString = gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        if (this.nextGame.logo) {
            gameInfo.innerHTML = `<img src="${this.nextGame.logo}">`
        }

        var sportImageHtml = ''
        if (this.config.sportImageHref) {
            sportImageHtml = `<img class="game-sport-image" src="${this.config.sportImageHref}">`
        }

        var scoreHtml = '';
        if (isPastGame && this.nextGame.competitors && this.nextGame.competitors.length === 2) {
            var home = this.nextGame.competitors.find(function(c) { return c.homeAway === 'home'; });
            var away = this.nextGame.competitors.find(function(c) { return c.homeAway === 'away'; });
            if (home && away && home.score !== undefined && away.score !== undefined) {
                scoreHtml = `<span class="game-score">${home.team.abbreviation} ${home.score} - ${away.score} ${away.team.abbreviation}</span>`;
            }
        }

        var detailHtml;
        if (isPastGame) {
            detailHtml = `<span class="game-time">${dateString}</span>` + scoreHtml;
        } else {
            detailHtml = `<span class="game-time">${dateString} @ ${timeString}</span>`;
        }

        gameInfo.innerHTML += '<div class="game-title-time-wrapper">' +
                                '<span class="game-title-row">' +
                                  sportImageHtml +
                                  `<span class="game-title">${this.nextGame.name}</span>` +
                                '</span>' +
                                detailHtml +
                              '</div>';

        wrapper.appendChild(gameInfo);

        return wrapper;
    }
});
