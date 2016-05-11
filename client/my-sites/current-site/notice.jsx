/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import paths from 'my-sites/upgrades/paths';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySitePlans from 'components/data/query-site-plans';
import { isFinished as isJetpackPluginsFinished } from 'state/plugins/premium/selectors';
import { abtest } from 'lib/abtest';
import TrackComponentView from 'lib/analytics/track-component-view';

const SiteNotice = React.createClass( {
	propTypes: {
		site: React.PropTypes.object
	},

	getDefaultProps() {
		return {
		};
	},

	getSiteRedirectNotice: function( site ) {
		if ( ! site ) {
			return null;
		}
		if ( ! ( site.options && site.options.is_redirect ) ) {
			return null;
		}
		const { hostname } = url.parse( site.URL );
		return (
			<Notice
				showDismiss={ false }
				icon="info-outline"
				isCompact
			>
				{ this.translate( 'Redirects to {{a}}%(url)s{{/a}}', {
					args: { url: hostname },
					components: { a: <a href={ site.URL }/> }
				} ) }
				<NoticeAction href={ paths.domainManagementList( site.domain ) }>
					{ this.translate( 'Edit' ) }
				</NoticeAction>
			</Notice>
		);
	},

	domainCreditNotice() {
		if ( ! this.props.hasDomainCredit ) {
			return null;
		}

		if ( abtest( 'domainCreditsInfoNotice' ) === 'showNotice' ) {
			const eventName = 'calypso_domain_credit_reminder_impression';
			const eventProperties = { cta_name: 'current_site_domain_notice' };
			return (
				<Notice isCompact status="is-success" icon="info-outline">
					{ this.translate( 'Unused domain credit' ) }
					<NoticeAction
						onClick={ this.props.clickClaimDomainNotice }
						href={ `/domains/add/${ this.props.site.slug }` }
					>
						{ this.translate( 'Claim' ) }
						<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
					</NoticeAction>
				</Notice>
			);
		}

		//otherwise still track what happens when we don't show a notice
		const eventName = 'calypso_domain_credit_reminder_no_impression';
		const eventProperties = { cta_name: 'current_site_domain_notice' };
		return (
			<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
		);
	},

	jetpackPluginsSetupNotice() {
		if ( ! this.props.pausedJetpackPluginsSetup || this.props.site.plan.product_slug === 'jetpack_free' ) {
			return null;
		}

		return (
			<Notice isCompact status="is-info" icon="plugins">
				{ this.translate(
					'Your %(plan)s plan needs setting up!',
					{ args: { plan: this.props.site.plan.product_name_short } }
				) }
				<NoticeAction href={ `/plugins/setup/${ this.props.site.slug }` } >
					{ this.translate( 'Finish' ) }
				</NoticeAction>
			</Notice>
		);
	},

	render() {
		const { site } = this.props;
		if ( ! site ) {
			return <div className="site__notices" />;
		}
		return (
			<div className="site__notices">
				{ this.getSiteRedirectNotice( site ) }
				<QuerySitePlans siteId={ site.ID } />
				{ this.domainCreditNotice() }
				{ this.jetpackPluginsSetupNotice() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		hasDomainCredit: !! ownProps.site && hasDomainCredit( state, ownProps.site.ID ),
		pausedJetpackPluginsSetup: !! ownProps.site && ownProps.site.jetpack && ! isJetpackPluginsFinished( state, ownProps.site.ID )
	};
}, ( dispatch ) => {
	return {
		clickClaimDomainNotice: () => dispatch( recordTracksEvent(
			'calypso_domain_credit_reminder_click', {
				cta_name: 'current_site_domain_notice'
			}
		) )
	};
} )( SiteNotice );
