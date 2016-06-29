import React from 'react';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    label: React.PropTypes.string.isRequired,
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    relationURL: React.PropTypes.string,
    relationQuery: React.PropTypes.object,
    id: React.PropTypes.string,
    onChange: React.PropTypes.func,
    tip: React.PropTypes.string,
    type: React.PropTypes.string,
    validation: React.PropTypes.object,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      valid: undefined,
    };
    this.handleChange = this.handleChange.bind(this);
    if (props.type === 'relation') {
      this.fetchRelation(this.props.relationQuery);
    }
  }
  fetchRelation(query, value) {
    const self = this;
    return apiFetch(this.props.relationURL, { query }).then((options) => {
      if (typeof value === 'undefined' && options[0]) value = options[0].uuid;
      self.setState({ options, value });
    });
  }
  handleChange(event) {
    const value = event.target.value;
    const state = { value };
    if (this.props.validation) {
      state.valid = this.isValid(value);
    }
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    if (this.props.model) {
      this.props.model.update(this.props.name, value);
    }
  }
  isValid(value) {
    if (typeof value === 'undefined') value = this.state.value;
    const opts = this.props.validation || '';
    let valid = true;
    if (opts.maxLength) {
      if (value.length > opts.maxLength) {
        valid = false;
      }
    } else if (value.length === 0) {
      valid = false;
    }
    this.setState({ valid });
    return valid;
  }
  renderValidationMaxLength() {
    const maxLength = this.props.validation.maxLength;
    let num = maxLength - this.state.value.length;
    let urgency = styles.valid;
    let characterState = 'remaining';
    if (num / maxLength < .25) {
      urgency = styles.danger;
    } else if (num / maxLength < .5) {
      urgency = styles.warn;
    }
    if (num < 0) {
      num = 0 - num;
      characterState = 'too many';
    }
    const characters = num === 1 ? 'character' : 'characters';
    return <div className={styles.maxLength}><span className={urgency}>{num}</span> {characters} {characterState}</div>;
  }
  renderValidation() {
    const opts = this.props.validation;
    if (!opts) return false;
    if (opts.maxLength) {
      return this.renderValidationMaxLength();
    }
    return false;
  }
  render() {
    let label = this.props.label;
    const validClass = this.state.valid === false ? styles.invalid : '';
    const attrs = {
      onChange: this.handleChange,
      className: `${styles.input} ${validClass}`,
      name: this.props.name,
      value: this.state.value,
      id: this.props.id || this.props.name,
    };
    if (this.props.model) {
      attrs.value = this.props.model[this.props.name] || '';
    }
    let input;
    const type = this.props.type || 'text';
    if (type === 'textarea') {
      input = <textarea {...attrs} />;
    } else if (type === 'relation') {
      const options = this.state.options || [];
      const onClick = (event) => {
        event.preventDefault();
        this.setState({ relationState: 'typeNew' });
      };
      const onKeyDown = (event) => {
        if (event.keyCode === 8 && !event.target.value) {
          this.setState({ relationState: 'none' });
          return;
        } else if (event.keyCode !== 13) {
          return;
        }
        event.preventDefault();
        apiFetch(`${this.props.relationURL}/create`, { body: { name: event.target.value } }).then((relation) => {
          this.setState({ relationState: 'none' });
          this.fetchRelation(this.props.relationQuery, relation.uuid);
        });
      };
      let addControl = (<button onClick={onClick} className={styles.addRelation}>Add +</button>);
      if (this.state.relationState === 'typeNew') {
        addControl = (<input onKeyDown={onKeyDown} className={styles.input} autoFocus />);
      }
      let selectBox = null;
      if (options.length) {
        selectBox = (<select {...attrs} defaultValue={this.state.value}>
          <option value="">None</option>
          {options.map((option) => <option value={option.uuid}>{option.name}</option>)}
        </select>);
      }
      input = (<div className={styles.relationWrap}>
        {selectBox}
        {addControl}
      </div>);
    } else {
      if (type === 'date') {
        const date = new Date(attrs.value);
        attrs.value = date.toLocaleDateString()
          .split('/')
          .reverse()
          .join('-');
      }
      attrs.type = type;
      input = <input {...attrs} />;
    }
    let tip;
    if (this.props.tip) {
      tip = (<div className={styles.tip}>
        <strong>{label}</strong>
        <p>{this.props.tip}</p>
      </div>);
    }
    return (
      <div className={styles.field} data-valid={this.state.valid}>
        <label className={styles.label}>{label}</label>
        <div className={styles.inputWrap}>
          {input}
          {tip}
          {this.renderValidation()}
        </div>
      </div>
    );
  }
}
