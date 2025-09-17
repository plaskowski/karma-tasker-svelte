import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'Inbox perspective - with completed tasks',
	state: stateBuilder.withCompleted,
	url: { view: 'perspective', perspective: 'inbox', workspace: 'hobby' },
	screenshot: 'inbox-with-completed.png'
});