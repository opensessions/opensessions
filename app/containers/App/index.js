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
import { Link } from 'react-router';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import NotificationBar from '../../components/NotificationBar';
import Modal from '../../components/Modal';
import AuthModal from '../../containers/Modals/Authorize';
import Dialog from '../Modals/Dialog';

import getUserToken from './getUserToken';
import cookie from '../../utils/cookie';
import { apiFetch } from '../../utils/api';

import styles from './styles.css';

const originalLocation = window && window.location ? JSON.parse(JSON.stringify(window.location)) : {};

export default class App extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: PropTypes.node,
  };
  static contextTypes = {
    router: PropTypes.object,
    store: PropTypes.object,
  };
  static childContextTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    router: PropTypes.object,
    notify: PropTypes.func,
    modal: PropTypes.object,
    isLoadingUser: PropTypes.bool,
    isAdmin: PropTypes.bool,
    firstLocation: PropTypes.object
  }
  constructor() {
    super();
    this.state = {
      profile: null,
      isLoadingUser: true,
      firstLocation: originalLocation
    };
  }
  getChildContext() {
    const { profile, isLoadingUser, firstLocation, auth } = this.state;
    const { ADMIN_DOMAIN } = window;
    return {
      user: profile,
      auth: auth || {},
      notify: this.notify,
      modal: {
        dispatch: this.modal,
        close: () => this.setState({ modal: null }),
        confirm: (message, confirm) => this.modal({ component: <Dialog message={message} confirm={confirm} /> }),
        prompt: (message, prompt, value) => this.modal({ component: <Dialog message={message} prompt={prompt} value={value} /> }),
        options: (message, options, prompt) => this.modal({ component: <Dialog message={message} prompt={prompt} options={options} /> }),
        alert: message => this.modal({ component: <Dialog message={message} /> })
      },
      isLoadingUser,
      isAdmin: profile && profile.email && profile.email.indexOf(`@${ADMIN_DOMAIN}`) !== -1,
      firstLocation
    };
  }
  componentDidMount() {
    if (!cookie.has('cookieconsent_dismissed')) {
      this.notify(<span>This site uses cookies to give you the best experience. <Link to="/terms">Find out more</Link></span>, 'cookie', [{ type: 'full', dispatch: () => cookie.set('cookieconsent_dismissed', 'yes'), tooltip: 'Click to close & accept' }], 'COOKIE_NOTIFICATION');
    }
    this.createAuth();
    const { userAgent } = navigator;
    if (userAgent.indexOf('MSIE') >= 0 || (userAgent.indexOf('Trident') >= 0 && !userAgent.indexOf('x64') >= 0)) this.notify('Internet Explorer is not well-supported. Consider using an up-to-date browser for the best experience', 'warn');
    const loginRE = /^\?login=/;
    const location = this.state.firstLocation;
    if (loginRE.test(location.search) && !location.hash) {
      cookie.set('postlogin_redirect', location.search.replace(loginRE, ''));
      this.modal({ component: <AuthModal /> });
    }
  }
  getPartner() {
    const { profile } = this.state;
    return apiFetch('/api/partner', { query: { userId: profile.user_id } }).then(res => {
      profile.partner = res.instances && res.instances.length ? res.instances[0] : false;
      this.setState({ profile });
    });
  }
  notify = (text, status, actions, storeType) => {
    const notification = {
      id: Date.now(),
      text,
      status,
      actions
    };
    if (!actions) {
      if (status === 'success' || status === 'warn') {
        notification.timeout = 2500;
      } else if (status === 'error') {
        notification.timeout = 10000;
      }
    }
    notification.onDismiss = () => this.context.store.dispatch({ type: `${storeType || 'NOTIFICATION'}_DISMISS`, payload: notification.id });
    this.context.store.dispatch({ type: `${storeType || 'NOTIFICATION'}_PUSH`, payload: notification });
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
      const updatedAt = new Date(profile.updated_at);
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

      if (Date.now() - updatedAt.getTime() <= 10000 && cookie.has('postlogin_redirect')) {
        this.context.router.push(cookie.one('postlogin_redirect'));
      }

      this.getPartner();

      return true;
    });
  }
  render() {
    const { modal } = this.state;
    return (<div className={styles.root}>
      <Header />
      <div className={styles.appBody}>
        <div className={styles.container}>
          {this.props.children}
        </div>
        <NotificationBar storeName="cookieNotifications" orientation="bottom" />
        <Footer />
      </div>
      <Modal modal={modal} />
    </div>);
  }
}
