import {
  IConfigurationExtend,
  ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { CreateTicketCommand } from './commands/CreateTicketCommand';
export class CreateTicketApp extends App {

  constructor(info: IAppInfo, logger: ILogger) {
    super(info, logger);
  }

  public async onEnable(): Promise<boolean> {
    return true;
  }

  protected async extendConfiguration(
    configuration: IConfigurationExtend,
  ): Promise<void> {
    await configuration.settings.provideSetting({
      id: 'webServiceUrl',
      type: SettingType.STRING,
      packageValue: 'https://',
      required: true,
      public: false,
      section: 'GLPI',
      i18nLabel: 'GLPI Web Service Url',
      i18nDescription:
        `URL do servideo GLPI, por exemplo - servidorglpi`,
    });

    await configuration.settings.provideSetting({
      id: 'isAuthToken',
      type: SettingType.BOOLEAN,
      packageValue: true,
      required: true,
      public: false,
      section: 'Autenticação via Token',
      i18nLabel: 'Token',
      i18nDescription: 'Utilizar Token ao invés de usuário e senha',
    });

    await configuration.settings.provideSetting({
      id: 'glpiTokenUser',
      type: SettingType.STRING,
      packageValue: '',
      required: true,
      public: false,
      section: 'Autenticação Token',
      i18nLabel: 'Token Usuário',
      i18nDescription: 'Token para atenticação da API no GLPI',
    });

    await configuration.settings.provideSetting({
      id: 'glpiTokenApp',
      type: SettingType.STRING,
      packageValue: '',
      required: true,
      public: false,
      section: 'Autenticação Token',
      i18nLabel: 'Token Aplicação',
      i18nDescription: 'Token de aplicação no GLPI',
    });

    await configuration.settings.provideSetting({
      id: 'glpiTimeZone',
      type: SettingType.STRING,
      packageValue: 'America/Sao_Paulo',
      required: false,
      public: false,
      i18nLabel: 'Fuso Horário',
      i18nDescription: 'Fuso Horário para trancrição do Chat. Ex America/Sao_Paulo. (Senão informado será utilizado o UTC)',
    });

    await configuration.settings.provideSetting({
      id: 'glpiIsHtml',
      type: SettingType.BOOLEAN,
      packageValue: true,
      required: true,
      public: false,
      i18nLabel: 'HTML',
      i18nDescription: 'Utilizar HTML nos chamados. (Desmarque caso queira texto simples)',
    });

    await configuration.slashCommands.provideSlashCommand(
      new CreateTicketCommand(this),
    );
  }
}
