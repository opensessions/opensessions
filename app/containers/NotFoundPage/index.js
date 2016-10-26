/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

export default class NotFound extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (<div className={styles.notFound}>
      <h1>Page Not Found</h1>
      <p>We couldn't find what you were looking for :(</p>
      <p><Link to="/">Back home</Link></p>
    </div>);
  }
}
