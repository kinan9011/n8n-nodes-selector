import type { INodeProperties } from 'n8n-workflow';

import * as singleSelect from './singleSelect';
import * as multiSelect from './MultiSelect';

export { singleSelect, multiSelect};

export const description: INodeProperties[] = [
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Single Select',
				value: 'singleSelect',
				description: 'Based on condition will pass Input 1 or Input 2',
			},
			{
				name: 'Multi Select',
				value: 'multiSelect',
				description: 'Based on condition (index number) will pass the matching inputs',
			},
		],
		default: 'singleSelect',
		description: 'Based on condition (index number) will pass the matching inputs',
	},
	...singleSelect.description,
	...multiSelect.description,
];
