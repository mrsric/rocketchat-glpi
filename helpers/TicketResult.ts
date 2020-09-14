export class TicketResult {
  public TicketNumber: string
  public TicketID: string

  constructor(data?: any) {
    if (data) {
      this.TicketNumber = data.TicketNumber as string
      this.TicketID = data.TicketID as string
    }
  }
}
