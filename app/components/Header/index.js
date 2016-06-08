/*
 * Header
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { Link } from 'react-router';

import styles from './styles.css';

import { NotAuthenticated, LoginLink, Authenticated } from 'react-stormpath';

export default class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
	shouldComponentUpdate() {
		console.log("Header shouldComponentUpdate ?")
		return true
	}
	render() {
		return (
			<header>
				<Link to="/" className="logo">Open Sessions</Link>
				<nav>
					<Link to="/session/add" activeClassName="active">+ add session</Link>
					<NotAuthenticated>
						<LoginLink>log in</LoginLink>
					</NotAuthenticated>
					<Authenticated>
						<Link to="/me">profile</Link>
					</Authenticated>
				</nav>
			</header>
		);
	}
}
