import React from 'react';

export default class Authenticated extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
    message: React.PropTypes.string,
  }
  static contextTypes = {
    user: React.PropTypes.object,
  }
  render() {
    return (
      <div>
        {this.context.user ? this.props.children : this.props.message}
      </div>
    );
  }
}
