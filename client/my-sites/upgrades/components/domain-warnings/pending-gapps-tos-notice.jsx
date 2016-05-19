/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import support from 'lib/url/support';

const learnMoreLink = <a href={ support.COMPLETING_GOOGLE_APPS_SIGNUP } target="_blank" />,
	strong = <strong />;

const PendingGappsTosNotice = React.createClass( {
	propTypes: {
		domains: React.PropTypes.array.isRequired
	},

	getPendingDomains() {
		return this.props.domains.filter( domain => domain.googleAppsSubscription.pendingUsers && domain.googleAppsSubscription.pendingUsers.length !== 0 );
	},

	getGappsLoginUrl( email, domain ) {
		return `https://accounts.google.com/AccountChooser?Email=${ email }&service=CPanel&continue=https%3A%2F%2Fadmin.google.com%2F${ domain }%2FAcceptTermsOfService%3Fcontinue%3Dhttps%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F1`;
	},

	getNoticeSeverity( domains ) {
		const subscribedDaysAgo = days => {
			return domain => this.moment( domain.googleAppsSubscription.subscribedDate ).isBefore( this.moment().subtract( days, 'days' ) );
		};

		if ( domains.some( subscribedDaysAgo( 21 ) ) ) {
			return 'error';
		} else if ( domains.some( subscribedDaysAgo( 7 ) ) ) {
			return 'warning';
		}

		return 'info';
	},

	oneDomainNotice( domain, users, severity ) {
		return (
			<Notice
				status={ `is-${ severity }` }
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domain"
				text={ this.translate(
					'You\'re almost there! To activate your email {{strong}}%(emails)s{{/strong}}, please log in to Google Apps and finish setting it up. {{learnMoreLink}}Learn More.{{/learnMoreLink}}',
					'You\'re almost there! To activate your emails {{strong}}%(emails)s{{/strong}}, please log in to Google Apps and finish setting it up. {{learnMoreLink}}Learn More.{{/learnMoreLink}}',
					{
						count: users.length,
						args: { emails: users.join( ', ' ) },
						components: { learnMoreLink, strong }
					}
				) }>
				<NoticeAction href={ this.getGappsLoginUrl( users[0], domain ) } external>
					{ this.translate( 'Log in' ) }
				</NoticeAction>
			</Notice>
		);
	},

	multipleDomainsNotice( pendingDomains, severity ) {
		return (
			<Notice
				status={ `is-${ severity }` }
				showDismiss={ false }
				key="pending-gapps-tos-acceptance-domains">
				{ this.translate( 'You\'re almost there! To activate your new email addresses, please log in to Google Apps and finish setting them up. {{learnMoreLink}}Learn more{{/learnMoreLink}}.', { components: { learnMoreLink } } ) }
				<ul>{
					pendingDomains.map( ( { name: domain, googleAppsSubscription: { pendingUsers: users } } ) => {
						return <li key={ `pending-gapps-tos-acceptance-domain-${ domain }` }>
							<strong>{ users.join( ', ' ) }</strong> <a href={ this.getGappsLoginUrl( users[0], domain ) } target="_blank">{ this.translate( 'Log in' ) }</a>
						</li>;
					} )
				}</ul>
			</Notice>
		);
	},

	render() {
		const pendingDomains = this.getPendingDomains(),
			severity = this.getNoticeSeverity( pendingDomains );

		switch ( pendingDomains.length ) {
			case 0:
				return null;

			case 1:
				return this.oneDomainNotice( pendingDomains[0].name, pendingDomains[0].googleAppsSubscription.pendingUsers, severity );

			default:
				return this.multipleDomainsNotice( pendingDomains, severity );
		}
	},
} );

export default PendingGappsTosNotice;
