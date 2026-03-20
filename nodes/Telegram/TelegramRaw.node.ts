import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { apiRequest } from './GenericFunctions';

export class TelegramRaw implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegram Raw',
		name: 'telegramRaw',
		icon: 'file:telegram.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{ "Method: " + $parameter["apiMethod"] }}',
		description: 'Call any Telegram Bot API method with a raw JSON body',
		defaults: {
			name: 'Telegram Raw',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'telegramApi',
				required: true,
			},
		],
		properties: [
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

				const response = await apiRequest.call(this, 'POST', apiMethod, body);

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
