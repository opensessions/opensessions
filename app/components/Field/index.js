/*
 * Field
 */

import React from 'react';

export default class Field extends React.Component { // eslint-disable-line react/prefer-stateless-function
	constructor() {
		this.state = {
			value: this.props.value || ""
		}
	}
	render() {
		var type = this.props.type
		var input = <input type={type} name={this.props.name} value={this.value} />
		if(type == "textarea") {
			input = <textarea name={this.props.name} value={this.value} />
		}
		return (
			<div className="component-field">
				<label>{this.props.label}</label>
				{input}
			</div>
		);
	}
}