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
		description: 'Call any Telegram Bot API method, routing to different bot tokens via switch-style rules',
		defaults: {
			name: 'Telegram Multi Bot',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'telegramMultiBotApi',
				required: true,
			},
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
				description: 'Conditions to select which bot token slot to use. First matching rule wins.',
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
								displayName: 'Bot Token Slot',
								name: 'botTokenSlot',
								type: 'number',
								default: 0,
								description: 'Credential slot (0–9) to use when this rule matches',
								typeOptions: {
									minValue: 0,
									maxValue: 9,
									numberPrecision: 0,
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Fallback Bot Token Slot',
				name: 'fallbackSlot',
				type: 'number',
				default: 0,
				description: 'Credential slot (0–9) to use when no rule matches',
				typeOptions: {
					minValue: 0,
					maxValue: 9,
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
				const fallbackSlot = this.getNodeParameter('fallbackSlot', i, 0) as number;
				const rulesData = this.getNodeParameter('rules', i, {}) as {
					values?: Array<{ botTokenSlot: number }>;
				};
				const rulesList = rulesData.values ?? [];

				let botIndex = fallbackSlot;

				for (let ruleIdx = 0; ruleIdx < rulesList.length; ruleIdx++) {
					const pass = this.getNodeParameter(
						`rules.values[${ruleIdx}].conditions`,
						i,
						false,
						{ extractValue: true },
					) as boolean;

					if (pass) {
						botIndex = rulesList[ruleIdx].botTokenSlot;
						break;
					}
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

				const response = await apiRequestMultiBot.call(this, 'POST', apiMethod, body, botIndex);

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
