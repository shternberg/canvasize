// Apparently canvasize
var pluginName = "canvasize";

// Smple wrapper to $.canvasize low-level method
$.fn[ pluginName ] = function( effect, options ) {
	return  new $.canvasize( this,  effect, options );
};

// This is a low-level method
$[ pluginName ] = function( images, effect, options ) {

	var plugin = this,
	promises = [];

	// Readonly property. return settings of the current instance
	plugin.settings = $.extend( {effect: effect}, canvasize.config, options );

	// Indicates the ready state of the current instance
	plugin.ready = function(requestFunction) {
		$.when.apply( null, promises ).done(function(){
			requestFunction();
		});
	};

	// Simple toggle between current image state and previous one
	// TODO: implement effect dependent toggle
	plugin.toggle = function() {
		plugin.ready(
			function() {
				images.each(function() {
					canvasize.swap( $( this ) );
				});
			}
		);
	};

	// Handle some basic errors
	try {
		images || canvasize.error ( "specify at least one DOM element to convert", "stop now" );
		typeof effect === "string" || canvasize.error( "specify desired effect", "stop now");
		canvasize.initialize( images, promises, $.extend( {}, plugin.settings ) );
	}
	catch( error ) {
		canvasize.error( error.message, "stop now" );
	}
};