import React, { PropTypes } from 'react';

import GenericForm from '../../../components/GenericForm';
import GenericModal from '../Generic';
import Button from '../../../components/Button';

import { apiFetch } from '../../../utils/api';

import styles from './styles.css';

export default class AuthModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    user: PropTypes.object
  };
  static propTypes = {
    feature: PropTypes.string
  }
  constructor() {
    super();
    this.state = { form: {} };
  }
  send() {
    if (this.state.form) {
      apiFetch('/hooks/auth-email', { body: this.state.form }).then(() => {
        this.context.modal.dispatch({ component: (<GenericModal size="small">
          <p>You will be notified when the feature is available</p>
          <p><span className={styles.sentTick}><img alt="tick" src="/images/tick.svg" /></span></p>
          <p>Thanks for your continued engagement in Open Sessions!</p>
          <br />
          <p><Button onClick={this.context.modal.close}>Close</Button></p>
        </GenericModal>) });
      }).catch(error => {
        alert(error.error);
      });
    } else {
      this.context.modal.close();
    }
  }
  render() {
    return (<GenericModal size="small">
      <div className={styles.auth}>
        <Button onClick={() => this.send()}>Continue with Facebook</Button>
        <div className={styles.or}><hr /><span>or</span><hr /></div>
        <p>Continue with email</p>
        <GenericForm>
          <div className={styles.question}>
            <label>Email</label>
            <input value={this.state.form.email} onChange={event => this.setState({ form: { email: event.target.value } })} type="text" />
          </div>
          <Button onClick={() => this.send()}>Continue</Button>
        </GenericForm>
        <p><a>Create an account</a></p>
      </div>
    </GenericModal>);
  }
}
