/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import unescapeString from 'lodash/unescape';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import NoResults from './no-results';
import QueryTerms from 'components/data/query-terms';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingTermsForQuery,
	getTermsForQuery
} from 'state/terms/selectors';
import localize from 'lib/mixins/i18n/localize';

function sortBranch( items ) {
	return sortBy( items, function( item ) {
		return item.name.toLowerCase();
	} );
}

class TermSelectorList extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			selectedIds: this.getSelectedIds()
		};
	}

	getSelectedIds( selected ) {
		const selectedObjects = selected || this.props.selected;
		return selectedObjects.map( function( item ) {
			if ( ! item.ID ) {
				return item;
			}

			return item.ID;
		} );
	}

	renderItem( item ) {
		const { multiple, analyticsPrefix, defaultCategoryId, onChange, taxonomy, translate } = this.props;
		const { selectedIds } = this.state;
		const itemId = item.ID;
		const name = unescapeString( item.name ) || translate( 'Untitled' );
		const checked = includes( selectedIds, itemId );
		const inputType = multiple ? 'checkbox' : 'radio';
		const domId = taxonomy + '-option-' + itemId;
		let disabled;

		if ( multiple && checked && defaultCategoryId &&
				( 1 === selectedIds.length ) &&
				( defaultCategoryId === itemId ) ) {
			disabled = true;
		}

		const input = (
			<input id={ domId } type={ inputType } name="terms"
				value={ itemId }
				onChange={ () => {} }
				disabled={ disabled }
				checked={ checked } />
		);

		return (
			<li key={ 'category-' + itemId }>
				<label>{ input } { name }</label>
				{ item.items ? this.renderHierarchy( item.items, true ) : null }
			</li>
		);
	}

	renderHierarchy( items, isRecursive ) {
		const depth = isRecursive ? '' : 'depth-0';

		items = sortBranch( items );

		return (
			<ul className={ depth }>
				{ items.map( this.renderItem, this ) }
			</ul>
		);
	}

	renderPlaceholderItem() {
		const { multiple, translate } = this.props;
		const inputType = multiple ? 'checkbox' : 'radio';

		return (
			<li>
				<input className="placeholder-text" type={ inputType } name="terms" disabled={ true } />
				<label><span className="placeholder-text">{ translate( 'Loading list of options...' ) }</span></label>
			</li>
		);
	}

	renderPlaceholder() {
		return ( <ul>{ this.renderPlaceholderItem() }</ul> );
	}

	render() {
		const { terms, loading, siteId, query } = this.props;
		console.log( 'rendering', this.props );

		return (
			<form>
				<QueryTerms
					siteId={ siteId }
					taxonomy="category"
					query={ query }
				/>
				{ loading ? this.renderPlaceholder() : this.renderHierarchy( terms ) }
			</form>
		);
	}
}

TermSelectorList.propTypes = {
	terms: PropTypes.array,
	taxonomy: PropTypes.string,
	multiple: PropTypes.bool,
	selected: PropTypes.array,
	search: PropTypes.string,
	siteId: PropTypes.number,
	translate: PropTypes.func
};

TermSelectorList.defaultProps = {
	selected: []
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	let query = {};
	const { taxonomy, search } = ownProps;

	// Only set search if the string has a length
	if ( search && search.length ) {
		query.search = search;
	}

	return {
		loading: isRequestingTermsForQuery( state, siteId, taxonomy, query ),
		terms: getTermsForQuery( state, siteId, taxonomy, query ),
		siteId,
		query
	};
} )( localize( TermSelectorList ) );

