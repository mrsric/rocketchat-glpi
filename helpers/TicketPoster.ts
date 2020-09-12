import {
  HttpStatusCode,
  IHttp,
  ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";

import { TicketResult } from "../helpers/TicketResult";

export class TicketPoster {
  private readonly url =
    "https://support.newtelco.de/otrs/nph-genericinterface.pl/Webservice/GenericTicketConnectorSCRIPTS/Ticket";
  private readonly user = "scripts";
  private readonly pass = "scripts99";

  public async postTicket(
    logger: ILogger,
    http: IHttp,
    subject: String,
    body: String,
    sender: String,
    room: String
  ): Promise<Array<TicketResult>> {
    const response = await http.post(this.url, {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        UserLogin: this.user,
        Password: this.pass,
      },
      data: {
        Ticket: {
          Title: subject,
          QueueID: "2",
          LockID: "1",
          TypeID: "1",
          ServiceID: "",
          SLAID: "",
          StateID: "1",
          PriorityID: "3",
          CustomerUser: "device@newtelco.de",
        },
        Article: {
          ArticleTypeID: "8",
          SenderTypeID: "1",
          From: sender,
          Subject: subject,
          Body: `${body} \n ${sender} - ${room}`,
          MimeType: "text/json",
          Charset: "UTF8",
        },
      },
    });

    logger.info("response", response);

    if (
      response.statusCode !== HttpStatusCode.OK ||
      !response.data ||
      !response.data.data
    ) {
      logger.debug("Did not get a valid response", response);
      throw new Error("Unable to post ticket.");
    } else if (!Array.isArray(response.data.data)) {
      logger.debug("The response data is not an Array:", response.data.data);
      throw new Error("Data is in a format we don't understand.");
    }

    logger.debug("We got this many results:", response.data.data.length);

    return response.data.data.map((r) => new TicketResult(r));
  }
}
