/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import localize from 'lib/mixins/i18n/localize';

class TermSelectorSearch extends PureComponent {
	constructor( props ) {
		super( props );
		this.boundSearch = this.onSearch.bind( this );
	}

	onSearch( event ) {
		const searchValue = event.target.value;
		this.props.onSearch( searchValue );
	}

	render() {
		const { searchTerm, translate } = this.props;

		return (
			<div className="term-selector__search">
				<Gridicon icon="search" size={ 18 } />
				<input type="search"
					placeholder={ translate( 'Search…', { textOnly: true } ) }
					value={ searchTerm }
					onChange={ this.boundSearch } />
			</div>
		);
	}
}

TermSelectorSearch.propTypes = {
	searchTerm: PropTypes.string,
	onSearch: PropTypes.func
};

TermSelectorSearch.defaultProps = {
	onSearch: () => {}
};

export default localize( TermSelectorSearch );
