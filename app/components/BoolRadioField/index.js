import React from 'react';

import styles from './styles.css';

export default class BoolRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    options: React.PropTypes.array,
    trueText: React.PropTypes.string,
    falseText: React.PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: this.valueFromProps(props)
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ value: this.valueFromProps(nextProps) });
  }
  valueFromProps(props) {
    return props.hasOwnProperty('value') && props.value.toString ? props.value.toString() : 'false';
  }
  handleChange(event) {
    const value = event.target.value;
    const state = { value };
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }
  render() {
    const attrs = {
      onChange: this.handleChange,
      name: this.props.name,
      id: this.props.id || this.props.name,
      type: 'radio'
    };
    const value = this.state.value;
    const options = [
      {
        value: 'true',
        text: this.props.trueText
      },
      {
        value: 'false',
        text: this.props.falseText
      }
    ];
    const radios = (<ol>
      {options.map((option) => {
        const checked = option.value === value;
        return (<li className={checked ? styles.selected : ''} key={option.value}>
          <label>
            <input value={option.value} checked={checked} {...attrs} />
            {option.text}
          </label>
        </li>);
      })}
    </ol>);
    return (<div className={styles.boolRadio}>
      {radios}
    </div>);
  }
}
