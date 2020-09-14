import {
  HttpStatusCode,
  IHttp,
  ILogger,
} from '@rocket.chat/apps-engine/definition/accessors'
import { TicketResult } from '../helpers/TicketResult'

export class TicketPoster {
  public async postTicket(
    logger: ILogger,
    http: IHttp,
    subject: String,
    body: String,
    sender: String,
    room: String | undefined,
    otrsUser: string,
    otrsPass: string,
    otrsWebServiceUrl: string
  ): Promise<TicketResult> {
    const response = await http.post(otrsWebServiceUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        UserLogin: otrsUser,
        Password: otrsPass,
      },
      data: {
        Ticket: {
          Title: subject,
          QueueID: '2',
          LockID: '1',
          TypeID: '1',
          ServiceID: '',
          SLAID: '',
          StateID: '1',
          PriorityID: '3',
          CustomerUser: 'device@newtelco.de',
        },
        Article: {
          ArticleTypeID: '8',
          SenderTypeID: '1',
          From: sender,
          Subject: subject,
          Body: `${body} \n\n${sender} - ${room}`,
          MimeType: 'text/json',
          Charset: 'UTF8',
        },
      },
    })

    if (response.statusCode !== HttpStatusCode.OK || !response.data.TicketID) {
      logger.debug('Did not get a valid response', response)
      throw new Error('Unable to post ticket.')
    }

    return response.data
  }
}
