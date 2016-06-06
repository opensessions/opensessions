/*
 * SessionForm
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';

export default class SessionForm extends React.Component { // eslint-disable-line react/prefer-stateless-function

  render() {
    return (
      <h1>A session<a href="/">home</a> form!</h1>
    );
  }
}
