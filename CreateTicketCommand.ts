import {
	IHttp,
	ILogger,
	IMessageBuilder,
	IPersistence,
	IRead
} from "@rocket.chat/apps-ts-definition/accessors";
import {App} from "@rocket.chat/apps-ts-definition/App";
import {
	IMessage,
	IPreMessageSentModify
} from "@rocket.chat/apps-ts-definition/messages";
import {IAppInfo} from "@rocket.chat/apps-ts-definition/metadata/IAppInfo";

export class CreateTicketApp extends App implements IPreMessageSentModify {
	private matcher: RegExp = /([a-zA-Z|_|\-|0-9]+)\/([a-zA-Z|_|\-|.|0-9]+)#(\d+)/g;

	constructor(info: IAppInfo, logger: ILogger) {
		super(info, logger);
	}

	public async checkPreMessageSentModify(
		message: IMessage,
		read: IRead,
		http: IHttp
	): Promise<boolean> {
		if (typeof message.text !== "string") {
			return false;
		}

		const result = message.text.match(this.matcher);

		return result ? result.length !== 0 : false;
	}

	public async executePreMessageSentModify(
		message: IMessage,
		builder: IMessageBuilder,
		read: IRead,
		http: IHttp,
		persistence: IPersistence
	): Promise<IMessage> {
		if (typeof message.text !== "string") {
			return message;
		}

		console.log(message)
		const parts = message.split(';')
		const subject = parts[0]
		const body = parts[1]

		// TODO: Post to OTRS Endpoint

		const githubLinks = message.text.match(this.matcher);

		message.text = 'Successfully posted Ticket!'

		return message;
	}
}
