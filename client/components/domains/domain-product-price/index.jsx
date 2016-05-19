/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PremiumPopover from 'components/plans/premium-popover';

const DomainProductPrice = React.createClass( {
	propTypes: {
		isLoading: React.PropTypes.bool,
		price: React.PropTypes.string,
		freeWithPlan: React.PropTypes.bool,
		requiresPlan: React.PropTypes.bool
	},
	subMessage() {
		if ( this.props.freeWithPlan ) {
			return (
				<span className="domain-product-price__free-text" ref="subMessage">
					{ this.translate( 'Free with your plan' ) }
				</span>
			);
		} else if ( this.props.requiresPlan ) {
			return (
				<small className="domain-product-price__premium-text" ref="subMessage">
					{ this.translate( 'Included in WordPress.com Premium' ) }
					<PremiumPopover
						context={ this.refs && this.refs.subMessage }
						bindContextEvents
						position="bottom left"/>
				</small>
			);
		}
		return null;
	},
	priceText() {
		if ( ! this.props.price ) {
			return this.translate( 'Free' );
		} else if ( this.props.requiresPlan && ! this.props.freeWithPlan ) {
			return null;
		}
		return this.translate( '%(cost)s {{small}}/year{{/small}}', {
			args: { cost: this.props.price },
			components: { small: <small /> }
		} );
	},
	render() {
		const classes = classNames( 'domain-product-price', {
			'is-free-domain': this.props.freeWithPlan,
			'is-with-plans-only': this.props.requiresPlan,
			'is-placeholder': this.props.isLoading
		} );

		if ( this.props.isLoading ) {
			return <div className={ classes }>{ this.translate( 'Loading…' ) }</div>;
		}

		return (
			<div className={ classes }>
				<span className="domain-product-price__price">{ this.priceText() }</span>
				{ this.subMessage() }
			</div>
		);
	}
} );

export default DomainProductPrice;
