# Rocket.Chat GLPI CreateTicket App

GLPI Rocket.Chat Custom Slash Command for creating Tickets

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)


## Usage

Make sure the App has been installed, and then simply enter the following in any channel:

```
/glpi-novo <subject> | <body>  (Optional: Subject and Body)
```

## Deploying

To Deploy a new Rocket.Chat App, you must first enable developer mode in order to upload custom Apps. This one is not in the Marketplace yet, unfortunately. This can be found under _Administration_ -> _General_ -> _Apps_.

Once that has been enabled, you can upload the App via the rocket.chat cli.

```
npm install -g @rocket.chat/apps-cli
```

Then, clone this repo and install the dependencies

```sh
git clone https://github.com/mrsric/rocketchat-glpi.git
cd rocketchat-glpi
npm install
```

Finally, you can use the following commands to install / update the app:

```sh
rc-apps deploy --url https://chat.company.com --username user_username --password user_password
rc-apps deploy --url https://chat.company.com --username user_username --password user_password --update
```

Then make sure to go back into _Administration_ -> _Apps_ and set the required settings for this application.

They include:

- GLPI: URL do servideo GLPI, por exemplo - servidorglpi
- GLPI: Token Usuário - Token para atenticação da API no GLPI
- GLPI: Token Aplicação - Token de aplicação no GLPI
- GLPI: Fuso Horário - Fuso Horário para trancrição do Chat. Ex America/Sao_Paulo. (Senão informado será utilizado o UTC)

## References

> Baseado no APP OTRS (Nico Domino) - https://github.com/ndom91/rocketchat-otrs

### 📝 Notes

https://rodriq.github.io/GSoC-2019-Interactive-APIs-Docs/developer-guides/developing-apps/getting-started/
https://github.com/graywolf336/RocketChatApps/tree/master/github
