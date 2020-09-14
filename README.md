# 🚀 Rocket.Chat OTRS CreateTicket App

OTRS Rocket.Chat Custom Slash Command for creating Tickets

### 💼 Usage

Make sure the App has been installed, and then simply enter the following in any channel:

```
/create-ticket This is the Subject | This is the Body
```

### 🎉 Deploying

To Deploy a new Rocket.Chat App, you must first enable developer mode in order to upload custom Apps. This one is not in the Marketplace yet, unfortunately. This can be found under _Administration_ -> _General_ -> _Apps_.

Once that has been enabled, you can upload the App via the rocket.chat cli.

```
npm install -g @rocket.chat/apps-cli
```

Then, clone this repo and install the dependencies

```
git clone https://github.com/ndom91/rocketchat-otrs
cd rocketchat-otrs
npm install
```

Finally, you can use the following commands to install / update the app:

```
rc-apps deploy --url https://chat.company.com --username user_username --password user_password
rc-apps deploy --url https://chat.company.com --username user_username --password user_password --update
```

Then make sure to go back into _Administration_ -> _Apps_ and set the required settings for this application.

They include:

- OTRS User for Authenticating to the API
- OTRS Password
- OTRS Webservice Url - the location of your TicketCreate endpoint
- OTRS TicketID Url prefix - where it will append the newly created TicketID in the return message to create a link to the new ticket.

### 📝 Notes

https://rodriq.github.io/GSoC-2019-Interactive-APIs-Docs/developer-guides/developing-apps/getting-started/
https://github.com/graywolf336/RocketChatApps/tree/master/github
