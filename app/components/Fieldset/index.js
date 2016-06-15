/*
 * Fieldset
 */

import React from 'react';

import styles from './styles.css';

export default class Fieldset extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
    label: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange() {
    console.log(this.children.map((child) => child._owner._instance.state.valid));
  }
  render() {
    return (
      <fieldset className={styles.fieldset} onInput={this.onChange}>
        {this.props.children}
      </fieldset>
    );
  }
}
