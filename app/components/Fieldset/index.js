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
  }
  render() {
    return (
      <fieldset className={styles.fieldset}>
        {this.props.children}
      </fieldset>
    );
  }
}
