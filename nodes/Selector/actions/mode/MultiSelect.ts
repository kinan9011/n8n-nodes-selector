import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	// NodeConnectionType,
} from 'n8n-workflow';

import {updateDisplayOptions} from '../../helpers/utils';

import { numberInputsProperty } from '../../helpers/descriptions';

export const properties: INodeProperties[] = [
	{
		displayName: 'Condition Index',
		name: 'conditionIndex',
		type: 'number',
		default: 0,
		description: 'The index of the input that should be selected and passed through (starting from 0)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Wait for All Inputs',
		name: 'waitForAllInputs',
		type: 'boolean',
		default: false,
		description: 'Whether to wait for all inputs before processing',
	},
	numberInputsProperty,
];

const displayOptions = {
	show: {
		mode: ['multiSelect'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	inputsData: INodeExecutionData[][],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	// Get the index provided by the user
	const conditionIndex = this.getNodeParameter('conditionIndex', 0, 0) as number;
	const waitForAllInputs = this.getNodeParameter('waitForAllInputs', 0, false) as boolean;

	try {
		// Ensure the index is within valid bounds
		if (waitForAllInputs) {
			const allInputsReceived = inputsData.every(inputArray => inputArray.length > 0);
			if (!allInputsReceived) {
				throw new Error('Waiting for all inputs to be available before processing.');
			}
		}

		if (conditionIndex < 0 || conditionIndex >= inputsData.length) {
			throw new Error(`Invalid input index: ${conditionIndex}. Must be between 0 and ${inputsData.length - 1}.`);
		}

		// Select the corresponding input data
		const selectedData = inputsData[conditionIndex] || [];

		// Pass through the selected data
		returnData.push(...selectedData);
	} catch (error) {
		if (this.continueOnFail()) {
			returnData.push({ json: { error: error.message } });
		} else {
			throw new Error(error);
		}
	}

	return [returnData];
}
