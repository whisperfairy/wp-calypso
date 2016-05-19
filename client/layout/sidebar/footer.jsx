/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

import Button from 'components/button';
import { localize } from 'i18n-calypso';

const SidebarFooter = ( { translate, children } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button compact borderless href="/help">
			<Gridicon icon="help-outline" /> { translate( 'Help' ) }
		</Button>
	</div>
);

export default localize( SidebarFooter );
