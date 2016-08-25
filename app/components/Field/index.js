import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: PropTypes.string,
    tip: PropTypes.string,
    tipTitle: PropTypes.string,
    example: PropTypes.string,
    fullSize: PropTypes.bool,
    element: PropTypes.node,
    children: PropTypes.node
  };
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      hasFocus: false
    };
  }
  onFocusChange = (event) => {
    this.setState({ hasFocus: event.type === 'focus' });
  }
  render() {
    const { label, fullSize, tip, tipTitle, example, element, children } = this.props;
    let input;
    if (element) {
      input = element;
    } else if (children) {
      input = children;
    }
    let tooltip;
    if (tip) {
      tooltip = (<div className={styles.tip}>
        <strong>{tipTitle || label}</strong>
        <p>{tip}</p>
        {example ? <p className={styles.example}>{example}</p> : null}
      </div>);
    }
    return (<div className={styles.field} data-valid={this.state.valid} data-hasfocus={this.state.hasFocus} onFocus={this.onFocusChange} onBlur={this.onFocusChange}>
      <label className={styles.label}>{label}</label>
      <div className={fullSize ? '' : styles.inputWrap}>
        {input}
      </div>
      {tooltip}
    </div>);
  }
}
