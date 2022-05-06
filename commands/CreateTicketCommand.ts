import {
  IHttp,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms/IRoom';
import {
  ISlashCommand,
  SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

import { CreateTicketApp } from '../GLPITicketApp';
import ChatHelper from '../helpers/ChatHelper';
import { TicketHelper } from '../helpers/TicketHelper';
import { TicketResult } from '../helpers/TicketResult';

export class CreateTicketCommand implements ISlashCommand {
  public command: string;
  public i18nParamsExample: string;
  public i18nDescription: string;
  public providesPreview: boolean;
  private ticketHelper: TicketHelper;

  constructor(private readonly app: CreateTicketApp) {
    this.command = 'glpi-novo';
    this.i18nParamsExample = 'glpi-command-example';
    this.i18nDescription = 'glpi-command-description';
    this.providesPreview = false;
  }

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persis: IPersistence,
  ): Promise<void> {

    let tickets: TicketResult;

    const room = context.getRoom();
    const sender = context.getSender();
    const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');
    const parts = context.getArguments().join(' ').split('|');
    const subject = parts[0];
    const body = parts[1];
    const glpiWebserviceUrl = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('webServiceUrl');
    const glpiTokenUser = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('glpiTokenUser');
    const glpiTokenApp = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('glpiTokenApp');
    const glpiIsHtml = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('glpiIsHtml');
    const glpiTimeZone = await read
      .getEnvironmentReader()
      .getSettings()
      .getValueById('glpiTimeZone');

    // DEBUG
    // this.app.getLogger().info("args", context.getArguments());
    // this.app.getLogger().info("room", context.getRoom());
    // this.app.getLogger().info("user", context.getSender());

    try {

      const roomRead: IRoom = (await read.getRoomReader().getById(room.id)) as IRoom;
      const roomReadParse = JSON.parse(JSON.stringify(roomRead));
      const visitorToken = roomReadParse.visitor.token;
      const visitorName = roomReadParse.visitor.name;
      const visitorEmail = roomReadParse.visitor.visitorEmails[0] ? roomReadParse.visitor.visitorEmails[0].address : '';

      this.ticketHelper = new TicketHelper(this.app.getLogger(), http, glpiWebserviceUrl, glpiTokenUser, glpiTokenApp);
      const chatHelper: ChatHelper = new ChatHelper(this.app.getLogger(), http, siteUrl, glpiTimeZone);

      const mesagens = await chatHelper.getMessages(room.id, visitorToken);
      const bodyMesages = chatHelper.getBodyMessages(mesagens, glpiIsHtml);

      // this.app.getLogger().error("ticket", await roomRead);
      // throw new Error('Unable to post ticket:. ' + JSON.stringify(await read.getEnvironmentReader().getEnvironmentVariables().getValueByName('url')));

      tickets = await this.ticketHelper
        .postTicket(
          `Chamado aberto vi chat: ${room.displayName}` + (subject ? ' - ' + subject : ''),
          `${bodyMesages}`
                + (body ? getSection(glpiIsHtml) + body : '')
                + getFooter(`${sender.name} <${sender.emails[0].address}> - ${room.displayName}`, glpiIsHtml),
        );

      await this.ticketHelper
        .addUserTicket(
          tickets.TicketID,
          '0',
          visitorEmail,
        );

      const msg = modify
        .getNotifier()
        .getMessageBuilder()
        .setRoom(context.getRoom())
        .setUsernameAlias('GLPI Bot')
        .setEmojiAvatar(':robot:')
        // .setAvatarUrl('./glpi.png')
        .setText(
          // tslint:disable-next-line:max-line-length
          `:newspaper: Protocolo **#${tickets.TicketID}** criado com sucesso.\n\n:link: [Abrir](${glpiWebserviceUrl}/front/ticket.form.php?id=${tickets.TicketID})`,
        )
        .getMessage();
      await modify.getNotifier().notifyUser(context.getSender(), msg);
    } catch (e) {
      this.app.getLogger().error('Posting Ticket Failed', e);
      const msg = modify
        .getNotifier()
        .getMessageBuilder()
        .setRoom(context.getRoom())
        .setUsernameAlias('GLPI Bot')
        .setEmojiAvatar(':ghost:')
        .setText('Erro ao abrir chamado' + e)
        .getMessage();
      await modify.getNotifier().notifyUser(context.getSender(), msg);
    }
  }

}
function getSection(glpiIsHtml: boolean) {
  return glpiIsHtml ? '<br/><br/><hr/><br/>' : '\n\n\n-----------------------------------\n\n';
}

function getFooter(footer: string, glpiIsHtml: boolean) {
  return getSection(glpiIsHtml) + footer;
}
