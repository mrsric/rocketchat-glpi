import {
  HttpStatusCode,
  IHttp,
  ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { TicketResult } from './TicketResult';
export { TicketHelper as TicketHelper };
export default class TicketHelper {

  private sessionToken: string;
  private logger: ILogger;
  private http: IHttp;
  private glpiWebServiceUrl: string;
  private glpiTokenUser: string;
  private glpiTokenApp: string;

  constructor(
    // tslint:disable-next-line:variable-name
    logger: ILogger,
    // tslint:disable-next-line:variable-name
    http: IHttp,
    // tslint:disable-next-line:variable-name
    glpiWebServiceUrl: string,
    // tslint:disable-next-line:variable-name
    glpiTokenUser: string,
    // tslint:disable-next-line:variable-name
    glpiTokenApp: string,
  ) {

    this.logger = logger;
    this.http = http;
    this.glpiWebServiceUrl = glpiWebServiceUrl;
    this.glpiTokenUser = glpiTokenUser;
    this.glpiTokenApp = glpiTokenApp;
  }

  public async initSession(
  ): Promise<string> {
    const response = await this.http.get(this.glpiWebServiceUrl + '/apirest.php/initSession', {
      headers: this.getHeader(),
    });

    if (response.statusCode !== HttpStatusCode.OK || !response.data.session_token) {
      this.logger.debug('Did not get a valid response', response);
      throw new Error('Erro ao criar session. ' + JSON.stringify(response.data));
    }

    return response.data.session_token;
  }

  public async killSession(
  ): Promise<void> {
    const response = await this.http.get(this.glpiWebServiceUrl + '/apirest.php/killSession', {
      headers: this.getHeaderSessionAuth(),
    });

    if (response.statusCode !== HttpStatusCode.OK || !response.data.session_token) {
      this.logger.debug('Did not get a valid response', response);
      throw new Error('Erro ao criar session. ' + JSON.stringify(response.data));
    }
  }

  public async addUserTicket(
    ticketID: string,
    userId: string,
    userEmail: string,
  ): Promise<void> {
    const response = await this.http.post(this.glpiWebServiceUrl + `/apirest.php/ticket/${ticketID}/Ticket_User`, {
      headers: this.getHeaderSessionAuth(),
      params: {
        UserLogin: `glpiUser`,
        Password: `glpiPass`,
      },
      data: {
        input: {
          tickets_id: `${ticketID}`,
          users_id: `${userId ? userId : 0}`,
          type: 3,
          use_notification: 1,
          alternative_email: `${userEmail}`,
        },
      },
    });

    if ((response.statusCode !== HttpStatusCode.OK && response.statusCode !== HttpStatusCode.CREATED)) {
      this.logger.debug('Did not get a valid response', response);
      this.logger.error('Erro ao adicionar observador. ' + JSON.stringify(response.data));
    }

    this.killSession();

    return response.data;
  }

  public async postTicket(
    subject: string,
    body: string,
  ): Promise<TicketResult> {
    this.sessionToken = await this.initSession();

    // throw new Error('Unable to post ticket:. ' + JSON.stringify((body)));

    const response = await this.http.post(this.glpiWebServiceUrl + '/apirest.php/ticket', {
      headers: this.getHeaderSessionAuth(),
      data: {
        input: {
          name: subject,
          _users_id_requester: 91,
          users_id: 91,
          type: 1,
          requesttypes_id: 1,
          itilcategories_id: 110,
          content: `${body}`,
          crecifield: '',
        },
      },
    },
    );

    if ((response.statusCode !== HttpStatusCode.OK && response.statusCode !== HttpStatusCode.CREATED) || !response.data.id) {
      this.logger.debug('Did not get a valid response', response);
      throw new Error('Erro ao enviar Post para ticket. ' + JSON.stringify(response.data));
    }

    // this.killSession();

    return new TicketResult(response.data);
  }

  public getHeader(): { [key: string]: string; } | undefined {
    return {
      'Content-Type': 'application/json',
      'Authorization': `user_token ${this.glpiTokenUser}`,
      'app_token': `${this.glpiTokenApp}`,
    };
  }

  public getHeaderSessionAuth(): { [key: string]: string; } | undefined {
    return {
      'Content-Type': 'application/json',
      'Authorization': `user_token ${this.glpiTokenUser}`,
      'app_token': `${this.glpiTokenApp}`,
      'session_token': `${this.sessionToken}`,
      'session-token': `${this.sessionToken}`,
    };
  }
}
