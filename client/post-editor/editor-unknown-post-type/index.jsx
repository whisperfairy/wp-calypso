/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import localize from 'lib/mixins/i18n/localize';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, getEditorNewPostPath } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getPostTypes, getPostType } from 'state/post-types/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import Button from 'components/button';
import Dialog from 'components/dialog';

function EditorUnknownPostType( { translate, types, typeObject, writePostPath, siteSlug } ) {
	if ( ! types || typeObject ) {
		// [TODO]: React 15 supports returning `null` from function components
		return <noscript />;
	}

	const buttons = [
		<Button href={ writePostPath } primary>
			{ translate( 'Write a Post' ) }
		</Button>,
		<Button href={ `/stats/${ siteSlug }` }>
			{ translate( 'Return to My Sites' ) }
		</Button>
	];

	return (
		<Dialog isVisible buttons={ buttons }>
			<h1>{ translate( 'Whoops!' ) }</h1>
			<p>{ translate( 'The post type is not supported by this site.' ) }</p>
		</Dialog>
	);
}

EditorUnknownPostType.propTypes = {
	translate: PropTypes.func,
	types: PropTypes.object,
	typeObject: PropTypes.object,
	writePostPath: PropTypes.string,
	siteSlug: PropTypes.string
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const type = getEditedPostValue( state, siteId, getEditorPostId( state ), 'type' );

	return {
		types: getPostTypes( state, siteId ),
		typeObject: getPostType( state, siteId, type ),
		writePostPath: getEditorNewPostPath( state, siteId ),
		siteSlug: getSiteSlug( state, siteId )
	};
} )( localize( EditorUnknownPostType ) );
