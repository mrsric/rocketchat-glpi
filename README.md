# RocketChat OTRS CreateTicket

Newtelco OTRS Rocket.Chat Custom Slash Command

### Usage

Join the `#technik` Channel, and write something like the following:

```
/create-ticket This is the SUbject ; This is the Body
```

### Deploying

To Deploy a new Rocket.Chat App, you must first install the Rocket.Chat cli:

```
npm install -g @rocket.chat/apps-cli
```

Then you can use the following commands to install / update the app:

```
rc-apps deploy --url https://chat.newtelco.de --username user_username --password user_password
rc-apps deploy --url https://chat.newtelco.de --username user_username --password user_password --update
```

### Notes

https://rodriq.github.io/GSoC-2019-Interactive-APIs-Docs/developer-guides/developing-apps/getting-started/
https://github.com/graywolf336/RocketChatApps/tree/master/github
