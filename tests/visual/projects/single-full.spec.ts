import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'Single Project - full state',
	state: () => stateBuilder.forProject('personal-default'),
	url: {
		workspace: 'personal',
		view: 'project',
		project: 'personal-default'
	},
	screenshot: 'single-full.png'
});