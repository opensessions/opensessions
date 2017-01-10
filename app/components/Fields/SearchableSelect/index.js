import React, { PropTypes } from 'react';

import { apiFetch } from '../../../utils/api';

import styles from './styles.css';

export default class SearchableSelect extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    value: PropTypes.any,
    onChange: PropTypes.func,
    autoFocus: PropTypes.bool,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    addItem: PropTypes.func,
    dispatchRefresh: PropTypes.func,
    className: PropTypes.string,
    lazyLoad: PropTypes.bool,
    maxOptions: PropTypes.number
  }
  constructor(props) {
    super();
    const { autoFocus } = props;
    this.state = { search: '', filteredOptions: [], highlightIndex: -1, visible: !!autoFocus, autoFocus };
  }
  setValue = value => {
    this.props.onChange(value);
    this.setState({ visible: false, search: '' });
    this.refs.input.blur();
  }
  resetValue = () => this.setValue(null)
  match = (name, search, type) => {
    const types = { start: ['^', ''], notStart: ['^.+(', ')'], any: ['(', ')'] };
    const [pre, post] = types[type];
    return name.match(new RegExp(`${pre}${search}${post}`, 'ig'));
  }
  filterOptions = search => {
    let { options, maxOptions } = this.props; // eslint-disable-line prefer-const
    if (search) options = options.filter(opt => this.match(opt.name, search, 'start')).concat(options.filter(opt => this.match(opt.name, search, 'notStart')));
    if (maxOptions) options = options.slice(0, maxOptions);
    return options.map(({ name, actions, uuid }) => ({ text: name, html: name.replace(new RegExp(`(${search})`, 'ig'), '<b>$1</b>'), actions, props: { key: uuid } }));
  }
  searchEvent = event => {
    const { type, target } = event;
    const { input } = this.refs;
    const { filteredOptions, highlightIndex } = this.state;
    const newState = {};
    let action;
    if (type === 'focus') {
      newState.visible = true;
      newState.search = '';
      newState.filteredOptions = this.filterOptions(newState.search);
      newState.highlightIndex = -1;
    } else if (type === 'change') {
      newState.search = target.value || '';
      newState.filteredOptions = this.filterOptions(newState.search);
      newState.highlightIndex = highlightIndex;
    } else if (type === 'keydown') {
      const { keyCode } = event;
      const deltas = { 38: -1, 40: 1, 33: -3, 34: 3, 35: Infinity, 36: -Infinity };
      if (keyCode in deltas) {
        newState.highlightIndex = highlightIndex + deltas[keyCode];
        this.refs.search.scrollTop = Math.max(0, 32 * (newState.highlightIndex - 3));
        event.preventDefault();
        event.stopPropagation();
      } else if (keyCode === 13) {
        input.blur();
      }
    } else if (type === 'blur') {
      if (this.state.search) {
        action = 'chooseSelected';
      } else {
        newState.visible = false;
        newState.search = '';
      }
    }
    if (action === 'chooseSelected') {
      let selected = filteredOptions[highlightIndex];
      if (!selected) selected = { props: { key: 'none' } };
      const { key } = selected.props;
      newState.search = '';
      newState.visible = false;
      if (key === 'none') {
        this.addItem();
      } else {
        this.setValue(key);
      }
      input.blur();
    }
    if (newState.highlightIndex) {
      const maxIndex = (newState.filteredOptions || filteredOptions).length - 1;
      newState.highlightIndex = [-1, newState.highlightIndex, maxIndex].sort((a, b) => a - b)[1];
    }
    if (newState.search === '') {
      if (input) input.value = '';
    }
    if (Object.keys(newState).length) this.setState(newState);
  }
  itemHover = element => {
    this.setState({ highlightIndex: parseInt(element.dataset.index, 10) });
  }
  actionClick = event => {
    event.stopPropagation();
    event.preventDefault();
    let { action } = event.target.dataset;
    if (!action) return;
    action = JSON.parse(action);
    if (action.type === 'delete') {
      apiFetch(action.url).then(() => {
        this.props.dispatchRefresh();
        this.resetValue();
      });
    }
  }
  addItem = () => {
    const { search } = this.state;
    if (!search) return Promise.resolve();
    return this.props.addItem(search).then(() => {
      this.setState({ visible: false, search: '' });
    });
  }
  render() {
    const { value, placeholder, options, className, lazyLoad } = this.props;
    const { visible, search, filteredOptions, highlightIndex, autoFocus } = this.state;
    const selected = options.find(option => option.uuid === value);
    const searchAttrs = {
      type: 'text',
      placeholder: selected ? selected.name : placeholder,
      autoComplete: 'off',
      className,
      onChange: this.searchEvent,
      onKeyDown: this.searchEvent
    };
    const valueDisplay = selected ? selected.name : '';
    let searchResults = null;
    if (visible && (lazyLoad ? search : true)) {
      searchResults = (<ol className={styles.searchResults} ref="search">
        {filteredOptions.map((opt, index) => <li {...opt.props} className={index === highlightIndex ? styles.highlight : null} onMouseOver={event => this.itemHover(event.target.parentNode.getElementsByClassName(styles.text)[0])}>
          <span className={styles.text} dangerouslySetInnerHTML={{ __html: opt.html }} data-index={index} onMouseUp={() => this.setValue(opt.props.key)} data-key={opt.props.key} />
          {/* opt.actions ? opt.actions.map(action => <span key={action.type} className={styles.action} onClick={this.actionClick} data-action={JSON.stringify(action)}>{action.type}</span>) : null*/}
        </li>)}
      </ol>);
    }
    return (<div className={styles.searchableSelect}>
      <input {...searchAttrs} autoFocus={autoFocus} ref="input" onFocus={this.searchEvent} onBlur={this.searchEvent} defaultValue={valueDisplay} />
      <input {...searchAttrs} className={[className, styles.output].join(' ')} value={valueDisplay} style={{ opacity: visible ? 0 : 1 }} tabIndex="-1" />
      {search && !filteredOptions.length ? null : <a className={[styles.action, styles.clear, value || search ? null : styles.hide].join(' ')} onClick={this.resetValue} />}
      {searchResults}
    </div>);
  }
}
