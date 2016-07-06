import BoolRadioField from './index';

import React from 'react';
import { shallow } from 'enzyme';
import expect from 'expect';

describe('<BoolRadioField />', () => {
  it('should be off by default', () => {
    const renderedComponent = shallow(
      <BoolRadioField />
    );
    expect(renderedComponent.find('input[type="radio"]').prop('selected')).toEqual(false);
  });
});
