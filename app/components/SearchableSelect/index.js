import React from 'react';

import styles from './styles.css';

export default class SearchableSelect extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    onChange: React.PropTypes.func,
    addItem: React.PropTypes.func,
    className: React.PropTypes.string,
    value: React.PropTypes.any,
    options: React.PropTypes.array
  }
  constructor() {
    super();
    this.state = { search: '', filteredOptions: [], highlightIndex: 0, visible: false, ignoreBlur: false };
  }
  setValue = (value) => {
    this.props.onChange(value);
    this.setState({ visible: false, search: '', ignoreBlur: false });
    const changeEvent = new CustomEvent('input', { bubbles: true, detail: 'generated' });
    this.refs.input.dispatchEvent(changeEvent);
  }
  resetValue = () => {
    this.setValue(null);
  }
  filterOptions = (search) => {
    let opts = this.props.options;
    if (search) opts = opts.filter((option) => option.name.match(new RegExp(search, 'i')));
    return opts.map((option) => ({ text: option.name, props: { key: option.uuid, onMouseOver: this.itemHover, onClick: this.itemClick } }));
  }
  searchEvent = (event) => {
    console.log('-> searchEvent :: ', event.type, event.target.value, this.state);
    const { type, target, nativeEvent } = event;
    const { input } = this.refs;
    const { filteredOptions, highlightIndex } = this.state;
    const newState = {};
    let action;
    if (type === 'focus') {
      newState.visible = true;
      newState.search = '';
      newState.filteredOptions = this.filterOptions(newState.search);
      newState.highlightIndex = 0;
    } else if (type === 'change') {
      newState.search = target.value || '';
      newState.filteredOptions = this.filterOptions(newState.search);
      newState.highlightIndex = highlightIndex;
      if (nativeEvent.detail !== 'generated') {
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (type === 'keydown') {
      const { keyCode } = event;
      const deltas = { 38: -1, 40: 1 };
      if (keyCode in deltas) {
        newState.highlightIndex = highlightIndex + deltas[keyCode];
        event.preventDefault();
        event.stopPropagation();
      } else if (keyCode === 13) {
        action = 'chooseSelected';
      }
    } else if (type === 'blur') {
      if (!this.state.ignoreBlur) {
        if (this.state.search) {
          action = 'chooseSelected';
        } else {
          newState.visible = false;
          newState.search = '';
        }
      }
    }
    if (action === 'chooseSelected') {
      const selected = filteredOptions[highlightIndex];
      const { key } = selected.props;
      newState.search = '';
      newState.visible = false;
      newState.ignoreBlur = true;
      if (key === 'none') {
        this.addItem();
      } else {
        this.setValue(key);
      }
    }
    if (newState.highlightIndex) {
      const maxIndex = (newState.filteredOptions || filteredOptions).length - 1;
      newState.highlightIndex = [0, newState.highlightIndex, maxIndex].sort()[1];
    }
    if (newState.search === '') {
      input.value = '';
      input.blur();
    }
    if (Object.keys(newState).length) this.setState(newState);
  }
  itemHover = (event) => {
    this.setState({ highlightIndex: parseInt(event.target.dataset.index, 10) });
  }
  itemClick = (event) => {
    const value = event.target.dataset.key;
    this.setValue(value);
  }
  addItem = () => {
    const { search } = this.state;
    if (!search) return;
    this.props.addItem(search);
    this.setState({ visible: false, search: '' });
  }
  dropdownEvent = (event) => {
    const { type } = event;
    if (type === 'mouseover') this.setState({ ignoreBlur: true });
    else if (type === 'mouseout') this.setState({ ignoreBlur: false });
  }
  render() {
    const { value, options, className } = this.props;
    const { visible, search, filteredOptions } = this.state;
    const searchAttrs = {
      type: 'text',
      placeholder: 'Search...',
      className,
      onChange: this.searchEvent,
      onKeyDown: this.searchEvent
    };
    const selected = options.filter((option) => option.uuid === value)[0];
    const valueDisplay = selected ? selected.name : '';
    let input = <input {...searchAttrs} ref="input" onFocus={this.searchEvent} onBlur={this.searchEvent} defaultValue={valueDisplay} />;
    let output = <input {...searchAttrs} className={`${className} ${styles.output}`} ref="output" value={valueDisplay} style={{ opacity: visible ? 0 : 1 }} tabIndex="-1" />;
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
    const clear = <a className={styles.clear} onClick={this.resetValue}>&times;</a>;
    console.log("searchableSelect value ::", value);
    return (<div className={styles.searchableSelect}>
      {input}
      {output}
      {clear}
      {searchResults}
    </div>);
  }
}
