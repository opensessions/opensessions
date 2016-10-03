import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: PropTypes.string,
    tipType: PropTypes.string,
    tip: PropTypes.string,
    tipTitle: PropTypes.string,
    example: PropTypes.string,
    fullSize: PropTypes.bool,
    children: PropTypes.node
  }
  constructor(props) {
    super(props);
    this.state = {
      hasFocus: false
    };
  }
  onFocusChange = event => this.setState({ hasFocus: event.type === 'focus' })
  renderTooltip() {
    const { label, tipType, tip, tipTitle, example } = this.props;
    return (<div className={[styles.tip, tipType ? styles[tipType] : styles.tipFloat].join(' ')}>
      <strong>{tipTitle || label}</strong>
      <p>{tip}</p>
      {example ? <p className={styles.example}>{example}</p> : null}
    </div>);
  }
  render() {
    const { label, fullSize, tip, children } = this.props;
    return (<div className={styles.field} data-hasfocus={this.state.hasFocus} onFocus={this.onFocusChange} onBlur={this.onFocusChange}>
      <label className={styles.label}>{label}</label>
      <div className={fullSize ? '' : styles.inputWrap}>
        {children}
      </div>
      {tip ? this.renderTooltip() : null}
    </div>);
  }
}
