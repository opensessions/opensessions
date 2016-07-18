import React from 'react';

import styles from './styles.css';

export default class IconRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    options: React.PropTypes.array,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  handleChange = (event) => {
    const { value } = event.target;
    const state = { value };
    this.setState(state);
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  render() {
    const attrs = {
      onChange: this.handleChange,
      name: this.props.name,
    };
    const { value } = this.state;
    const radios = (<ol>
      {this.props.options.map((option) => {
        const selected = option.value === value;
        return (<li className={selected ? styles.selected : ''} key={option.value}>
          <label>
            <img src={selected ? option.selectedSrc : option.src} role="presentation" />
            {option.text}
            <input type="radio" value={option.value} selected={selected} {...attrs} />
          </label>
        </li>);
      })}
    </ol>);
    return (<div className={styles.iconRadio}>
      {radios}
    </div>);
  }
}
