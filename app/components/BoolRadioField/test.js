import BoolRadioField from './index';

import React from 'react';
import { shallow } from 'enzyme';
import expect from 'expect';

describe('<BoolRadioField />', () => {
  const renderedComponent = shallow(
    <BoolRadioField />
  );
  const radios = renderedComponent.find('input[type="radio"]');
  it('should render two option buttons', () => {
    expect(radios).to.have.length(2);
  });
  it('should be off by default', () => {
    expect(radios[0].prop('value')).toEqual('true');
    expect(radios[0].prop('selected')).toEqual(false);
  });
});
