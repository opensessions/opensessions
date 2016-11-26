import React, { PropTypes } from 'react';

import Button from '../../Button';

import styles from './styles.css';

const duplicateObject = original => {
  const duplicate = {};
  Object.keys(original).forEach(key => {
    duplicate[key] = original[key];
  });
  return duplicate;
};

export default class JSONListField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    components: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func,
    onAddEmpty: PropTypes.func,
    addText: PropTypes.string,
    maxLength: PropTypes.number
  }
  constructor() {
    super();
    this.state = { empty: {} };
  }
  getValue() {
    return this.props.value || [];
  }
  addEmpty = () => {
    const { onChange, onAddEmpty } = this.props;
    const { empty } = this.state;
    const value = this.getValue();
    let newRow;
    if (value.length) {
      newRow = duplicateObject(value.slice(-1)[0]);
      if (onAddEmpty) newRow = onAddEmpty(newRow);
    } else {
      newRow = duplicateObject(empty);
    }
    value.push(newRow);
    onChange(value);
    this.setState({ empty: {} });
  }
  clearRow = event => {
    let { target } = event;
    if (!target.dataset.key) target = target.parentNode;
    const key = parseInt(target.dataset.key, 10);
    const value = this.getValue();
    value[key] = {};
    this.props.onChange(value);
  }
  deleteRow = event => {
    let { target } = event;
    if (!target.dataset.key) target = target.parentNode;
    const deleteKey = parseInt(target.dataset.key, 10);
    let value = this.getValue();
    value = value.filter((row, key) => key !== deleteKey);
    this.props.onChange(value);
  }
  renderAdd() {
    return <Button onClick={this.addEmpty} className={styles.addButton}><b>+</b> {this.props.addText}</Button>;
  }
  renderClear(key) {
    return <span className={styles.delButton} onClick={this.clearRow} key={key} data-key={key}><b>×</b> Clear row</span>;
  }
  renderDelete(key) {
    return <span tabIndex={0} className={styles.delButton} onKeyUp={event => event.keyCode === 13 && event.target.click()} onClick={this.deleteRow} key={key} data-key={key}><b>×</b> Delete row</span>;
  }
  renderLabels() {
    const { components } = this.props;
    return (<li key="labels">
      <ol className={styles.row}>
        {components.map(field => <li key={field.label}>{field.label}</li>)}
        <li />
      </ol>
    </li>);
  }
  renderRow(key, row, button) {
    const { components } = this.props;
    return (<li key={key}>
      <ol className={styles.row}>
        {components.map(field => {
          const { name } = field.props;
          const attrs = {
            fullSize: true,
            label: '',
            onChange: value => {
              if (key === '-1') {
                let { empty } = this.state;
                if (!empty) empty = {};
                empty[name] = value;
                if (Object.keys(empty).length) this.addEmpty();
                else this.setState({ empty });
              } else {
                const list = this.props.value;
                list[key][name] = value;
                this.props.onChange(list);
              }
            },
            value: row[name]
          };
          return <li key={field.label}><field.Component {...field.props} {...attrs} /></li>;
        })}
        <li key="action">{button}</li>
      </ol>
    </li>);
  }
  render() {
    const { value, maxLength } = this.props;
    let { empty } = this.state;
    if (!empty) empty = {};
    // const rowIsEmpty = row => Object.keys(row).length === 0;
    return (<div className={styles.listBox}>
      <ol className={styles.list}>
        {this.renderLabels()}
        {value ? value.map((row, key) => this.renderRow(key, row, this.renderDelete(key))) : null}
      </ol>
      {!value || (!maxLength || value.length < maxLength) ? this.renderAdd() : <p className={styles.maxReached}>Open Sessions is still in 'beta' mode. You have reached the maximum number of sessions that can be scheduled</p>}
    </div>);
  }
}
