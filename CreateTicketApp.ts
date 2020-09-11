import {
  ILogger,
  IConfigurationExtend
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata/IAppInfo";

import { CreateTicketCommand } from "./commands/CreateTicketCommand";
import { TicketPoster } from "./helpers/TicketPoster";

export class CreateTicketApp extends App {
  private ticketPoster: TicketPoster;

  constructor(info: IAppInfo, logger: ILogger) {
    super(info, logger);

    this.ticketPoster = new TicketPoster();
  }

  public postTicketPoster(): TicketPoster {
    return this.ticketPoster;
  }

  protected async extendConfiguration(
    configuration: IConfigurationExtend
  ): Promise<void> {
    await configuration.slashCommands.provideSlashCommand(
      new CreateTicketCommand(this)
    );
  }
}
