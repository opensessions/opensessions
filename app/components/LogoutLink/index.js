import React from 'react';

export default class LogoutLink extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    invisible: React.PropTypes.bool,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  onClick = () => {
    localStorage.removeItem('userToken');
    const { user } = this.context;
    user.logout();
  }
  renderLogoutLink() {
    const { value } = this.props;
    const { user } = this.context;
    if (!user) return this.props.invisible ? null : <span>You're already logged out!</span>;
    return <a onClick={this.onClick}>{value}</a>;
  }
  render() {
    return <span>{this.renderLogoutLink()}</span>;
  }
}
