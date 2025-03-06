import type {
	INodeProperties,
	IDisplayOptions,
	INodeExecutionData,
	INodeParameters,
	IExecuteFunctions
} from 'n8n-workflow';
import { NodeConnectionType, NodeHelpers } from 'n8n-workflow';
import { merge } from 'lodash';

export const getTypeValidationStrictness = (version: number) => {
	return `={{ ($nodeVersion < ${version} ? $parameter.options.looseTypeValidation :  $parameter.looseTypeValidation) ? "loose" : "strict" }}`;
};

export const looseTypeValidationProperty: INodeProperties = {
	displayName: 'Convert Types Where Required',
	// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
	description:
		'If the type of an expression doesn\'t match the type of the comparison, n8n will try to cast the expression to the required type. E.g. for booleans <code>"false"</code> or <code>0</code> will be cast to <code>false</code>',
	name: 'looseTypeValidation',
	type: 'boolean',
	default: true,
};

export function updateDisplayOptions(
	displayOptions: IDisplayOptions,
	properties: INodeProperties[],
) {
	return properties.map((nodeProperty) => {
		return {
			...nodeProperty,
			displayOptions: merge({}, nodeProperty.displayOptions, displayOptions),
		};
	});
}

export const configuredInputs = (parameters: INodeParameters) => {
	return Array.from({ length: (parameters.numberInputs as number) || 2 }, (_, i) => ({
		type: `${NodeConnectionType.Main}`,
		displayName: `Input ${(i + 1).toString()}`,
		maxConnections: 1,
	}));
};

export function getNodeInputsData(this: IExecuteFunctions) {
	const returnData: INodeExecutionData[][] = [];

	const inputs = NodeHelpers.getConnectionTypes(this.getNodeInputs()).filter(
		(type) => type === NodeConnectionType.Main,
	);

	for (let i = 0; i < inputs.length; i++) {
		try {
			returnData.push(this.getInputData(i) ?? []);
		} catch (error) {
			returnData.push([]);
		}
	}

	return returnData;
}

