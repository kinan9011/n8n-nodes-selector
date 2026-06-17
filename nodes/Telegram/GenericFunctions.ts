import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
): Promise<unknown> {
	const credentials = await this.getCredentials('telegramApi');

	query = query || {};

	const options: IRequestOptions = {
		headers: {},
		method,
		uri: `${credentials.baseUrl}/bot${credentials.accessToken}/${endpoint}`,
		body,
		qs: query,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function apiRequestMultiBot(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	botIndex: number,
	query?: IDataObject,
): Promise<unknown> {
	const credentials = await this.getCredentials('telegramMultiBotApi');

	const tokenField = `botToken${botIndex}`;
	const token = credentials[tokenField] as string | undefined;

	if (!token) {
		throw new NodeOperationError(
			this.getNode(),
			`No bot token configured at slot ${botIndex}. Add a token in the TelegramMultiBot credential.`,
		);
	}

	query = query || {};

	const options: IRequestOptions = {
		headers: {},
		method,
		uri: `${credentials.baseUrl}/bot${token}/${endpoint}`,
		body,
		qs: query,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(query).length === 0) {
		delete options.qs;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
