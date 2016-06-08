/*
 * Fieldset
 */

import React from 'react';

export default class Fieldset extends React.Component { // eslint-disable-line react/prefer-stateless-function
  propTypes: {
    children: React.PropTypes.element.isRequired,
  }
  render() {
    return (
      <fieldset>
        {this.props.children}
      </fieldset>
    );
  }
}
