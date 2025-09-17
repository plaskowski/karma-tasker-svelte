import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'First perspective - empty state',
	state: stateBuilder.empty,
	url: { view: 'perspective', perspective: 'first', workspace: 'personal' },
	screenshot: 'first-empty.png'
});