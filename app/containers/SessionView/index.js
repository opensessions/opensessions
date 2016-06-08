/*
 * SessionView
 */

import React from 'react';
import Header from 'components/Header';

import { Link } from 'react-router';

export default class SessionView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Header />
        <h1>Welcome to Open Sessions <Link to="/session/add">+ add session</Link></h1>
      </div>
    );
  }
}
