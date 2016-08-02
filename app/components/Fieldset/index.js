import React from 'react';

import styles from './styles.css';

export default class Fieldset extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node.isRequired,
    label: React.PropTypes.string,
    heading: React.PropTypes.string,
    title: React.PropTypes.string,
    subtitle: React.PropTypes.string,
  }
  render() {
    const { title, subtitle, children } = this.props;
    return (
      <fieldset className={styles.fieldset}>
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <h2>{subtitle}</h2> : null}
        {children}
      </fieldset>
    );
  }
}
