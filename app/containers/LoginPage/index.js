/*
 * LoginPage
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { Link } from 'react-router';
import Header from 'components/Header';

import ReactStormpath, { Router, AuthenticatedRoute, LoginLink, LoginForm } from 'react-stormpath';

export default class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

	render() {
		return (
			<div>
				<Header />
				<div>
					<h1>This is the login form!</h1>
					<LoginForm />
					<p>Or <Link to="/register">register</Link></p>
				</div>
			</div>
		);
	}
}
