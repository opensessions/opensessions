/*
 * Field
 */

import React from 'react';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || '',
    };
  }
  render() {
    let type = this.props.type || 'text';
    let name = this.props.name;
    let input = <input className={styles.input} type={type} name={name} value={this.value} />;
    if (type === 'textarea') {
      input = <textarea className={styles.input} name={name} value={this.value} />;
    }
    return (
      <div className={styles.field}>
        <label className={styles.label}>{this.props.label}</label>
        {input}
      </div>
    );
  }
}
