import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const slotProperties: INodeProperties[] = [
	{
		displayName: 'Access Token',
		name: 'accessToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
		description: 'Telegram bot token from @BotFather',
	},
	{
		displayName: 'Base URL',
		name: 'baseUrl',
		type: 'string',
		default: 'https://api.telegram.org',
	},
];

const testRequest = {
	request: {
		baseURL: '={{$credentials.baseUrl}}',
		url: '/bot{{$credentials.accessToken}}/getMe',
	},
};

export class TelegramBot0Api implements ICredentialType {
	name = 'telegramBot0Api';
	displayName = 'Telegram API – Bot Slot 0';
	documentationUrl = 'telegram';
	properties: INodeProperties[] = slotProperties;
	test = testRequest;
}

export class TelegramBot1Api implements ICredentialType {
	name = 'telegramBot1Api';
	displayName = 'Telegram API – Bot Slot 1';
	documentationUrl = 'telegram';
	properties: INodeProperties[] = slotProperties;
	test = testRequest;
}

export class TelegramBot2Api implements ICredentialType {
	name = 'telegramBot2Api';
	displayName = 'Telegram API – Bot Slot 2';
	documentationUrl = 'telegram';
	properties: INodeProperties[] = slotProperties;
	test = testRequest;
}

export class TelegramBot3Api implements ICredentialType {
	name = 'telegramBot3Api';
	displayName = 'Telegram API – Bot Slot 3';
	documentationUrl = 'telegram';
	properties: INodeProperties[] = slotProperties;
	test = testRequest;
}

export class TelegramBot4Api implements ICredentialType {
	name = 'telegramBot4Api';
	displayName = 'Telegram API – Bot Slot 4';
	documentationUrl = 'telegram';
	properties: INodeProperties[] = slotProperties;
	test = testRequest;
}
