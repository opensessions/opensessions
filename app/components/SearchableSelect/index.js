import React from 'react';

import styles from './styles.css';

export default class SearchableSelect extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    addItem: React.PropTypes.func,
    inputStyle: React.PropTypes.string,
    value: React.PropTypes.any,
    options: React.PropTypes.array
  }
  constructor() {
    super();
    this.state = { search: '', filteredOptions: [], highlightIndex: 0, visible: false };
  }
  onChange = (value) => {
    this.props.onChange(value);
    this.setState({ visible: false, search: '' });
  }
  filterOptions = (search) => {
    let opts = this.props.options;
    if (search) opts = opts.filter((option) => option.name.match(new RegExp(search, 'i')));
    return opts.map((option) => ({ text: option.name, props: { key: option.uuid, onMouseOver: this.itemHover, onClick: this.itemClick } }));
  }
  searchEvent = (event) => {
    const { type, target } = event;
    const { input, output } = this.refs;
    const newState = {};
    if (type === 'change') {
      newState.search = target.value || '';
      newState.filteredOptions = this.filterOptions(newState.search);
    } else if (type === 'keydown') {
      const { keyCode } = event;
      const { filteredOptions, highlightIndex } = this.state;
      const deltas = { 38: -1, 40: 1 };
      if (keyCode in deltas) {
        const maxIndex = filteredOptions.length - 1;
        newState.highlightIndex = [0, highlightIndex + deltas[keyCode], maxIndex].sort()[1];
        event.preventDefault();
      } else if (keyCode === 13) {
        const selected = filteredOptions[highlightIndex];
        const { key } = selected.props;
        if (key === 'none') {
          this.addItem(newState.search);
        } else {
          this.onChange(key);
        }
      }
    } else if (type === 'click') {
      newState.visible = true;
      newState.filteredOptions = this.filterOptions(this.state.search);
      newState.search = output.value;
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);
      if (this.props.onFocus) this.props.onFocus(event);
    } else if (type === 'blur') {
      if (!this.state.ignoreBlur) {
        this.setState({ visible: false, search: '' });
      }
      if (this.props.onBlur) this.props.onBlur(event);
    }
    this.setState(newState);
  }
  itemHover = (event) => {
    this.setState({ highlightIndex: parseInt(event.target.dataset.index, 10) });
  }
  itemClick = (event) => {
    const value = event.target.dataset.key;
    this.onChange(value);
  }
  addItem = () => {
    this.props.addItem(this.state.search);
    this.setState({ visible: false, search: '' });
  }
  dropdownEvent = (event) => {
    const { type } = event;
    if (type === 'mouseover') {
      this.setState({ ignoreBlur: true });
    } else if (type === 'mouseout') {
      this.setState({ ignoreBlur: false });
    }
  }
  render() {
    const { value, options, inputStyle } = this.props;
    const { visible, search, filteredOptions } = this.state;
    const searchAttrs = {
      type: 'text',
      placeholder: 'None',
      className: inputStyle,
      onChange: this.searchEvent,
      onKeyDown: this.searchEvent
    };
    const selected = options.filter((option) => option.uuid === value)[0];
    const valueDisplay = selected ? selected.name : 'None';
    let input = <input {...searchAttrs} ref="input" onBlur={this.searchEvent} defaultValue={search || valueDisplay} style={{ visibility: visible ? 'visible' : 'hidden' }} autoFocus />;
    let output = <input {...searchAttrs} ref="output" onClick={this.searchEvent} value={valueDisplay} style={{ visibility: visible ? 'hidden' : 'visible' }} />;
    let searchResults = null;
    if (visible) {
      let index = -1;
      if (!filteredOptions.length) {
        filteredOptions.unshift({ props: { key: 'none', onClick: this.addItem }, text: `+ Add "${search}"` });
      }
      searchResults = (<ol className={styles.searchResults} onMouseOver={this.dropdownEvent} onMouseOut={this.dropdownEvent}>
        {filteredOptions.map((opt) => {
          index += 1;
          return <li data-key={opt.props.key} data-index={index} {...opt.props} className={index === this.state.highlightIndex ? styles.highlight : null} dangerouslySetInnerHTML={{ __html: opt.text.replace(new RegExp(`(${search})`, 'ig'), '<b>$1</b>') }} />;
        })}
      </ol>);
    }
    return (<div className={styles.searchableSelect}>
      {input}
      {output}
      {searchResults}
    </div>);
  }
}
