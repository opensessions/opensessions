import React from 'react';

export default class TextField extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    model: React.PropTypes.object,
    name: React.PropTypes.string,
    className: React.PropTypes.string,
    onChange: React.PropTypes.func,
    autoFocus: React.PropTypes.bool
  }
  render() {
    const { model, name, className, autoFocus, onChange } = this.props;
    const attrs = {
      name,
      onChange,
      className,
      autoFocus
    };
    if (model && name) attrs.value = model[name];
    return <textarea {...attrs} />;
  }
}
