import type { IExecuteFunctions } from 'n8n-workflow';

import * as mode from './mode';
import type { SelectorType } from './node.type';
import { getNodeInputsData } from '../helpers/utils';

export async function router(this: IExecuteFunctions) {
	const inputsData = getNodeInputsData.call(this);
	let operationMode = this.getNodeParameter('mode', 0) as string;

	return await mode[operationMode as SelectorType].execute.call(this, inputsData);
}
