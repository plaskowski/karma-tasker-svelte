import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'All perspective - empty state',
	state: stateBuilder.empty,
	url: { view: 'all', workspace: 'personal' },
	screenshot: 'all-empty.png'
});