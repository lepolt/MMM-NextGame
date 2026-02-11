# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MMM-NextGame is a MagicMirror² module that displays the next upcoming game for a sports team by fetching data from the ESPN API. It consists of a client-side module and a server-side Node.js helper.

## Setup

```bash
npm install
```

There is no build step, linter, or test suite. MagicMirror² loads the module files directly.

## Architecture

This follows the standard MagicMirror² module pattern:

- **MMM-NextGame.js** — Client-side module registered via `Module.register()`. Handles rendering (`getDom()`), scheduling periodic updates, and communicating with the backend via socket notifications.
- **node_helper.js** — Server-side helper created via `NodeHelper.create()`. Makes HTTP requests to the ESPN API using `node-fetch` and sends results back to the client.
- **MMM-NextGame.css** — Display styling.

### Data Flow

1. Client sends `GET_NEXT_GAME` socket notification with the ESPN API URL and an `instanceId`
2. `node_helper` fetches the ESPN endpoint, returns `NEXT_GAME_RESULT` with the JSON payload
3. Client parses `team.nextEvent[0]` from the response and renders team logo, game name, date, and time

### Configuration

The module accepts these config options (set in MagicMirror's `config.js`):

- `apiURL` — ESPN team API endpoint (default: LAFC soccer)
- `updateInterval` — Polling interval in ms (default: 3,600,000 / 1 hour)
- `sportImageHref` — Optional URL for a sport icon displayed alongside the game info

To use a different team/sport, change the `apiURL` to the appropriate ESPN endpoint: `http://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams/{teamId}`
