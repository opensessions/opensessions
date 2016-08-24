import React from 'react';

import styles from './styles.css';

export default class IconRadioField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    options: React.PropTypes.array,
  }
  handleChange = (event) => {
    const { value } = event.target;
    this.props.onChange(value);
  }
  render() {
    const { value } = this.props;
    const attrs = {
      onChange: this.handleChange,
    };
    const radios = (<ol>
      {this.props.options.map((option) => {
        const selected = option.value === value;
        const icon = option.icon ? option.icon : <img src={selected ? option.selectedSrc : option.src} role="presentation" />;
        return (<li className={selected ? styles.selected : ''} key={option.value}>
          <label>
            {icon}
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
