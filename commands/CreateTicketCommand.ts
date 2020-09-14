import {
  IHttp,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors'
import {
  ISlashCommand,
  SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands'

import { CreateTicketApp } from '../CreateTicketApp'
import { TicketResult } from '../helpers/TicketResult'

export class CreateTicketCommand implements ISlashCommand {
  public command: string
  public i18nParamsExample: string
  public i18nDescription: string
  public providesPreview: boolean

  constructor(private readonly app: CreateTicketApp) {
    this.command = 'create-ticket'
    this.i18nParamsExample = '<subject> | <body>'
    this.i18nDescription = 'Open ticket in OTRS'
    this.providesPreview = false
  }

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persis: IPersistence
  ): Promise<void> {
    let tickets: TicketResult

    // DEBUG
    // this.app.getLogger().info("args", context.getArguments());
    // this.app.getLogger().info("room", context.getRoom());
    // this.app.getLogger().info("user", context.getSender());
    const room = context.getRoom()
    const sender = context.getSender()
    const parts = context.getArguments().join(' ').split('|')
    const subject = parts[0]
    const body = parts[1]
    const ticketUrl = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('ticketUrl')
    const otrsUser = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('otrsUsername')
    const otrsPassword = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('otrsPassword')
    const otrsWebserviceUrl = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('webServiceUrl')

    try {
      tickets = await this.app
        .postTicketPoster()
        .postTicket(
          this.app.getLogger(),
          http,
          subject,
          body,
          `${sender.name} <${sender.emails[0].address}>`,
          room.displayName,
          otrsUser,
          otrsPassword,
          otrsWebserviceUrl
        )

      // DEBUG
      // this.app.getLogger().info("ticket", tickets);
      const msg = modify
        .getNotifier()
        .getMessageBuilder()
        .setRoom(context.getRoom())
        .setUsernameAlias('OTRS Bot')
        .setEmojiAvatar(':memo:')
        .setText(
          `:newspaper: OTRS Ticket **#${tickets.TicketNumber}** posted successfully.\n\n:link: [Open in OTRS](${ticketUrl}${tickets.TicketID})`
        )
        .getMessage()
      await modify.getNotifier().notifyUser(context.getSender(), msg)
    } catch (e) {
      this.app.getLogger().error('Posting Ticket Failed', e)
      const msg = modify
        .getNotifier()
        .getMessageBuilder()
        .setRoom(context.getRoom())
        .setUsernameAlias('OTRS Bot')
        .setEmojiAvatar(':ghost:')
        .setText('Error posting OTRS Ticket')
        .getMessage()
      await modify.getNotifier().notifyUser(context.getSender(), msg)
    }
  }
}
