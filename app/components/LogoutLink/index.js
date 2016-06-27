import React from 'react';

import { Link } from 'react-router';

export default class LogoutLink extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  onClick() {
    const {user} = this.context;
    user.logout(); 
  }
  renderLogoutLink() {
    const { value } = this.props;
    const { user } = this.context;
    if (!user) return <span>You're already logged out!</span>;
    return <Link to="/" onClick={this.onClick}>{value}</Link>;
  }
  render() {
    return <span>{this.renderLogoutLink()}</span>;
  }

}
