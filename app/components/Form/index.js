/*
 * Form
 */

import React from 'react';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.element.isRequired,
    submitText: React.PropTypes.string,
  }
  render() {
    const submitText = this.props.submitText || 'Submit';
    return (
      <form>
        {this.props.children}
        <input type="submit" value={submitText} />
      </form>
    );
  }
}
