import React, { PropTypes } from 'react';

import { apiFetch } from '../../../utils/api';

import styles from './styles.css';

export default class MultiField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func,
    component: PropTypes.node,
    props: PropTypes.object,
    path: PropTypes.string,
  }
  onChange(value, key) {
    let list = this.props.value || [];
    if (value === null) {
      list = list.slice(0, key).concat(list.slice(key + 1));
    } else {
      list[key] = value;
    }
    apiFetch(`/api${this.props.path}/action/setActivitiesAction`, { body: { uuids: list } }).then(() => {
      this.props.onChange(list);
    }).catch(error => {
      console.error(error);
    });
  }
  render() {
    const { value, props } = this.props;
    return (<div className={styles.listBox}>
      {value
        ? value.map((item, key) => <this.props.component {...props} value={item} onChange={val => this.onChange(val, key)} />)
        : null}
      <this.props.component {...props} onChange={val => this.onChange(val, value.length || 0)} />
    </div>);
  }
}
