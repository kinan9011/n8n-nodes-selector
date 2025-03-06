import type { INodeProperties } from 'n8n-workflow';

export const numberInputsProperty: INodeProperties = {
	displayName: 'Number of Inputs',
	name: 'numberInputs',
	type: 'number',
	required: true,
	typeOptions: {
		maxValue: 15,
		minValue: 1,
		numberPrecision: 0,
	},
	default: 2,
	validateType: 'number',
	description: 'The number of data inputs you want',
};

