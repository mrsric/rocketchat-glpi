import {
  IRead,
  IHttp,
  ILogger,
  IConfigurationExtend,
  IEnvironmentRead,
  IConfigurationModify,
} from '@rocket.chat/apps-engine/definition/accessors'
import { App } from '@rocket.chat/apps-engine/definition/App'
import { CreateTicketCommand } from './commands/CreateTicketCommand'
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata'
import { TicketPoster } from './helpers/TicketPoster'
import {
  ISetting,
  SettingType,
} from '@rocket.chat/apps-engine/definition/settings'

export class CreateTicketApp extends App {
  private ticketPoster: TicketPoster
  private readonly otrsUsername: string
  private readonly otrsPassword: string
  private readonly otrsUrl: string
  private readonly otrsTicketUrl: string

  constructor(info: IAppInfo, logger: ILogger) {
    super(info, logger)

    this.ticketPoster = new TicketPoster()
  }

  public async onEnable(
    environmentRead: IEnvironmentRead,
    configModify: IConfigurationModify
  ): Promise<boolean> {
    const otrsUsername = await environmentRead
      .getSettings()
      .getValueById(this.otrsUsername)
    const otrsPassword = await environmentRead
      .getSettings()
      .getValueById(this.otrsPassword)
    const otrsUrl = await environmentRead
      .getSettings()
      .getValueById(this.otrsUrl)
    const otrsTicketUrl = await environmentRead
      .getSettings()
      .getValueById(this.otrsTicketUrl)
    if (!otrsUsername && !otrsPassword && !otrsUrl && !otrsTicketUrl) {
      await configModify.slashCommands.disableSlashCommand('create-ticket')
    }

    return true
  }

  public postTicketPoster(): TicketPoster {
    return this.ticketPoster
  }

  protected async extendConfiguration(
    configuration: IConfigurationExtend
  ): Promise<void> {
    await configuration.settings.provideSetting({
      id: 'username',
      type: SettingType.STRING,
      packageValue: '',
      required: true,
      public: false,
      i18nLabel: 'OTRS Scripts Username',
      i18nDescription: 'Username for Scripts Account to authenticate API',
    })

    await configuration.settings.provideSetting({
      id: 'password',
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
