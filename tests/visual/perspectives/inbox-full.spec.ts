import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'Inbox perspective - full state',
	state: stateBuilder.full,
	url: { view: 'perspective', perspective: 'inbox', workspace: 'personal' },
	screenshot: 'inbox-full.png'
});