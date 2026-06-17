import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const tokenSlots: INodeProperties[] = Array.from({ length: 10 }, (_, i) => ({
	displayName: `Bot Token (Slot ${i})`,
	name: `botToken${i}`,
	type: 'string' as const,
	typeOptions: { password: true },
	default: '',
	required: i === 0,
	placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
	description: `Telegram bot token for slot ${i}. Get from @BotFather.${i === 0 ? ' Required.' : ' Optional.'}`,
}));

export class TelegramMultiBotApi implements ICredentialType {
	name = 'telegramMultiBotApi';
	displayName = 'Telegram Multi Bot API';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.telegram.org',
		},
		...tokenSlots,
	];

	test = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/bot{{$credentials.botToken0}}/getMe',
		},
	};
}
