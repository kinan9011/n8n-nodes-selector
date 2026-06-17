import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequestMultiBot } from './GenericFunctions';

const SLOT_COUNT = 5;

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
		credentials: [
			{ name: 'telegramBot0Api', required: true },
			{ name: 'telegramBot1Api', required: false },
			{ name: 'telegramBot2Api', required: false },
			{ name: 'telegramBot3Api', required: false },
			{ name: 'telegramBot4Api', required: false },
		],
		properties: [
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
								displayName: 'Bot Slot',
								name: 'botIndex',
								type: 'options',
								default: 0,
								description: 'Which bot credential to use when this rule matches',
								options: [
									{ name: 'Bot Slot 0', value: 0 },
									{ name: 'Bot Slot 1', value: 1 },
									{ name: 'Bot Slot 2', value: 2 },
									{ name: 'Bot Slot 3', value: 3 },
									{ name: 'Bot Slot 4', value: 4 },
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Fallback Bot Slot',
				name: 'fallbackIndex',
				type: 'options',
				default: 0,
				description: 'Which bot credential to use when no rule matches',
				options: [
					{ name: 'Bot Slot 0', value: 0 },
					{ name: 'Bot Slot 1', value: 1 },
					{ name: 'Bot Slot 2', value: 2 },
					{ name: 'Bot Slot 3', value: 3 },
					{ name: 'Bot Slot 4', value: 4 },
				],
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

		// Cache credentials per slot to avoid redundant lookups
		const credCache: Record<number, { accessToken: string; baseUrl: string }> = {};

		const getSlotCredentials = async (slot: number) => {
			if (credCache[slot]) return credCache[slot];
			const cred = await this.getCredentials(`telegramBot${slot}Api`);
			credCache[slot] = {
				accessToken: cred.accessToken as string,
				baseUrl: (cred.baseUrl as string) || 'https://api.telegram.org',
			};
			return credCache[slot];
		};

		for (let i = 0; i < items.length; i++) {
			try {
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

				if (botIndex < 0 || botIndex >= SLOT_COUNT) {
					throw new NodeOperationError(
						this.getNode(),
						`Bot slot ${botIndex} is out of range (0–${SLOT_COUNT - 1}).`,
						{ itemIndex: i },
					);
				}

				const { accessToken, baseUrl } = await getSlotCredentials(botIndex);

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

				const response = await apiRequestMultiBot.call(this, 'POST', apiMethod, body, accessToken, baseUrl);

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
