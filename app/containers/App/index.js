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

import React from 'react';
import Auth0Lock from 'auth0-lock';
import CSSModules from 'react-css-modules';

import Header from 'components/Header';
import Footer from 'components/Footer';
import getUserToken from './getUserToken';

import styles from './styles.css';

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)
export default class App extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    children: React.PropTypes.node,
  };
  static childContextTypes = {
    user: React.PropTypes.object,
    lock: React.PropTypes.object,
  };
  constructor() {
    super();
    this.state = {
      profile: null,
    };
  }
  getChildContext() {
    return {
      user: this.state.profile,
      lock: this.lock, // both user and lock are stored in context as they both need to be accessible from multiple components across the app
    };
  }
  componentWillMount() {
    this.createLock();
    this.setupProfile();
  }
  setupProfile() {
    this.lock.getProfile(getUserToken(this.lock), (err, profile) => {
      if (err) {
        console.log('user error');
        return false;
      }
      profile.logout = () => {
        this.setState({ profile: null });
      };
      this.setState({ profile });
      return true;
    });
  }
  createLock() {
    this.lock = new Auth0Lock('bSVd1LzdwXsKbjF7JXflIc1UuMacffUA', 'opensessions.eu.auth0.com');
  }
  render() {
    return (
      <div styleName="root">
        <Header />
        {this.props.children}
        <Footer />
      </div>
    );
  }
}
