import React from 'react';

import styles from './styles.css';

export default class IconRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    name: React.PropTypes.string.isRequired,
    id: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    options: React.PropTypes.array,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
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
    };
    const value = this.state.value;
    const radios = (<ol>
      {this.props.options.map((option) => {
        const selected = option.value === value;
        return (<li className={selected ? styles.selected : ''}>
          <label>
            <img src={selected ? option.selectedSrc : option.src} role="presentation" />
            {option.text}
            <input type="radio" value={option.value} selected={selected} {...attrs} />
          </label>
        </li>);
      })}
    </ol>);
    return (
      <div className={styles.iconRadio}>
        {radios}
      </div>
    );
  }
}