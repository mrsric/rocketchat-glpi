# 🚀 Rocket.Chat OTRS CreateTicket App

OTRS Rocket.Chat Custom Slash Command for creating Tickets

### 💼 Usage

Make sure the App has been installed, and then simply enter the following in any channel:

```
/create-ticket This is the SUbject | This is the Body
```

### 🎉 Deploying

To Deploy a new Rocket.Chat App, you must first enable developer mode in order to upload custom Apps. This one is not in the Marketplace yet, unfortunately. This can be found under *Administration* -> *General* -> *Apps*.

Once that has been enabled, you can upload the App via the rocket.chat cli.

```
npm install -g @rocket.chat/apps-cli
```

Next, you can use the following commands to install / update the app:

```
rc-apps deploy --url https://chat.company.com --username user_username --password user_password
rc-apps deploy --url https://chat.company.com --username user_username --password user_password --update
```

Finally, make sure to go back into *Administration* -> *Apps* and set the required settings for this application.

They include:

- OTRS User for Authenticating to the API
- OTRS Password
- OTRS Webservice Url - the location of your TicketCreate endpoint
- OTRS TicketID Url prefix - where it will append the newly created TicketID in the return message to create a link to the new ticket.

### 📝 Notes

https://rodriq.github.io/GSoC-2019-Interactive-APIs-Docs/developer-guides/developing-apps/getting-started/
https://github.com/graywolf336/RocketChatApps/tree/master/github
