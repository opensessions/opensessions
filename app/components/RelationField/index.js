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
    this.onInputEvents = this.onInputEvents.bind(this);
    this.fetchRelation();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value !== this.props.value ) {
      this.setState({ value: nextProps.value });
    }
  }
  fetchRelation(value) {
    const self = this;
    return apiFetch(this.props.relationURL, { query: this.props.relationQuery }).then((result) => {
      self.props.model.update(self.props.name, value);
      self.setState({ options: result.instances, value });
    });
  }
  onInputEvents(event) {
    if ((event.type === 'blur' && !event.target.value) || (event.type === 'keypress' && !event.target.value && event.charCode === 8)) {
      this.setState({ relationState: 'none' });
      return;
    } else if (event.type === 'keypress' && event.charCode !== 13) {
      return;
    }
    event.preventDefault();
    apiFetch(`${this.props.relationURL}/create`, { body: { name: event.target.value } }).then((relation) => {
      this.setState({ relationState: 'none' });
      this.fetchRelation(relation.uuid);
    });
  }
  render() {
    const self = this;
    const onClick = (event) => {
      event.preventDefault();
      this.setState({ relationState: 'typeNew' });
    };
    let addControl = (<button onClick={onClick} className={styles.addRelation}>Add +</button>);
    if (this.state.relationState === 'typeNew') {
      addControl = (<input onKeyPress={this.onInputEvents} onBlur={this.onInputEvents} className={this.props.inputStyle} type="text" autoFocus />);
    }
    let selectBox = null;
    const options = this.state.options || [];
    if (options.length) {
      const attrs = {
        name: this.props.name,
        defaultValue: this.state.value,
        onChange: this.props.onChange,
      };
      if (this.state.value) {
        attrs.defaultValue = this.state.value;
        attrs.value = this.state.value;
      } else if (this.props.model) {
        attrs.defaultValue = this.props.model[this.props.name];
      }
      selectBox = (<select {...attrs}>
        <option value="">None</option>
        {options.map((option) => <option value={option.uuid} key={option.uuid}>{option.name}</option>)}
      </select>);
    }
    return (<div className={styles.relationWrap}>
      {selectBox}
      {addControl}
    </div>);
  }
}
