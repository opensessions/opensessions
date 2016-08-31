import React, { PropTypes } from 'react';

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
    addText: PropTypes.string
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
    const newRow = duplicateObject(value.length ? value.slice(-1)[0] : empty);
    if (onAddEmpty) onAddEmpty(newRow);
    value.push(newRow);
    onChange(value);
    this.setState({ empty: {} });
  }
  deleteRow = event => {
    let { target } = event;
    if (!target.dataset.key) target = target.parentNode;
    const deleteKey = parseInt(target.dataset.key, 10);
    let value = this.getValue();
    value = value.filter((row, key) => key !== deleteKey);
    this.props.onChange(value);
  }
  renderAddButton() {
    return <a onClick={this.addEmpty} className={styles.addButton}>+ {this.props.addText}</a>;
  }
  renderDeleteButton(key) {
    return <img src="/images/garbage.svg" role="presentation" className={styles.delButton} onClick={this.deleteRow} key={key} data-key={key} />;
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
                if (Object.keys(empty).length === components.length) this.addEmpty();
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
    const { value } = this.props;
    let { empty } = this.state;
    if (!empty) empty = {};
    return (<div className={styles.listBox}>
      <ol className={styles.list}>
        {this.renderLabels()}
        {value && value.length ? null : this.renderRow('-1', empty, null)}
        {value ? value.map((row, key) => this.renderRow(key, row, this.renderDeleteButton(key))) : null}
        <li>{this.renderAddButton()}</li>
      </ol>
    </div>);
  }
}
