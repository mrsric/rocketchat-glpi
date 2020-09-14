export class TicketResult {
  public TicketNumber: string
  public TicketID: string

  // Returns data we care about from the gif endpoints
  constructor(data?: any) {
    if (data) {
      this.TicketNumber = data.TicketNumber as string
      this.TicketID = data.TicketID as string
    }
  }
}
