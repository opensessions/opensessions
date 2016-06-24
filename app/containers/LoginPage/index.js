/*
 * LoginPage
 */

import React from 'react';

import Field from 'components/Field';

import { Link } from 'react-router';
import CSSModules from 'react-css-modules';

import styles from './styles.css'; // eslint-disable-line no-unused-vars

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)
export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        {this.showLock} 
      </div>
    );
  }
}

