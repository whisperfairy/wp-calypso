/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE
} from 'state/action-types';
import {
	receivePost,
	receivePosts,
	requestSitePosts,
	requestSitePost
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	before( () => {
		Chai.use( sinonChai );
	} );

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.restore();
	} );

	describe( '#receivePost()', () => {
		it( 'should return an action object', () => {
			const post = { ID: 841, title: 'Hello World' };
			const action = receivePost( post );

			expect( action ).to.eql( {
				type: POSTS_RECEIVE,
				posts: [ post ]
			} );
		} );
	} );

	describe( '#receivePosts()', () => {
		it( 'should return an action object', () => {
			const posts = [ { ID: 841, title: 'Hello World' } ];
			const action = receivePosts( posts );

			expect( action ).to.eql( {
				type: POSTS_RECEIVE,
				posts
			} );
		} );
	} );

	describe( '#requestSitePosts()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/posts' )
				.reply( 200, {
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} )
				.get( '/rest/v1.1/sites/2916284/posts' )
				.query( { search: 'Hello' } )
				.reply( 200, {
					found: 1,
					posts: [ { ID: 841, title: 'Hello World' } ]
				} )
				.get( '/rest/v1.1/sites/77203074/posts' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSitePosts( 2916284 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: {}
			} );
		} );

		it( 'should dispatch posts receive action when request completes', ( done ) => {
			requestSitePosts( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch posts posts request success action when request completes', ( done ) => {
			requestSitePosts( 2916284 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: {},
					found: 2,
					posts: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Ribs & Chicken' }
					]
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch posts request success action with query results', ( done ) => {
			requestSitePosts( 2916284, { search: 'Hello' } )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					query: { search: 'Hello' },
					found: 1,
					posts: [
						{ ID: 841, title: 'Hello World' }
					]
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch fail action when request fails', ( done ) => {
			requestSitePosts( 77203074 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_REQUEST_FAILURE,
					siteId: 77203074,
					query: {},
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );

				done();
			} ).catch( done );
		} );
	} );

	describe( '#requestSitePost()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/posts/413' )
				.reply( 200, { ID: 413, title: 'Ribs & Chicken' } )
				.get( '/rest/v1.1/sites/2916284/posts/420' )
				.reply( 404, {
					error: 'unknown_post',
					message: 'Unknown post'
				} );
		} );

		after( () => {
			nock.cleanAll();
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			requestSitePost( 2916284, 413 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_REQUEST,
				siteId: 2916284,
				postId: 413
			} );
		} );

		it( 'should dispatch posts receive action when request completes', ( done ) => {
			requestSitePost( 2916284, 413 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POSTS_RECEIVE,
					posts: [
						sinon.match( { ID: 413, title: 'Ribs & Chicken' } )
					]
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch posts posts request success action when request completes', ( done ) => {
			requestSitePost( 2916284, 413 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_REQUEST_SUCCESS,
					siteId: 2916284,
					postId: 413
				} );

				done();
			} ).catch( done );
		} );

		it( 'should dispatch fail action when request fails', ( done ) => {
			requestSitePost( 2916284, 420 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_REQUEST_FAILURE,
					siteId: 2916284,
					postId: 420,
					error: sinon.match( { message: 'Unknown post' } )
				} );

				done();
			} ).catch( done );
		} );
	} );
} );
