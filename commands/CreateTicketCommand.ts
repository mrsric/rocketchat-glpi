import {
  IHttp,
  IModify,
  IPersistence,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
  ISlashCommand,
  SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";

import { CreateTicketApp } from "../CreateTicketApp";
import { TicketResult } from "../helpers/TicketResult";

export class CreateTicketCommand implements ISlashCommand {
  public command: string;
  public i18nParamsExample: string;
  public i18nDescription: string;
  public providesPreview: boolean;

  constructor(private readonly app: CreateTicketApp) {
    this.command = "create-ticket";
    this.i18nParamsExample = "<subject> ; <body>";
    this.i18nDescription = "Create Ticket in Newtelco OTRS";
    this.providesPreview = false;
  }

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persis: IPersistence
  ): Promise<void> {
    let tickets: TicketResult;

    // this.app.getLogger().info("args", context.getArguments());
    // this.app.getLogger().info("room", context.getRoom());
    // this.app.getLogger().info("user", context.getSender());
    const room = context.getRoom();
    const sender = context.getSender();
    const parts = context.getArguments().join(" ").split(";");
    const subject = parts[0];
    const body = parts[1];

    try {
      tickets = await this.app
        .postTicketPoster()
        .postTicket(
          this.app.getLogger(),
          http,
          subject,
          body,
          `${sender.name} <${sender.emails[0].address}>`,
          room.displayName
        );
      this.app.getLogger().info("ticket", tickets);
      const msg = modify
        .getNotifier()
        .getMessageBuilder()
        .setRoom(context.getRoom())
        .setUsernameAlias("OTRS Bot")
        .setEmojiAvatar(":memo:")
        .setText(
          `:newspaper: OTRS Ticket **#${tickets.TicketNumber}** posted successfully.\n\n:link: [Open in OTRS](https://support.newtelco.de/otrs/index.pl?Action=AgentTicketZoom;TicketID=${tickets.TicketID})`
        )
        .getMessage();
      await modify.getNotifier().notifyUser(context.getSender(), msg);
    } catch (e) {
      this.app.getLogger().error("Failed on something:", e);
      const msg = modify
        .getNotifier()
        .getMessageBuilder()
        .setRoom(context.getRoom())
        .setUsernameAlias("OTRS Bot")
        .setEmojiAvatar(":ghost:")
        .setText("Error posting OTRS Ticket")
        .getMessage();
      await modify.getNotifier().notifyUser(context.getSender(), msg);
    }
  }
}
