/*
 * Header
 */

import React from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

import { NotAuthenticated, LoginLink, Authenticated } from 'react-stormpath';

export default class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
	static contextTypes = {
		user: React.PropTypes.object
	}
	render() {
		var user = this.context.user ? this.context.user : false;
		return (
			<header>
				<Link to="/" className="logo">Open Sessions</Link>
				<nav>
					<Link to="/session/add" activeClassName="active">+ add session</Link>
					<NotAuthenticated>
						<LoginLink>log in</LoginLink>
					</NotAuthenticated>
					<Authenticated>
						<Link to="/me">{user.givenName}'s profile</Link>
					</Authenticated>
				</nav>
			</header>
		);
	}
}
