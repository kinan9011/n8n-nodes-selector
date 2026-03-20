import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeOperationError, ApplicationError } from 'n8n-workflow';

import { updateDisplayOptions, looseTypeValidationProperty } from '../../helpers/utils';

export const properties: INodeProperties[] = [
	{
		displayName: 'Conditions',
		name: 'conditions',
		type: 'filter',
		default: {},
		typeOptions: {
			filter: {
				caseSensitive: '={{!$parameter.options.ignoreCase}}',
				typeValidation: '={{ $parameter.options.looseTypeValidation ? "loose" : "strict" }}',
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'Ignore Case',
				description: 'Whether to ignore letter case when evaluating conditions',
				name: 'ignoreCase',
				type: 'boolean',
				default: true,
			},
			looseTypeValidationProperty,
		],
	},
	{
		displayName: 'Wait for All Inputs',
		name: 'waitForAllInputs',
		type: 'boolean',
		default: false,
		description: 'Whether to wait for all inputs before processing',
	},
];

const displayOptions = {
	show: {
		mode: ['singleSelect'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export const inputs = [
	{ type: NodeConnectionType.Main, displayName: 'Input 1', maxConnections: 1 },
	{ type: NodeConnectionType.Main, displayName: 'Input 2', maxConnections: 1 },
];

export async function execute(
	this: IExecuteFunctions,
	inputsData: INodeExecutionData[][],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];
	const waitForAllInputs = this.getNodeParameter('waitForAllInputs', 0, false) as boolean;

	try {
		if (waitForAllInputs) {
			const allInputsReceived = inputsData.every(inputArray => inputArray.length > 0);
			if (!allInputsReceived) {
				throw new Error('Waiting for all inputs to be available before processing.');
			}
		}

		const pass = this.getNodeParameter('conditions', 0, false, { extractValue: true }) as boolean;

		// If the condition is true, use the first input data; otherwise, the second.
		const outputData = pass ? inputsData[0] || [] : inputsData[1] || [];

		returnData.push(...outputData);
	} catch (error) {
		if (this.continueOnFail()) {
			returnData.push({ json: { error: error.message } });
		} else {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			if (error instanceof ApplicationError) {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), error);
		}
	}
	return [returnData];
}
