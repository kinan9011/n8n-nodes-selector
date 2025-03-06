import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	NodeConnectionType,
} from 'n8n-workflow';
import { NodeOperationError, ApplicationError } from 'n8n-workflow';

import { updateDisplayOptions, getTypeValidationStrictness, looseTypeValidationProperty } from '../../helpers/utils';

export const properties: INodeProperties[] = [
	{
		displayName: 'Conditions',
		name: 'conditions',
		type: 'filter',
		default: {},
		typeOptions: {
			filter: {
				caseSensitive: '={{!$parameter.options.ignoreCase}}',
				typeValidation: getTypeValidationStrictness(2.1),
			},
		},
	},
	{
		...looseTypeValidationProperty,
		default: false,
		displayOptions: {
			show: {
				'@version': [{ _cnd: { gte: 2.1 } }],
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
			{
				...looseTypeValidationProperty,
				displayOptions: {
					show: {
						'@version': [{ _cnd: { lt: 2.1 } }],
					},
				},
			},
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

	// Attempt to get input data for index 0 and 1.
	// If an input isn't connected, fall back to an empty array.
	let inputData1: INodeExecutionData[] = [];
	let inputData2: INodeExecutionData[] = [];

	try {
		inputData1 = this.getInputData(0);
	} catch (err) {
		inputData1 = [];
	}

	try {
		inputData2 = this.getInputData(1);
	} catch (err) {
		inputData2 = [];
	}

	try {
		// Ensure the index is within valid bounds
		if (waitForAllInputs) {
			const allInputsReceived = inputsData.every(inputArray => inputArray.length > 0);
			if (!allInputsReceived) {
				throw new Error('Waiting for all inputs to be available before processing.');
			}
		}

		let pass = false;
		try {
			// Retrieve the "condition" parameter from the node's parameters.
			// const conditionParam = this.getNodeParameter('condition', 0, { extractValue: true });
			// Convert the parameter value to a boolean.
			// pass = conditionParam === true || conditionParam === 'true';
			pass = this.getNodeParameter('conditions', 0, false, { extractValue: true }) as boolean;
		} catch (error) {
			throw error;
		}

		let outputData: INodeExecutionData[] = [];
		// If the condition is true, use the first input data; otherwise, the second.
		if (pass) {
			outputData = inputData1;
		} else {
			outputData = inputData2;
		}

		returnData.push(...outputData);
	} catch (error) {
		// Handle errors and allow the workflow to continue if "Continue on Fail" is enabled.
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
