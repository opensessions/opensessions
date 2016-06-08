/*
 * Form
 */

import React from 'react';
import { Link } from 'react-router';

export default class Form extends React.Component { // eslint-disable-line react/prefer-stateless-function
	render() {
		return (
			<form>
				{this.props.children}
			</form>
		);
	}
}