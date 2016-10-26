import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class GenericForm extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool
  };
  render() {
    return (<div className={`${styles.form} ${this.props.disabled ? styles.disabled : null}`}>
      {this.props.children}
    </div>);
  }
}
