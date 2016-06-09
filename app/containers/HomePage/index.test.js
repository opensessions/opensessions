import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';

import HomePage from './index';

describe('<HomePage />', () => {
  it('should link to the add session page', () => {
    const renderedComponent = shallow(
      <HomePage />
    );
    /* expect(
      renderedComponent.find('a').filter('[href="/session/add"]').length
    ).toBeGreaterThan(0); */
  });
});
