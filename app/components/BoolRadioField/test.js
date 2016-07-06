import BoolRadioField from './index';

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';

describe('<BoolRadioField />', () => {
  it('should be off by default', () => {
    const renderedComponent = shallow(
      <BoolRadioField />
    );
    expect(renderedComponent.find('input[type="radio"]').prop('selected')).toEqual(false);
  });
});
