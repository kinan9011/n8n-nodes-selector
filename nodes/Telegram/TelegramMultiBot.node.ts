import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequestMultiBot } from './GenericFunctions';

export class TelegramMultiBot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegram Multi Bot',
		name: 'telegramMultiBot',
		icon: 'file:telegram.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{ $parameter["apiMethod"] }}',
		description: 'Call any Telegram Bot API method, routing to different bots via switch-style rules',
		defaults: {
			name: 'Telegram Multi Bot',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'https://api.telegram.org',
				description: 'Telegram Bot API base URL',
			},
			{
				displayName: 'Bot Tokens',
				name: 'botTokens',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: 'Add Bot',
				default: {},
				description: 'List of bot tokens. Rules reference bots by their index (0-based).',
				options: [
					{
						displayName: 'Bot',
						name: 'values',
						values: [
							{
								displayName: 'Label',
								name: 'botLabel',
								type: 'string',
								default: '',
								placeholder: 'e.g. support-bot',
								description: 'Optional label for your reference',
							},
							{
								displayName: 'Bot Token',
								name: 'botToken',
								type: 'string',
								typeOptions: { password: true },
								default: '',
								required: true,
								placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
								description: 'Telegram bot token from @BotFather',
							},
						],
					},
				],
			},
			{
				displayName: 'Routing Rules',
				name: 'rules',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: 'Add Rule',
				default: {},
				description: 'Conditions to select which bot to use. First matching rule wins.',
				options: [
					{
						displayName: 'Rule',
						name: 'values',
						values: [
							{
								displayName: 'Conditions',
								name: 'conditions',
								type: 'filter',
								default: {},
								typeOptions: {
									filter: {
										caseSensitive: true,
										typeValidation: 'strict',
									},
								},
							},
							{
								displayName: 'Bot Index',
								name: 'botIndex',
								type: 'number',
								default: 0,
								description: 'Index (0-based) of the bot in the Bot Tokens list to use when this rule matches',
								typeOptions: {
									minValue: 0,
									numberPrecision: 0,
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Fallback Bot Index',
				name: 'fallbackIndex',
				type: 'number',
				default: 0,
				description: 'Index (0-based) of the bot to use when no rule matches',
				typeOptions: {
					minValue: 0,
					numberPrecision: 0,
				},
			},
			{
				displayName: 'API Method',
				name: 'apiMethod',
				type: 'string',
				default: 'sendMessage',
				required: true,
				placeholder: 'e.g. sendMessage, sendPhoto, getChat',
				description:
					'The Telegram Bot API method to call. See <a href="https://core.telegram.org/bots/api#available-methods" target="_blank">Telegram Bot API docs</a>.',
			},
			{
				displayName: 'JSON Body',
				name: 'jsonBody',
				type: 'json',
				default: '{\n  "chat_id": "",\n  "text": "Hello from n8n!"\n}',
				required: true,
				description: 'The JSON body to send with the request',
				typeOptions: {
					rows: 10,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const baseUrl = this.getNodeParameter('baseUrl', i, 'https://api.telegram.org') as string;
				const botTokensData = this.getNodeParameter('botTokens', i, {}) as {
					values?: Array<{ botToken: string; botLabel: string }>;
				};
				const botList = botTokensData.values ?? [];

				if (botList.length === 0) {
					throw new NodeOperationError(this.getNode(), 'No bot tokens configured. Add at least one bot.', {
						itemIndex: i,
					});
				}

				const fallbackIndex = this.getNodeParameter('fallbackIndex', i, 0) as number;
				const rulesData = this.getNodeParameter('rules', i, {}) as {
					values?: Array<{ botIndex: number }>;
				};
				const rulesList = rulesData.values ?? [];

				let botIndex = fallbackIndex;

				for (let ruleIdx = 0; ruleIdx < rulesList.length; ruleIdx++) {
					const pass = this.getNodeParameter(
						`rules.values[${ruleIdx}].conditions`,
						i,
						false,
						{ extractValue: true },
					) as boolean;

					if (pass) {
						botIndex = rulesList[ruleIdx].botIndex;
						break;
					}
				}

				if (botIndex >= botList.length) {
					throw new NodeOperationError(
						this.getNode(),
						`Bot index ${botIndex} out of range — only ${botList.length} bot(s) configured.`,
						{ itemIndex: i },
					);
				}

				const token = botList[botIndex].botToken;
				if (!token) {
					throw new NodeOperationError(
						this.getNode(),
						`Bot at index ${botIndex} has no token set.`,
						{ itemIndex: i },
					);
				}

				const apiMethod = this.getNodeParameter('apiMethod', i) as string;
				const jsonBodyRaw = this.getNodeParameter('jsonBody', i);

				let body: IDataObject;
				if (typeof jsonBodyRaw === 'string') {
					try {
						body = JSON.parse(jsonBodyRaw) as IDataObject;
					} catch {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON in "JSON Body" field', {
							itemIndex: i,
						});
					}
				} else {
					body = jsonBodyRaw as IDataObject;
				}

				const response = await apiRequestMultiBot.call(this, 'POST', apiMethod, body, token, baseUrl);

				returnData.push({
					json: response as IDataObject,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const errorData = error instanceof Error ? error.message : 'An error occurred';
					returnData.push({
						json: { error: errorData },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
