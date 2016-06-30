import React from 'react';

import styles from './styles.css';

import { apiFetch } from '../../utils/api';

export default class RelationField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    model: React.PropTypes.object,
    name: React.PropTypes.string.isRequired,
    relationURL: React.PropTypes.string,
    id: React.PropTypes.id,
    onChange: React.PropTypes.func,
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
      this.fetchRelation();
    }
  }
  fetchRelation(query) {
    const self = this;
    return apiFetch(this.props.relationURL, { query }).then((options) => {
      self.setState({ options });
    });
  }
  handleChange(event) {
    const value = event.target.value;
    const state = { value };
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(event);
    }
    if (this.props.model) {
      this.props.model.update(this.props.name, value);
    }
  }
  render() {
    const attrs = {
      onChange: this.handleChange,
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
    const onKeyDown = (event) => {
      if (event.keyCode === 8 && !event.target.value) {
        this.setState({ relationState: 'none' });
        return;
      } else if (event.keyCode !== 13) {
        return;
      }
      event.preventDefault();
      apiFetch(`${this.props.relationURL}/create`, { body: { name: event.target.value } }).then((relation) => {
        this.setState({ value: relation.uuid, relationState: 'none' });
        this.fetchRelation();
      });
    };
    let addControl = (<button onClick={onClick} className={styles.addRelation}>Add +</button>);
    if (this.state.relationState === 'typeNew') {
      addControl = (<input onKeyDown={onKeyDown} className={styles.input} autoFocus />);
    }
    let selectBox = null;
    if (options.length) {
      selectBox = (<select {...attrs} defaultValue={this.state.value}>
        {options.map((option) => <option value={option.uuid}>{option.name}</option>)}
      </select>);
    }
    const input = (<div>
      {addControl}
      {selectBox}
    </div>);
    return input;
  }
}
