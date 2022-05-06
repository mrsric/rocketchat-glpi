export class TicketResult {
  public TicketMessage: string;
  public TicketID: string;

  constructor(data?: any) {
    if (data) {
      this.TicketMessage = data.message as string;
      this.TicketID = data.id as string;
    }
  }
}
