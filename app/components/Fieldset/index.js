/*
 * Fieldset
 */

import React from 'react';

export default class Fieldset extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.element.isRequired,
    label: React.PropTypes.string,
  }
  render() {
    return (
      <fieldset>
        <legend>{this.props.label}</legend>
        {this.props.children}
      </fieldset>
    );
  }
}
