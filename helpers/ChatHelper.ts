import {
  HttpStatusCode,
  IHttp,
  ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import moment = require('moment-timezone');
export { ChatHelper };
export default class ChatHelper {

  private logger: ILogger;
  private http: IHttp;
  private siteUrl: string;
  private glpiTimeZone: string;

  constructor(
    // tslint:disable-next-line:variable-name
    logger: ILogger,
    // tslint:disable-next-line:variable-name
    http: IHttp,
    siteUrl: string,
    glpiTimeZone: string,
  ) {

    this.logger = logger;
    this.http = http;
    this.siteUrl = siteUrl;
    this.glpiTimeZone = glpiTimeZone;
  }

  public async getMessages(
    roomId: string,
    userId: string,
  ): Promise<object> {
    const response = await this.http.get(this.siteUrl + `/api/v1/livechat/messages.history/${roomId}?token=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.statusCode !== HttpStatusCode.OK || !response.data.success || response.data.success === false) {
      this.logger.debug('Did not get a valid response', response);
      throw new Error('Erro ao obter as mensages. ' + JSON.stringify(response.data));
    }

    return response.data;
  }

  public getBodyMessages(response: object, isHtml: boolean = true): string {

    if (!response) {
      return '';
    }

    const res = Object.assign(response);

    // Order by Date
    const messagesByTime = res.messages.sort((a, b) => a.ts.localeCompare(b.ts));
    const datas = messagesByTime.map((item) => new Date(item.ts).toLocaleDateString());
    const days = [...new Set(datas.map((item) => item))];

    // msgs array is maintained for speech text response
    const msgs: Array<string> = [];
    // messages array is maintained to display the messages in the table as rich response
    const messages: Array<string> = [];

    days.forEach((day) => {

      if (isHtml) {
        messages.push('<br/><div style=\"text-align:center;\"><strong>' + this.getDateExtension(new Date(day as string)) + '</strong><hr/></div>');
      } else {
        messages.push('\n\n' + this.getDateExtension(new Date(day as string)) + '\n\n');
      }

      // if the same user sends multiple messages then for every message username is not mentioned
      let previousUsername = '';
      for (let i = 0; i <= messagesByTime.length - 1; i++) {
        if (!messagesByTime[i]) { continue; }
        let speechText;

        if (day === new Date(messagesByTime[i].ts).toLocaleDateString()) {
          // if it's just a normal text message
          if (!messagesByTime[i].file && !messagesByTime[i].t && messagesByTime[i].msg) {
            // check if the message is not empty or made of just dots.
            if (this.cleanMessage(messagesByTime[i].msg).replace(/\./g, ' ').trim()) {
              // speak only the text message if the same user sent the message
              if (previousUsername === messagesByTime[i].u.username) {
                msgs.push(`${messagesByTime[i].msg}. `);
              } else {
                msgs.push(`${this.getSenderMessage(messagesByTime[i])} disse, ${messagesByTime[i].msg}.`);
                previousUsername = messagesByTime[i].u.username;
              }
            }
            messages.push(`${this.getSenderMessage(messagesByTime[i])}: ${messagesByTime[i].msg}`);
          } else if (messagesByTime[i].t) {
            if (messagesByTime[i].t === 'room_changed_description') {
              speechText = `${this.getSenderMessage(messagesByTime[i])} alterou a descrição para, ${messagesByTime[i].msg}.`;
              msgs.push(speechText);
              messages.push(`${this.getSenderMessage(messagesByTime[i])}: ${messagesByTime[i].msg}`);
            } else if (messagesByTime[i].t === 'room_changed_topic') {
              speechText = `${this.getSenderMessage(messagesByTime[i])} alterou o tópico para ${messagesByTime[i].msg}.`;
              msgs.push(speechText);
              messages.push(`${this.getSenderMessage(messagesByTime[i])}: ${messagesByTime[i].msg}`);
            } else if (messagesByTime[i].t === 'room_changed_announcement') {
              speechText = `${this.getSenderMessage(messagesByTime[i])} fez um anúncio que diz ${messagesByTime[i].msg}.`;
              msgs.push(speechText);
              messages.push(`${this.getSenderMessage(messagesByTime[i])}: ${messagesByTime[i].msg}`);
            } else if (messagesByTime[i].t === 'discussion-created') {
              speechText = `${this.getSenderMessage(messagesByTime[i])} criou uma discussão chamada ${messagesByTime[i].msg}.`;
              msgs.push(speechText);
              messages.push(`${this.getSenderMessage(messagesByTime[i])}: ${messagesByTime[i].msg}`);
            }
          } else if (messagesByTime[i].file) {
            if (messagesByTime[i].file.type.includes('image')) {
              speechText = `${this.getSenderMessage(messagesByTime[i])} compartilhou uma imagem intitulada ${messagesByTime[i].file.name}.`;
            } else if (messagesByTime[i].file.type.includes('video')) {
              speechText = `${this.getSenderMessage(messagesByTime[i])} compartilhou um video intitulado ${messagesByTime[i].file.name}.`;
            } else {
              speechText = `${this.getSenderMessage(messagesByTime[i])} compartilhou um arquivo intitulado ${messagesByTime[i].file.name}.`;
            }
            msgs.push(speechText);
            messages.push(`${this.getSenderMessage(messagesByTime[i])}: ${messagesByTime[i].file.name}`);
          }

        }
      }
    });

    let responseString = msgs.join('  ');
    // remove the emojis, urls and special characters form speech text message
    responseString = this.cleanMessage(responseString);

    // send response as an array with first element as speech text and second element as data to be displayed in rich response
    let messagesString: string = '';

    messages.forEach((key, val) => {
      if (isHtml) {
        messagesString += (key.includes('<hr/>') ? key.replace('\n', '<br/>') : '<p>' + key.replace('\n', '<br/>') + '</p>');
      } else {
        messagesString += key + '\n';
      }
    });

    // throw new Error('Unable to post ticket:. ' + JSON.stringify((messagesString)));
    return messagesString;
  }

  public getDateExtension(data: Date): string {

    const day = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][data.getDay()];
    const date = data.getDate();
    // tslint:disable-next-line:max-line-length
    const month = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][data.getMonth()];
    const year = data.getFullYear();

    return `${date} de ${month} de ${year}`;
  }

  private convertDataToHours(date: string): string {

    const newdata = new Date(date);

    const currentTimeZone = (moment.tz.zone(this.glpiTimeZone) ? this.glpiTimeZone : 'UTC');

    // const currentTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    const time = new Date(date).toLocaleTimeString('en-US', { timeZone: currentTimeZone, hour12: false });

    return time;
  }

  private getSenderMessage(message: any): string {
    return `(${this.convertDataToHours(message.ts)}) ${this.getUserNameMessage(message.u)}`;
  }

  private getUserNameMessage(user): string {
    return ((user.username as string).startsWith('guest-') ? user.name : user.username);
  }

  private cleanMessage(text: string): string {

    // :([a-z_]+): => regex for emoji :emoji:
    // (&[#0-9A-Za-z]*;) => regex for special character encodings &#ab3;
    // ((https?|ftp):\/\/[\.[a-zA-Z0-9\/\-]+) => regex for url

    const combinedRegex = new RegExp(':([a-z_]+):|(&[#0-9A-Za-z]*;)|((https?|ftp):\/\/[.[a-zA-Z0-9\/-]+)|[^ .,A-Za-z0-9\\n]', 'g');
    return text.replace(combinedRegex, '');
  }
}
