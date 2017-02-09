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
    url: PropTypes.string.isRequired,
    title: PropTypes.node,
    options: PropTypes.array
  }
  constructor() {
    super();
    this.state = { form: {} };
  }
  componentWillMount() {
    const { user } = this.context;
    if (user) this.setState({ form: { email: user.email } });
  }
  send = () => apiFetch(this.props.url, { body: this.state.form }).then(res => {
    const { status } = res;
    if (status === 'error') throw new Error(res.message);
    this.context.modal.dispatch({ component: (<GenericModal>
      <h1><b>Success!</b></h1>
      <p>Your message has been sent</p>
      <p><span className={styles.sentTick}><img alt="tick" src="/images/tick.svg" /></span></p>
      <p>Replies will be sent to {this.state.form.email}</p>
      <br />
      <p><Button onClick={() => this.context.modal.close()}>OK</Button></p>
    </GenericModal>) });
  }).catch(error => {
    alert(error);
  })
  render() {
    const { title, options } = this.props;
    const { form } = this.state;
    const fields = [
      { label: 'Your name', name: 'name' },
      { label: 'Your email', name: 'email' },
      { label: 'Enquiry type', name: 'category', type: 'select', options },
      { label: 'Your message', name: 'message', type: 'textarea' },
    ];
    return (<GenericModal>
      <div className={styles.modal}>
        <h1>{title}</h1>
        <GenericForm>
          {fields.map((field, index) => {
            const { label, name, type } = field;
            const props = {
              value: form ? form[name] : '',
              onChange: event => {
                const { value } = event.target;
                const newForm = Object.assign({}, form);
                newForm[name] = value;
                this.setState({ form: newForm });
              },
              autoFocus: index === 0
            };
            let input = <input {...props} type={type || 'text'} />;
            if (type === 'textarea') input = <textarea {...props} placeholder="Type your message here" />;
            if (type === 'select') input = <select {...props}>{options.map(o => <option value={o}>{o}</option>)}</select>;
            return (<div className={styles.question}>
              <label>{label}</label>
              {input}
            </div>);
          })}
          <Button onClick={() => this.send()}>Send</Button>
        </GenericForm>
      </div>
    </GenericModal>);
  }
}
