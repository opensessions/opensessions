import BoolRadioField from './index';

import React from 'react';
import { shallow } from 'enzyme';
import expect from 'expect';

describe('<BoolRadioField />', () => {
  const renderedComponent = shallow(
    <BoolRadioField name="test" />
  );
  const radios = renderedComponent.find('input[type="radio"]');
  it('should render two option buttons', () => {
    expect(radios.length).toEqual(2);
  });
  it('should be off by default', () => {
    const firstRadio = radios.at(0);
    expect(firstRadio.prop('value')).toEqual('true');
    expect(firstRadio.prop('checked')).toNotEqual(true);
  });
});
