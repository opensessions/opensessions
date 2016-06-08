/*
 * ForgotPage
 */

import React from 'react';

import Header from 'components/Header';

import { Authenticated, NotAuthenticated, LoginLink, ResetPasswordForm } from 'react-stormpath';

export default class ForgotPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

	render() {
		return (
			<div>
				<Header />
				<NotAuthenticated>
					<p>Send an email</p>
					<ResetPasswordForm />
				</NotAuthenticated>
				<Authenticated>
					<p>You are already logged in!</p>
				</Authenticated>
			</div>
		);
	}
}
