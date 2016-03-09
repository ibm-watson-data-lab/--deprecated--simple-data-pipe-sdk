//-------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//-------------------------------------------------------------------------------

'use strict';

/**
 * CDS Labs module
 * 
 *   Base Connector object that every connector implementation  should inherit from
 * 
 * @author David Taieb
 */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function connector(options){
	var id = null;
	var label = null;
	var steps = [];
	
	options = options || {};
	
	var defaults = {
		useOAuth:true,				//Whether this connector requires oAuth (true by default)
		extraRequiredFields:[]		//Additional required field this connector may need
	};
	
	_.forIn(defaults, function(value, key) {
		if ( !options.hasOwnProperty(key) ){
			options[key] = value;
		}
	});
	
	/**
	 * getId: return the unique id for this connector
	 */
	this.getId = function(){
		return id;
	};
	
	/**
	 * setId: set the unique id for this connector
	 */
	this.setId = function( _id ){
		id = _id;
	};
	
	/**
	* setOption: set a key/value pair option
	*/
	this.setOption = function( key, value ){
		options[key] = value;
	};
	
	/**
	* getOption: get the option value identified by the key
	*/
	this.getOption = function( key ){
		return options.hasOwnProperty(key) ? options[key] : null;
	};
	
	/**
	 * getLabel: return the unique id for this connector
	 */
	this.getLabel = function(){
		return label;
	};
	
	/**
	 * setLabel: set the unique id for this connector
	 */
	this.setLabel = function( _label ){
		label = _label;
	};
	
	/**
	 * setSteps: set the running steps related to this connector
	 * steps must inherit from {@link pipeRunStep}
	 */
	this.setSteps = function( _steps ){
		steps = _steps;
	};
	
	/**
	 * getSteps: get the running steps related to this connector
	 */
	this.getSteps = function(){
		return steps;
	};
	
	/**
	 * runStarted: lifecycle event called when a new run is started for this connector
	 */
	this.runStarted = function(readyCallback){
		//console.log("New Run started");
		return readyCallback();
	};
	
	/**
	 * runStarted: lifecycle event called when a new run is finished for this connector
	 */
	this.runFinished = function(){
		//console.log("Run Finished");
	};
	
	/**
	 * Initialize the connector
	 * @param app: express app to register end points specific to the connector
	 */
	this.init = function( app ){
		//console.log("Connector initialized");
	};
	
	/**
	 * authCallback: callback for OAuth authentication protocol
	 * @param oAuthCode
	 * @param pipeId
	 * @param callback(err, pipe )
	 */
	this.authCallback = function( oAuthCode, pipeId, callback ){
		return callback({
			message : 'Not Authorized',
			code: 401
		});
	};
	
	/**
	 * connectDataSource: connect to the backend data source
	 * @abstract
	 * @param req
	 * @param res
	 * @param pipeId
	 * @param url: login url
	 * @param callback(err, results)
	 */
	this.connectDataSource = function( req, res, pipeId, url, callback ){
		return callback({
			message : 'Not Authorized',
			code: 401
		});
	};
	

	/*
	   ----------------------------------------------------------------------------------------------
	   The following methods are applicable only to connectors that use the built-in 
	   data source authentication support for Passport (http://passportjs.org/).
	   ----------------------------------------------------------------------------------------------

	 */

	/**
	 * If applicable. returns an instance of the Passport strategy (http://passportjs.org/docs/configure) used by this connector. 
	 * @param {Object} pipe - data pipe configuration
	 * @return {Object} null (default) if Passport is not used or an instance of the strategy used by the connector
	 */
	this.getPassportStrategy = function(pipe){
		// default: this connector does not use the built-in passport support 
		// to authenticate with the cloud data source
		// (http://passportjs.org)
		return null;
	};

    /**
     * Returns passport strategy specific authorization parameters that will be passed
     * to passport's authenticate function (http://passportjs.org/docs/authenticate)
     * when the authorization token request is made
     * @return {Object} empty {} (default) or key/value pairs of parameters
     */
	this.getPassportAuthorizationParams = function() {
	   // default: no additional authorization parameters will be passed	
       return {};
	};

	/**
	 * Invoked after oAuth authentication processing has successfully completed. Extract the desired oAuth information
	 * (such as access_token or refresh_token) from info object and attach it to the pipe configuration to make it available
	 * during data pipe runs. 
	 * @param {Object} info - information returned by the Passport verify callback, as defined in getPassportStrategy
	 * @param {Object} pipe - data pipe configuation 
	 * @param {callback} callback -  Callback that handles the response(err, pipe ). If err is specified, an error is raised and the pipe configuration not modified. 
	 * 
	 */
	this.passportAuthCallbackPostProcessing = function( info, pipe, callback ){
		// default: no post-processing is performed
		//  in case of an error: callback(errmsg, null)
		//  in case of success: callback(null, updated_pipe_configuration)
		return callback();
	};
	
	/*
	   ----------------------------------------------------------------------------------------------
	   General purpose methods
	   ----------------------------------------------------------------------------------------------

	 */

	/**
	 * toJSON serialization function
	 */
	this.toJSON = function(){
		return {
			id: this.getId(),
			label: this.getLabel(),
			steps: this.getSteps(),
			options: options,
			path: this.path || null
		};
	};
}

//Export the class
module.exports = connector;