import React, { PropTypes } from 'react';

export default class LogoutLink extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };
  static contextTypes = {
    user: PropTypes.object,
  }
  onClick = () => {
    const { user } = this.context;
    user.logout();
  }
  render() {
    const { children } = this.props;
    const { user } = this.context;
    return <span>{user ? <a onClick={this.onClick}>{children}</a> : null}</span>;
  }
}
