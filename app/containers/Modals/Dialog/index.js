import React, { PropTypes } from 'react';

import GenericModal from '../Generic';
import Button from '../../../components/Button';
import TextField from '../../../components/Fields/Text';

import styles from './styles.css';

export default class DialogModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    user: PropTypes.object
  };
  static propTypes = {
    confirm: PropTypes.func,
    dismiss: PropTypes.func,
    prompt: PropTypes.func,
    options: PropTypes.array,
    value: PropTypes.string,
    message: PropTypes.string
  }
  constructor(props) {
    super();
    this.state = { notify: false, input: props.value };
  }
  action(type) {
    if (type === 'confirm') {
      this.props.confirm();
    } else if (type === 'dismiss') {
      this.props.dismiss();
    } else if (type === 'prompt') {
      this.props.prompt(this.state.input);
    }
    this.context.modal.close();
  }
  render() {
    const { message, prompt, options } = this.props;
    const labels = { dismiss: 'Cancel', confirm: 'OK', prompt: 'Submit' };
    return (<GenericModal size="small">
      <div className={styles.feature}>
        <p>{message}</p>
        {prompt && !options ? <p><TextField autoFocus value={this.state.input} onChange={input => this.setState({ input })} onEnter={() => this.action('prompt')} /></p> : null}
        {options ? <p><select autoFocus value={this.state.input} onChange={e => this.setState({ input: e.target.value })}><option />{Object.keys(options).map(key => <option key={key} value={key}>{options[key]}</option>)}</select></p> : null}
        <p>
          {['confirm', 'prompt', 'dismiss'].filter(type => this.props[type]).map(type => <Button onClick={() => this.action(type)}>{labels[type]}</Button>)}
        </p>
      </div>
    </GenericModal>);
  }
}
