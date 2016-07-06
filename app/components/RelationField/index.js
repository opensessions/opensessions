import React from 'react';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class RelationField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    inputStyle: React.PropTypes.string,
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    relationURL: React.PropTypes.string,
    relationQuery: React.PropTypes.object,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
    };
    this.fetchRelation(this.props.relationQuery);
  }
  fetchRelation(query, value) {
    const self = this;
    return apiFetch(this.props.relationURL, { query }).then((result) => {
      if (typeof value === 'undefined' && result.instances[0]) value = result.instances[0].uuid;
      this.props.model.update(this.props.name, value);
      self.setState({ options: result.instances, value });
    });
  }
  render() {
    const attrs = {
      onChange: this.props.onChange,
      name: this.props.name,
      value: this.state.value,
      id: this.props.id || this.props.name,
    };
    if (this.props.model) {
      attrs.value = this.props.model[this.props.name];
    }
    const options = this.state.options || [];
    const onClick = (event) => {
      event.preventDefault();
      this.setState({ relationState: 'typeNew' });
    };
    const inputEvents = (event) => {
      if ((event.type === 'blur' && !event.target.value) || (event.type === 'keypress' && !event.target.value && event.charCode === 8)) {
        this.setState({ relationState: 'none' });
        return;
      } else if (event.type === 'keypress' && event.charCode !== 13) {
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
      addControl = (<input onKeyPress={inputEvents} onBlur={inputEvents} className={this.props.inputStyle} type="text" autoFocus />);
    }
    let selectBox = null;
    if (options.length) {
      selectBox = (<select {...attrs} defaultValue={this.state.value}>
        <option value="">None</option>
        {options.map((option) => <option value={option.uuid}>{option.name}</option>)}
      </select>);
    }
    return (<div className={styles.relationWrap}>
      {selectBox}
      {addControl}
    </div>);
  }
}
