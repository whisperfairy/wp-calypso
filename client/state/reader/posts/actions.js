import map from 'lodash/map';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';

import { fastPostNormalizationRules } from './normalization-rules';
import normalizer from 'lib/post-normalizer';

function normalizePost( post ) {
	return new Promise( ( resolve, reject ) => {
		normalizer( post, fastPostNormalizationRules, ( err, newPost ) => {
			if ( err ) {
				reject( err );
			} else {
				resolve( newPost );
			}
		} );
	} );
}

function normalizePosts( posts ) {
	return Promise.all( map( posts, normalizePost ) );
}

/**
 * Returns an action object to signal that post objects have been received.
 *
 * @param  {Array}  posts Posts received
 * @return {Object} Action object
 */
export function receivePosts( posts ) {
	return function( dispatch ) {
		return normalizePosts( posts ).then( normPosts => {
			dispatch( {
				type: READER_POSTS_RECEIVE,
				posts: normPosts
			} );
		} ).catch( err => {
			console.error( err );
			throw err;
		} );

	};
}
