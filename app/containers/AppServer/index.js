import React from 'react';

import Header from 'components/Header';
import Footer from 'components/Footer';

// import styles from './styles.css';

export default class AppServer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    content: React.PropTypes.string,
  };
  static contextTypes = {
    router: React.PropTypes.object,
  };
  static childContextTypes = {
    user: React.PropTypes.object,
    router: React.PropTypes.object,
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
      router: this.context.router,
    };
  }
  render() {
    return (
      <div>
        <Header />
        <div dangerouslySetInnerHTML={{ __html: this.props.content }} />
        <Footer />
      </div>
    );
  }
}
