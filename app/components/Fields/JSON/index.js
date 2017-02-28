import React, { PropTypes } from 'react';

import Button from '../../Button';

import styles from './styles.css';

export default class JSONField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object
  };
  static propTypes = {
    guides: PropTypes.array,
    value: PropTypes.array,
    onChange: PropTypes.func
  }
  constructor() {
    super();
    this.state = {};
  }
  newKey = () => {
    const { guides } = this.props;
    if (guides) {
      const options = {};
      guides.filter(guide => !(guide.key in this.props.value)).forEach(guide => {
        options[guide.key] = guide.key;
      });
      this.context.modal.options('Select a key', options, key => {
        this.change(key, '');
      });
    } else {
      this.context.modal.prompt('Enter a key', key => {
        this.change(key, '');
      });
    }
  }
  delete(key) {
    let { value } = this.props;
    if (!(value instanceof Object)) value = {};
    delete value[key];
    this.props.onChange(value);
  }
  change(key, val) {
    let { value } = this.props;
    if (!(value instanceof Object)) value = {};
    value[key] = val;
    this.props.onChange(value);
  }
  changeKey(key, newKey) {
    this.change(newKey, this.props.value[key]);
    this.delete(key);
  }
  render() {
    const { guides } = this.props;
    let { value } = this.props;
    if (!(value instanceof Object)) value = {};
    const guidesLeft = guides ? guides.filter(guide => !(guide.key in value)) : [];
    return (<div className={styles.field}>
      <ol className={styles.list}>
        {value ? Object.keys(value).map(key => {
          const guide = guides.find(g => g.key === key);
          return (<li key={key}>
            {guide ? <label>{key}</label> : <input type="text" value={key} onChange={newKey => this.changeKey(key, newKey)} />}
            {guide ? guide.render(value[key], val => this.change(key, val)) : <input type="text" value={value} />}
            <Button onClick={() => this.delete(key)} style={['slim', 'danger']}>×</Button>
          </li>);
        }) : null}
        {guidesLeft.length ? <li key="new"><Button onClick={this.newKey}>Add</Button></li> : null}
      </ol>
    </div>);
  }
}
