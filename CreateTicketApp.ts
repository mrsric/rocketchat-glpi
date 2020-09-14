import {
  ILogger,
  IConfigurationExtend,
} from '@rocket.chat/apps-engine/definition/accessors'
import { App } from '@rocket.chat/apps-engine/definition/App'
import { CreateTicketCommand } from './commands/CreateTicketCommand'
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata'
import { TicketPoster } from './helpers/TicketPoster'
import { SettingType } from '@rocket.chat/apps-engine/definition/settings'

export class CreateTicketApp extends App {
  private ticketPoster: TicketPoster

  constructor(info: IAppInfo, logger: ILogger) {
    super(info, logger)

    this.ticketPoster = new TicketPoster()
  }

  public async onEnable(): Promise<boolean> {
    return true
  }

  public postTicketPoster(): TicketPoster {
    return this.ticketPoster
  }

  protected async extendConfiguration(
    configuration: IConfigurationExtend
  ): Promise<void> {
    await configuration.settings.provideSetting({
      id: 'otrsUsername',
      type: SettingType.STRING,
      packageValue: '',
      required: true,
      public: false,
      i18nLabel: 'OTRS Scripts Username',
      i18nDescription: 'Username for Scripts Account to authenticate API',
    })

    await configuration.settings.provideSetting({
      id: 'otrsPassword',
      type: SettingType.STRING,
      packageValue: '',
      required: true,
      public: false,
      i18nLabel: 'OTRS Scripts Password',
      i18nDescription: 'Password for Scripts Account to authenticate API',
    })

    await configuration.settings.provideSetting({
      id: 'webServiceUrl',
      type: SettingType.STRING,
      packageValue: 'https://',
      required: true,
      public: false,
      i18nLabel: 'OTRS Web Service Url',
      i18nDescription:
        'For TicketCreate Endpoint, for example - otrs.company.com/otrs/nph-genericinterface.pl/Webservice/GenericTicketConnectorSCRIPTS/Ticket',
    })

    await configuration.settings.provideSetting({
      id: 'ticketUrl',
      type: SettingType.STRING,
      packageValue: 'https://',
      required: true,
      public: false,
      i18nLabel: 'OTRS Ticket Url Prefix',
      i18nDescription:
        'For example - otrs.company.tld/otrs/index.pl?Action=AgentTicketZoom;TicketID=',
    })

    await configuration.slashCommands.provideSlashCommand(
      new CreateTicketCommand(this)
    )
  }
}
