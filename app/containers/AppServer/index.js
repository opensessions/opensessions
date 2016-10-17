import React, { PropTypes } from 'react';

import Helmet from 'react-helmet';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

import styles from '../App/styles.css';

export default class AppServer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    html: PropTypes.string,
  }
  render() {
    return (<html lang="en">
      <head>
        <title>Open Sessions</title>
        <link type="stylesheet/css" href="/styles.css" />
      </head>
      <body>
        <div id="app">
          <div className={styles.root}>
            <Helmet />
            <Header />
            <div className={styles.appBody}>
              <div className={styles.container}>
                <div dangerouslySetInnerHTML={{ __html: this.props.html }} />
              </div>
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>);
  }
}
