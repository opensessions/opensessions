/**
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { PropTypes } from 'react';
import Intercom from 'react-intercom';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';

import getUserToken from './getUserToken';

import styles from './styles.css';

export default class App extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node,
  };
  static contextTypes = {
    router: PropTypes.object,
  };
  static childContextTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    router: PropTypes.object,
    notifications: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      onDismiss: PropTypes.func,
      status: PropTypes.oneOf(['success', 'warn', 'error'])
    })),
    notify: PropTypes.func,
    modal: PropTypes.object,
    isLoadingUser: PropTypes.bool
  }
  constructor() {
    super();
    this.state = {
      profile: null,
      notifications: [],
      isLoadingUser: true
    };
  }
  getChildContext() {
    return {
      user: this.state.profile,
      auth: this.state.auth ? this.state.auth : { },
      notifications: this.state.notifications,
      notify: this.notify,
      modal: { dispatch: this.modal, close: () => this.setState({ modal: null }) },
      isLoadingUser: this.state.isLoadingUser
    };
  }
  componentDidMount() {
    if (document.cookie.indexOf('cookieconsent_dismissed') === -1) {
      this.notify('This website uses cookies to ensure you get the best experience', null, [{ text: 'OK!', dispatch: () => (document.cookie = 'cookieconsent_dismissed=yes') }]);
    }
    this.createAuth();
    const { userAgent } = navigator;
    if (userAgent.indexOf('MSIE') >= 0 || (userAgent.indexOf('Trident') >= 0 && !userAgent.indexOf('x64') >= 0)) this.notify('Internet Explorer is not well-supported. Consider using an up-to-date browser for the best experience', 'warn');
  }
  notify = (text, status, actions) => {
    const notification = {
      id: Date.now(),
      text,
      status,
      actions
    };
    if (status === 'success' || status === 'draft') {
      notification.timeout = 2500;
    } else if (status === 'error') {
      notification.timeout = 10000;
    }
    notification.onDismiss = () => {
      this.setState({ notifications: this.state.notifications.filter(msg => msg.id !== notification.id) });
    };
    this.setState({
      notifications: [notification].concat(this.state.notifications)
    });
    return { redact: () => notification.onDismiss() };
  }
  modal = options => {
    this.setState({ modal: options.component });
  }
  createAuth() {
    const { Auth0, AUTH0_CLIENT_ID, AUTH0_CLIENT_DOMAIN } = window;
    const auth = new Auth0({
      clientID: AUTH0_CLIENT_ID,
      domain: AUTH0_CLIENT_DOMAIN,
      auth: {
        params: { scope: 'openid email' }
      }
    });
    this.setState({ auth });
    auth.getProfile(getUserToken(), (err, profile) => {
      if (err) {
        localStorage.removeItem('userToken');
        this.setState({ isLoadingUser: false });
        return false;
      }
      const { email, nickname } = profile;
      const createdAt = new Date(profile.created_at);
      profile.logout = () => {
        localStorage.removeItem('userToken');
        this.context.router.push('/');
        this.setState({ profile: null });
      };
      this.setState({ profile, isLoadingUser: false });

      const { analytics } = window;
      if (analytics) {
        analytics.identify(email, {
          name: nickname,
          email
        });
      }

      if (Date.now() - createdAt.getTime() <= 60000) {
        this.notify('<b>Congratulations!</b> You have created your account', 'success');
        setTimeout(() => {
          this.context.router.push('/session/add#welcome');
        }, 2000);
      }

      if (email.match(/@imin\.co$/i)) document.body.classList.add('admin');

      return true;
    });
  }
  render() {
    const { profile, modal } = this.state;
    const { INTERCOM_APPID } = window;
    const intercomProps = profile ? { user_id: profile.user_id, email: profile.email, name: profile.nickname } : {};
    intercomProps.appID = INTERCOM_APPID;
    return (
      <div className={styles.root}>
        <Header />
        <div className={styles.appBody}>
          <div className={styles.container}>
            {this.props.children}
          </div>
          <Footer />
        </div>
        <Intercom {...intercomProps} />
        <Modal modal={modal} />
      </div>
    );
  }
}
