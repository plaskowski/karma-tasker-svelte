import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'All perspective - full state',
	state: stateBuilder.full,
	url: { view: 'all', workspace: 'personal' },
	screenshot: 'all-full.png'
});