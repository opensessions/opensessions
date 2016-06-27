import React from 'react';

import CSSModules from 'react-css-modules';

import styles from './styles.css'; // eslint-disable-line no-unused-vars

const CSSModulesOptions = {
  allowMultiple: true,
};

@CSSModules(styles, CSSModulesOptions)
export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        {this.showLock}
      </div>
    );
  }
}
