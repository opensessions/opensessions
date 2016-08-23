import React, { PropTypes } from 'react';

import Field from 'components/Field';

import styles from './styles.css';

export default class JSONListField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    components: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func
  }
  constructor() {
    super();
    this.state = { empty: {} };
  }
  addEmpty = () => {
    let { value } = this.props;
    if (!value) value = [];
    value.push(this.state.empty);
    this.props.onChange(value);
    this.setState({ empty: {} });
  }
  deleteRow = deleteKey => {
    console.log('deleteRow', deleteKey);
    let { value } = this.props;
    if (!value) value = [];
    value = value.filter((row, key) => key !== deleteKey);
    this.props.onChange(value);
  }
  renderEmptyRow() {
    let { empty } = this.state;
    if (!empty) empty = {};
    empty.update = (name, value) => {
      console.log('empty.update', name, value, this.state);
      empty[name] = value;
      this.setState({ empty });
    };
    return this.renderRow('-1', empty, this.renderAddButton());
  }
  renderAddButton() {
    return <a onClick={this.addEmpty} className={styles.addButton}>+ Add another date</a>;
  }
  renderDeleteButton(key) {
    return <a onClick={this.deleteRow.bind(this, key)}><img src="/images/garbage.svg" role="presentation" /></a>;
  }
  renderLabels() {
    const { components } = this.props;
    return (<li key="labels">
      <ol className={styles.row}>
        {components.map(field => {
          return <li>{field.label}</li>;
        })}
        <li></li>
      </ol>
    </li>);
  }
  renderRow(key, row, button) {
    const { components } = this.props;
    if (!row.update) row.update = (name, value) => {
      console.log('row.update', name, value);
      let list = this.props.value;
      list[key][name] = value;
      this.props.onChange(list);
    };
    return (<li key={key}>
      <ol className={styles.row}>
        {components.map(field => {
          const attrs = {
            fullSize: true,
            model: row,
            label: ''
          };
          return <li><Field {...field} {...attrs} /></li>;
        })}
        <li>{button}</li>
      </ol>
    </li>);
  }
  render() {
    const { components, value } = this.props;
    return (<ol className={styles.list}>
      {this.renderLabels()}
      {this.renderEmptyRow()}
      {value ? value.map((row, key) => this.renderRow(key, row, this.renderDeleteButton(key))) : null}
    </ol>);
  }
}
