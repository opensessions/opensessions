import React, { PropTypes } from 'react';

import GenericForm from '../../../components/GenericForm';
import GenericModal from '../Generic';
import Button from '../../../components/Button';
import Checkbox from '../../../components/Fields/Checkbox';

import { apiFetch } from '../../../utils/api';
import trackPage from '../../../utils/analytics';

import styles from './styles.css';

const KEY_ENTER = 13;
const { fbq } = window;

export default class AuthModal extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static contextTypes = {
    modal: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object
  };
  static propTypes = {
    feature: PropTypes.string,
    stage: PropTypes.string,
    email: PropTypes.string
  }
  constructor() {
    super();
    this.state = { form: {}, showPass: false, isLoading: false };
    trackPage(window.location.href, '/special:signup-open');
  }
  facebook() {
    this.setState({ isLoading: true });
    this.context.auth.login({
      connection: 'facebook',
      responseType: 'token'
    });
  }
  emailCheck() {
    const { form } = this.state;
    if (form && form.email) {
      this.setState({ isLoading: true });
      apiFetch('/api/auth-email', { body: form }).then(result => {
        trackPage(window.location.href, `/special:signup-${result.exists ? 'signin' : 'create'}`);
        this.context.modal.dispatch({ component: result.exists ? <AuthModal stage="signin" email={form.email} /> : <AuthModal stage="create" email={form.email} /> });
        this.setState({ error: null, isLoading: false });
      }).catch(error => {
        this.setState({ error: error.error, isLoading: false });
      });
    }
  }
  signIn() {
    const { form } = this.state;
    if (!form.password) {
      this.setState({ error: 'Enter your password' });
      return;
    }
    this.setState({ isLoading: true });
    this.context.auth.login({
      connection: 'Username-Password-Authentication',
      responseType: 'token',
      email: this.props.email || form.email,
      password: form.password
    }, error => {
      if (error) {
        this.setState({ error: error.toString().split(':')[1], isLoading: false });
      } else {
        this.setState({ error: null, isLoading: false });
      }
    });
  }
  signUp() {
    const { form } = this.state;
    if (!form.password) {
      this.setState({ error: 'You must enter a password' });
      return;
    } else if (form.password !== form.password2) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }
    this.setState({ isLoading: true });
    trackPage(window.location.href, '/special:signup-success');
    const email = this.props.email || form.email;
    fbq('track', 'CompleteRegistration', { value: 0, currency: 'GBP', email });
    this.context.auth.signup({
      connection: 'Username-Password-Authentication',
      responseType: 'token',
      email,
      password: form.password
    }, error => {
      if (error) {
        this.setState({ error: error.toString().split(':')[1], isLoading: false });
      } else {
        this.setState({ error: null, isLoading: false });
      }
    });
  }
  forgotPassword() {
    this.setState({ isLoading: true });
    this.context.auth.changePassword({
      connection: 'Username-Password-Authentication',
      email: this.props.email || this.state.form.email
    }, (error, response) => {
      if (error) {
        this.setState({ error: error.toString().split(':')[1], isLoading: false });
      } else {
        this.setState({ error: null, isLoading: false });
        this.context.modal.dispatch({ component: <GenericModal size="small">{response.replace(/"/g, '')}</GenericModal> });
      }
    });
  }
  renderQuestion(label, question) {
    const { form } = this.state;
    const { name, props } = question;
    return (<div className={styles.question}>
      <label>{label}</label>
      <input
        value={form[name]}
        onChange={event => {
          const { value } = event.target;
          form[name] = value;
          this.setState({ form });
        }}
        type={"text"}
        {...props}
      />
    </div>);
  }
  renderLink(text, onClick) {
    return <p><a tabIndex={0} onKeyUp={event => event.keyCode === KEY_ENTER && event.target.click()} onClick={onClick}>{text}</a></p>;
  }
  renderSignIn() {
    const { email } = this.props;
    const { showPass, error, isLoading } = this.state;
    return (<GenericModal size="small" isLoading={isLoading}>
      <div className={styles.auth} onKeyDown={event => event.keyCode === KEY_ENTER && this.signIn()}>
        <h2>Sign in to your account</h2>
        {error ? <p className={styles.error}>{error}</p> : null}
        <GenericForm>
          {this.renderQuestion('Email', { name: 'email', props: { value: email, type: 'email' } })}
          {this.renderQuestion('Password', { name: 'password', props: { autoFocus: true, type: showPass ? 'text' : 'password' } })}
          <p className={styles.question}><Checkbox label="Show password" checked={showPass} onChange={() => this.setState({ showPass: !showPass })} /></p>
          <Button onClick={() => this.signIn()}>Sign in</Button>
        </GenericForm>
        {this.renderLink('I forgot my password', () => this.forgotPassword())}
      </div>
    </GenericModal>);
  }
  renderCreate() {
    const { email } = this.props;
    const { error, isLoading } = this.state;
    return (<GenericModal size="small" isLoading={isLoading}>
      <div className={styles.auth} onKeyDown={event => event.keyCode === KEY_ENTER && this.signUp()}>
        <Button className={styles.facebook} onClick={() => this.facebook()}>Continue with Facebook</Button>
        <div className={styles.or}><hr /><span>or</span><hr /></div>
        <h2>Create your Open Sessions Account</h2>
        <GenericForm>
          {error ? <p className={styles.error}>{error}</p> : null}
          {this.renderQuestion('Email', { name: 'email', props: { value: email, autoFocus: !email, type: 'email' } })}
          {this.renderQuestion('Choose a password', { name: 'password', props: { autoFocus: email, type: 'password' } })}
          {this.renderQuestion('Re-type password', { name: 'password2', props: { type: 'password' } })}
          <Button onClick={() => this.signUp()}>Create Account</Button>
        </GenericForm>
        {this.renderLink('I already have an account', () => this.context.modal.dispatch({ component: <AuthModal /> }))}
      </div>
    </GenericModal>);
  }
  render() {
    const { stage } = this.props;
    const { isLoading, error } = this.state;
    if (stage === 'signin') {
      return this.renderSignIn();
    } else if (stage === 'create') {
      return this.renderCreate();
    }
    return (<GenericModal size="small" isLoading={isLoading}>
      <div className={styles.auth} onKeyDown={event => event.keyCode === KEY_ENTER && this.emailCheck()}>
        <Button className={styles.facebook} onClick={() => this.facebook()}>Continue with Facebook</Button>
        <div className={styles.or}><hr /><span>or</span><hr /></div>
        <h2>Continue with email</h2>
        <GenericForm>
          {error ? <p className={styles.error}>{error}</p> : null}
          {this.renderQuestion('Email', { name: 'email', props: { autoFocus: true, name: 'email', autoComplete: 'off', type: 'email' } })}
          <Button style={this.state.form.email ? null : 'disabled'} onClick={() => this.emailCheck()}>Continue</Button>
        </GenericForm>
        {this.renderLink('Create an account', () => this.context.modal.dispatch({ component: <AuthModal stage="create" /> }))}
      </div>
    </GenericModal>);
  }
}
