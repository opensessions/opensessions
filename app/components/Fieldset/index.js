/*
 * Fieldset
 */

import React from 'react';
import { Link } from 'react-router';

export default class Fieldset extends React.Component { // eslint-disable-line react/prefer-stateless-function
	render() {
		return (
			<fieldset>
				{this.props.children}
			</fieldset>
		);
	}
}