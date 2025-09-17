import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'Inbox perspective - empty state',
	state: stateBuilder.empty,
	url: { view: 'perspective', perspective: 'inbox', workspace: 'personal' },
	screenshot: 'inbox-empty.png'
});