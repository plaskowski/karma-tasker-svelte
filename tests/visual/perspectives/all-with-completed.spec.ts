import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'All view - with completed tasks',
	state: stateBuilder.withCompleted,
	url: { view: 'all', workspace: 'hobby' },
	screenshot: 'all-with-completed.png'
});