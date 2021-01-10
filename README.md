# Tirage Aléatoire - Miro Web-Plugin

### Clone

Clone this repository to your local workspace.

`git clone git@github.com:PixieStudio/proto_draw_card_miro.git`

Install packages.

`npm i`

Populate `src/.config.js`.

### ENV Development

Start your application with node.

`node src/tirage-aleatoire.js`

Start your **ngrok tunnel** :

`ngrok http 3010`

Create new app in your Miro Dev Account and fill :

#### Redirect URLs

```
https://XXXX.ngrok.io/static/web-plugin/auth-success.html
https://XXXX.ngrok.io/oauth
```

#### Web Plugin

```
https://XXXX.ngrok.io/static/web-plugin/index.html
```

#### OAuth scopes

```
auditlogs:read
boards:read
boards:write
identity:read
team:read
```
