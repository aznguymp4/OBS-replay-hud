# OBS-replay-hud
Save OBS replay and quickly send to YouTube with the click of ~~one~~ two buttons!

`.gitignore`d files:
- `.env`
```env
OBS_WS_IP='ws://localhost:4455'
OBS_WS_PASS='PASSWORD_HERE'
HOSTING_PORT=5730
```

- `client_secret.json`
```json
{
    "installed": {
        "client_id": "...",
        "project_id": "...",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": "...",
        "redirect_uris": ["http://localhost"]
    }
}
// --- To download this file, do the following:
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Create Credentials > OAuth client ID > Application type: Desktop app
```

- `client_oauth_token.json`
```md
*This file gets auto generated when the save button is used the first time and user logs into YouTube Channel*
```