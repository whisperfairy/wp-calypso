/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:reauth-required' );

/**
 * Internal Dependencies
 */
var Dialog = require( 'components/dialog' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormTelInput = require( 'components/forms/form-tel-input' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	observe = require( 'lib/mixins/data-observe' ),
	Notice = require( 'components/notice' ),
	eventRecorder = require( 'me/event-recorder' ),
	userUtilities = require( 'lib/user/utils' );

module.exports = React.createClass( {

	displayName: 'ReauthRequired',

	mixins: [ React.addons.LinkedStateMixin, observe( 'twoStepAuthorization' ), eventRecorder ],

	getInitialState: function() {
		return {
			remember2fa: false,      // Should the 2fa be remembered for 30 days?
			code: '',                // User's generated 2fa code
			smsRequestsAllowed: true // Can the user request another SMS code?
		};
	},

	getCodeMessage: function() {
		var codeMessage = '';

		if ( this.props.twoStepAuthorization.isTwoStepSMSEnabled() ) {
			codeMessage = this.translate(
				'Please check your text messages at the phone number ending with {{strong}}%(smsLastFour)s{{/strong}} ' +
				'and enter the verification code below.', {
					args: {
						smsLastFour: this.props.twoStepAuthorization.getSMSLastFour()
					},
					components: {
						strong: <strong />
					}
				}
			);
		} else {
			codeMessage = this.translate(
				'Please enter the verification code generated by your Authenticator mobile application.'
			);
		}

		return codeMessage;
	},

	submitForm: function( event ) {
		event.preventDefault();
		this.setState( { validatingCode: true } );

		this.props.twoStepAuthorization.validateCode(
			{
				code: this.state.code,
				remember2fa: this.state.remember2fa
			},
			function( error, data ) {
				this.setState( { validatingCode: false } );
				if ( error ) {
					debug( 'There was an error validating that code: ' + JSON.stringify( error ) );
				} else {
					debug( 'The code validated!' + JSON.stringify( data ) );
				}
			}.bind( this )
		);
	},

	codeRequestTimer: false,

	allowSMSRequests: function() {
		this.setState( { smsRequestsAllowed: true } );
	},

	sendSMSCode: function() {
		this.setState( { smsRequestsAllowed: false } );
		this.codeRequestTimer = setTimeout( this.allowSMSRequests, 60000 );

		this.props.twoStepAuthorization.sendSMSCode( function( error, data ) {
			if ( ! error && data.sent ) {
				debug( 'SMS code successfully sent' );
			} else {
				debug( 'There was a failure sending the SMS code.' );
			}
		} );
	},

	preValidateAuthCode: function() {
		return this.state.code.length && this.state.code.length > 5;
	},

	renderSendSMSButton: function() {
		var button;
		if ( this.props.twoStepAuthorization.isTwoStepSMSEnabled() ) {
			button = <FormButton
				disabled={ ! this.state.smsRequestsAllowed }
				isPrimary={ false }
				onClick={ this.recordClickEvent( 'Resend SMS Code Button on Reauth Required', this.sendSMSCode ) }
				type="button">
				{ this.translate( 'Resend SMS Code' ) }
			</FormButton>;
		} else {
			button = <FormButton
				disabled={ ! this.state.smsRequestsAllowed }
				isPrimary={ false }
				onClick={ this.recordClickEvent( 'Send SMS Code Button on Reauth Required', this.sendSMSCode ) }
				type="button">
				{ this.translate( 'Send SMS Code' ) }
			</FormButton>;
		}

		return button;
	},

	renderFailedValidationMsg: function() {
		if ( ! this.props.twoStepAuthorization.codeValidationFailed() ) {
			return null;
		}

		return (
			<FormInputValidation isError text={ this.translate( 'You entered an invalid code. Please try again.' ) } />
		);
	},

	renderSMSResendThrottled: function() {
		if ( ! this.props.twoStepAuthorization.isSMSResendThrottled() ) {
			return null;
		}

		return (
			<div className="reauth-required__send-sms-throttled">
				<Notice
					isCompact={ true }
					showDismiss={ false }
					text={ this.translate(
						'SMS codes are limited to once per minute. Please wait and try again.'
					) } />
			</div>
		);
	},

	render: function() {
		var codePlaceholder = '123456';

		if ( this.props.twoStepAuthorization.isTwoStepSMSEnabled() ) {
			codePlaceholder = '1234567';
		}

		return (
			<Dialog
				autoFocus={ false }
				className="reauth-required__dialog"
				isFullScreen={ false }
				isVisible={ this.props.twoStepAuthorization.isReauthRequired() }
				buttons={ null }
				onClose={ null }
			>
				<p>{ this.getCodeMessage() }</p>

				<p>
					<a
						className="reauth-required__sign-out"
						onClick={ this.recordClickEvent( 'Reauth Required Log Out Link', userUtilities.logout ) }
					>
						{ this.translate( 'Not you? Sign Out' ) }
					</a>
				</p>

				<form onSubmit={ this.submitForm } >
					<FormFieldset>
						<FormLabel htmlFor="code">{ this.translate( 'Verification Code' ) }</FormLabel>
						<FormTelInput
							autoFocus={ true }
							id="code"
							isError={ this.props.twoStepAuthorization.codeValidationFailed() }
							name="code"
							placeholder={ codePlaceholder }
							onFocus={ this.recordFocusEvent( 'Reauth Required Verification Code Field' ) }
							ref="code"
							valueLink={ this.linkState( 'code' ) } />

						{ this.renderFailedValidationMsg() }
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							<FormCheckbox
								checkedLink={ this.linkState( 'remember2fa' ) }
								id="remember2fa"
								name="remember2fa"
								onClick={ this.recordCheckboxEvent( 'Remember 2fa' ) } />
							<span>{ this.translate( 'Remember for 30 days.' ) }</span>
						</FormLabel>
					</FormFieldset>

					{ this.renderSMSResendThrottled() }

					<FormButtonsBar>
						<FormButton
							disabled={ this.state.validatingCode || ! this.preValidateAuthCode() }
							onClick={ this.recordClickEvent( 'Submit Validation Code on Reauth Required' ) }
						>
							{ this.translate( 'Verify' ) }
						</FormButton>

						{ this.renderSendSMSButton() }
					</FormButtonsBar>
				</form>
			</Dialog>
		);
	}
} );
