import expect from 'expect';
import React from 'react';
import { shallow, mount } from 'enzyme';

import HomePage from './index';

describe('<HomePage />', () => {
	it('should link to the add session page', () => {
		const renderedComponent = mount(
			<HomePage />
		)
		expect(
			renderedComponent.find('a').filter('[href="/add-session"]').length
		).toBeGreaterThan(0)
	})
})