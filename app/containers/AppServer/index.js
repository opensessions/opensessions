import React, { PropTypes } from 'react';

import styles from '../App/styles.css';

export default class AppServer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    html: PropTypes.string,
    meta: PropTypes.array,
    title: PropTypes.string,
  }
  render() {
    return (<html lang="en">
      <head>
        <title>{this.props.title || 'Open Sessions'}</title>
        <link type="stylesheet/css" href="/styles.css" />
        {this.props.meta}
      </head>
      <body>
        <div id="app">
          <div className={styles.root} dangerouslySetInnerHTML={{ __html: this.props.html }} />
        </div>
      </body>
    </html>);
  }
}
