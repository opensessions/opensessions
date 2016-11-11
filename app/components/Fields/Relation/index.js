import React, { PropTypes } from 'react';

import SearchableSelect from '../SearchableSelect';

import styles from './styles.css';

import { apiModel } from '../../utils/api';

export default class RelationField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    relation: PropTypes.object,
    className: PropTypes.string,
    props: PropTypes.object,
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
  newRelation = name => apiModel.new(this.props.relation.model, { name }).then(result => {
    this.setState({ relationState: 'none' });
    this.fetchRelation(result.instance.uuid);
  })
  handleValueChange = (value) => {
    if (this.props.onChange) this.props.onChange(value === 'none' ? null : value);
  }
  fetchRelation = value => {
    const { relation, onChange } = this.props;
    return apiModel.search(relation.model, relation.query).then(result => {
      if (value) onChange(value);
      this.setState({ options: result.instances });
    });
  }
  render() {
    const state = this.state || {};
    const { value, className, props } = this.props;
    const options = 'options' in state ? state.options : [];
    const searchableAttrs = { options, value, className };
    return (<div className={styles.relationWrap}>
      <SearchableSelect {...searchableAttrs} {...props} dispatchRefresh={this.fetchRelation} onChange={this.handleValueChange} addItem={this.newRelation} />
    </div>);
  }
}
