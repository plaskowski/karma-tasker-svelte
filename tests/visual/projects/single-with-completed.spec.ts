import { visualTest, stateBuilder } from '../helpers/test-utils';

visualTest({
	name: 'Single project view - with completed tasks',
	state: () => stateBuilder.forProject('photography', { withCompleted: true }),
	url: {
		workspace: 'hobby',
		view: 'project',
		project: 'photography'
	},
	screenshot: 'single-project-with-completed.png'
});