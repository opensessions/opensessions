import React, { PropTypes } from 'react';

import styles from './styles.css';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    labelComponent: PropTypes.object, // used if label is a component for example when the field is overridden (taken from organiser)
    label: PropTypes.string,
    tipType: PropTypes.string,
    tip: PropTypes.string,
    tipTitle: PropTypes.string,
    example: PropTypes.string,
    fullSize: PropTypes.bool,
    children: PropTypes.node,
    index: PropTypes.number
  };
  static contextTypes = {
    store: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.state = {
      hasFocus: false
    };
  }
  onFocusChange = event => {
    this.context.store.dispatch({ type: 'FORM_FOCUS', payload: this.props.index });
    this.setState({ hasFocus: event.type === 'focus' });
  }
  renderTooltip() {
    const { label, tipType, tip, tipTitle, example } = this.props;
    return (<div className={[styles.tip, tipType ? styles[tipType] : styles.tipFloat].join(' ')}>
      <strong>{tipTitle || label}</strong>
      <p>{tip}</p>
      {example ? <p className={styles.example}>{example}</p> : null}
    </div>);
  }
  render() {
    const { label, labelComponent, fullSize, tip, children } = this.props;
    const labelToUse = labelComponent || label;
    return (
      <div className={styles.field} data-hasfocus={this.state.hasFocus} onFocus={this.onFocusChange} onBlur={this.onFocusChange}>
        <label className={styles.label}>{labelToUse}</label>
        <div className={fullSize ? '' : styles.inputWrap}>
          {children}
        </div>
        {tip ? this.renderTooltip() : null}
      </div>
    );
  }
}
