import React from 'react';

import SearchableSelect from 'components/SearchableSelect';

import styles from './styles.css';

import { apiModel } from '../../utils/api';

export default class RelationField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    className: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
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
      this.newRelation(value);
    }
  }
  onAdd = (event) => {
    event.preventDefault();
    this.setState({ relationState: 'typeNew' });
  }
  newRelation = (name) => {
    apiModel.new(this.props.relation.model, { name }).then((result) => {
      this.setState({ relationState: 'none' });
      this.fetchRelation(result.instance.uuid);
    });
  }
  handleValueChange = (value) => {
    if (this.props.onChange) this.props.onChange(value === 'none' ? null : value);
  }
  fetchRelation(value) {
    return apiModel.search(this.props.relation.model, this.props.relation.query).then((result) => {
      if (value) this.props.onChange(value);
      this.setState({ options: result.instances });
    });
  }
  render() {
    const state = this.state || {};
    const options = 'options' in state ? state.options : [];
    const searchableAttrs = { options, value: this.props.value, onFocus: this.props.onFocus, onBlur: this.props.onBlur };
    return (<div className={styles.relationWrap}>
      <SearchableSelect {...searchableAttrs} onChange={this.handleValueChange} className={this.props.className} addItem={this.newRelation} />
    </div>);
  }
}
