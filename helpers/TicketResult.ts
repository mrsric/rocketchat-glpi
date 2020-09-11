export class TicketResult {
  public ticketNr: string;

  // Returns data we care about from the gif endpoints
  constructor(data?: any) {
    if (data) {
      this.ticketNr = data.TicketNumber as string;
    }
  }
}
