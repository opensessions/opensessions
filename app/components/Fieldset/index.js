/*
 * Fieldset
 */

import React from 'react';

import styles from './styles.css';

export default class Fieldset extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
    hidden: React.PropTypes.bool,
    label: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      hidden: this.props.hidden || false,
    };
  }
  render() {
    const hidden = this.state.hidden ? styles.hidden : '';
    return (
      <fieldset className={`${styles.fieldset} ${hidden}`}>
        <legend>{this.props.label}</legend>
        {this.props.children}
      </fieldset>
    );
  }
}
