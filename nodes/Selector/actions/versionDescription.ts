/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { type INodeTypeDescription } from 'n8n-workflow';

import * as mode from './mode';
import {singleSelect} from "./mode";
import {configuredInputs} from "../helpers/utils";

export const versionDescription: INodeTypeDescription = {
	displayName: 'Selector',
	name: 'selector',
	group: ['transform'],
	icon: 'file:./selector.svg',
	description: 'Switch between inputs based on a condition',
	version: [1],
	defaults: {
			name: 'Selector',
	},
	inputs: `={{ $parameter["mode"] === "singleSelect" ? (${JSON.stringify(singleSelect.inputs)}) : ((${configuredInputs})($parameter)) }}`,
	outputs: ['main'],
	properties: [...mode.description],
};
