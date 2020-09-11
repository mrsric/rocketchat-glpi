import {
  IHttp,
  IModify,
  IPersistence,
  IRead
} from "@rocket.chat/apps-engine/definition/accessors";
import {
  ISlashCommand,
  SlashCommandContext
} from "@rocket.chat/apps-engine/definition/slashcommands";

import {CreateTicketApp} from "../CreateTicketApp";
import {TicketResult} from "../helpers/TicketResult";

export class CreateTicketCommand implements ISlashCommand {
  public command: string;
  public i18nParamsExample: string;
  public i18nDescription: string;
  public providesPreview: boolean;

  constructor(private readonly app: CreateTicketApp) {
    this.command = "create-ticket";
    this.i18nParamsExample = "";
    this.i18nDescription = "";
    this.providesPreview = false;
  }

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persis: IPersistence
  ): Promise<void> {
    let tickets: Array<TicketResult>;

    console.log(context.getArguments());
    const parts = context.getArguments().join(" ").split(";");
    const subject = parts[0];
    const body = parts[1];

    try {
      tickets = await this.app
        .postTicketPoster()
        .postTicket(this.app.getLogger(), http, subject, body);
      this.app.getLogger().info(tickets)
    } catch (e) {
      this.app.getLogger().error("Failed on something:", e);
    }
  }
}
