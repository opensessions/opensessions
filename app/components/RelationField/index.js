import React from 'react';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class RelationField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    inputStyle: React.PropTypes.string,
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    relation: React.PropTypes.object,
  }
  componentDidMount() {
    this.fetchRelation();
  }
  onInputEvents = (event) => {
    const { value } = event.target;
    const ENTER_KEY = 13;
    if (event.type === 'blur' && !value) {
      this.setState({ relationState: 'none' });
    } else if (event.type === 'keypress' && event.charCode !== ENTER_KEY) {
      event.stopPropagation();
    } else {
      event.preventDefault();
      if (!value) return;
      apiFetch(`${this.props.relation.url}/create`, { body: { name: value } }).then((result) => {
        this.setState({ relationState: 'none' });
        this.fetchRelation(result.instance.uuid);
      });
    }
  }
  onAdd = (event) => {
    event.preventDefault();
    this.setState({ relationState: 'typeNew' });
  }
  handleChange = (event) => {
    const value = event.target.value;
    if (this.props.onChange) this.props.onChange(value === 'none' ? null : value);
  }
  fetchRelation(value) {
    const self = this;
    return apiFetch(this.props.relation.url, { query: this.props.relation.query }).then((result) => {
      self.props.model.update(self.props.name, value);
      self.setState({ options: result.instances });
    });
  }
  render() {
    const state = this.state || {};
    let addControl = (<button onClick={this.onAdd} className={styles.addRelation}>Add +</button>);
    if (state.relationState === 'typeNew') {
      addControl = <input onKeyPress={this.onInputEvents} onBlur={this.onInputEvents} className={this.props.inputStyle} type="text" autoFocus />;
    }
    let select = null;
    const options = 'options' in state ? state.options : [];
    if (options.length) {
      const attrs = {
        name: this.props.name,
        onChange: this.handleChange,
      };
      attrs.value = this.props.model[this.props.name];
      if (this.props.onFocus) attrs.onFocus = this.props.onFocus;
      if (this.props.onBlur) attrs.onBlur = this.props.onBlur;
      select = (<select {...attrs}>
        <option value="none">None</option>
        {options.map((option) => <option value={option.uuid} key={option.uuid}>{option.name}</option>)}
      </select>);
    }
    return (<div className={styles.relationWrap}>
      {select}
      {addControl}
    </div>);
  }
}
