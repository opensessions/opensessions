import React from 'react';

import { Link } from 'react-router';

export default class LogoutLink extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  static childContextTypes = {
    user: React.PropTypes.object,
  }
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.state = {
      user: null,
    };
  }
  getChildContext() {
    return { user: this.state.user };
  }
  componentWillMount() {
    this.setState({ user: this.context.user });
  }
  onClick() {
    localStorage.removeItem('userToken');
    this.setState({ user: { hello: 'world' } });
  }
  renderLogoutLink() {
    const {value} = this.props;
    const {user} = this.state;
    console.log("user state renderLogoutLink", user); 
    if (user != null) {
      return <Link to="/profile" onClick={this.onClick}>{value}</Link>;
    } else {
      return <span>You're already logged out!</span>;
    }
  }
  render() {
    return <span>{this.renderLogoutLink()}</span>
  }
}
