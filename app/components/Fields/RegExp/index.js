import React, { PropTypes } from 'react';

import styles from './styles.css';

const startsWith = /^\/\^/;
const endsWith = /\$\/$/;
const expTypes = [
  { key: 'exact', label: 'Exact match', test: { test: exp => startsWith.test(exp) && endsWith.test(exp) } },
  { key: 'start', label: 'Starts with', test: startsWith },
  { key: 'end', label: 'Ends with', test: endsWith },
  { key: 'contain', label: 'Contains', test: /\/.*\// }
];

export default class RegExpField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func
  }
  valueOut(expType, text) {
    const starts = expType === 'start' || expType === 'exact' ? '^' : '';
    const ends = expType === 'end' || expType === 'exact' ? '$' : '';
    const value = `/${starts}${text}${ends}/`;
    this.props.onChange(value);
  }
  valueIn() {
    const { value } = this.props;
    const text = value ? value.toString() : '';
    const expType = expTypes.filter(type => type.test.test(text))[0];
    return [expType ? expType.key : '', text.replace(/^\/[\^]?/, '').replace(/[\$]?\/$/, '')];
  }
  render() {
    const [expType, text] = this.valueIn();
    return (<div className={styles.field}>
      <select value={expType || null} onChange={e => this.valueOut(e.target.value, text)}>
        <option>Match type...</option>
        {expTypes.map(type => <option key={type.key} value={type.key}>{type.label}</option>)}
      </select>
      <input value={text} type="text" onChange={e => this.valueOut(expType, e.target.value)} />
    </div>);
  }
}
