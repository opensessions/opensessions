import React, { PropTypes } from 'react';

import GenericForm from '../../../components/GenericForm';
import GenericModal from '../Generic';
import Button from '../../../components/Button';

import { apiFetch } from '../../../utils/api';

import styles from './styles.css';

export default class MessageModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    user: PropTypes.object,
    store: PropTypes.object
  };
  static propTypes = {
    url: PropTypes.string,
    title: PropTypes.string
  }
  constructor() {
    super();
    this.state = {};
  }
  onChange = event => {
    const { value, name } = event.target;
    const newForm = Object.assign({}, this.state.form);
    newForm[name] = value;
    this.setState({ form: newForm });
  }
  send = () => apiFetch(this.props.url, { body: this.state.form }).then(() => {
    this.context.modal.dispatch({ component: (<GenericModal>
      <h1><b>Success!</b></h1>
      <p>Your message has been sent</p>
      <p><span className={styles.sentTick}><img alt="tick" src="/images/tick.svg" /></span></p>
      <p>Replies will be sent to {this.state.form.from}</p>
      <br />
      <p><Button onClick={() => this.context.modal.close()}>OK</Button></p>
    </GenericModal>) });
  }).catch(error => {
    alert(error.error);
  })
  render() {
    const { title } = this.props;
    const { form } = this.state;
    const fields = [
      { label: 'Your name', name: 'name' },
      { label: 'Your email', name: 'from' },
      { label: 'Your message', name: 'body', type: 'textarea' },
    ];
    return (<GenericModal>
      <div className={styles.modal}>
        <h1>{title}</h1>
        <GenericForm>
          {fields.map((field, index) => {
            const { label, name, type } = field;
            const props = { name, value: form ? form[name] : '', onChange: this.onChange, autoFocus: index === 0 };
            return (<div className={styles.question}>
              <label>{label}</label>
              {type === 'textarea' ? <textarea {...props} /> : <input {...props} type={type || 'text'} />}
            </div>);
          })}
          <Button onClick={() => this.send()}>Send</Button>
        </GenericForm>
      </div>
    </GenericModal>);
  }
}
