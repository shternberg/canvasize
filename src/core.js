var canvasize = {

	// Handle various error scenarios
	error: function( message, action, level ) {
		canvasize.config.debug && (function() {
			// According to Crockford advice
			var error = {
				level: level || "error",
				message: message || "error",
				action: action || "log"
			}; 
			switch( action ) {
				case "stop now":
					throw error;
				case "warn":
					console.warn( message );
				break;
				default:
					console.log( message );
			}
		})();
	},

	// Contains loaded effects
	effects : {},

	// retrun comma separated list of loaded effects
	availableEffects: function() {
		var effects = [ ];
		$.each( canvasize.effects, function( effect ) {
			effects.push( effect ) ;
		});
		return effects.join();
	},

	// Global cache store all loaded images
	cache: {},

	// Default configuration 
	config: {
		dataKey: "canvasize",
		debug: true,
		cacheEnabled: true
	},

	// Alternative method:!!(window.HTMLCanvasElement)
	isCanvasSupported: "HTMLCanvasElement" in window,

	// Determine which property contains image source
	// and replace t with new data
	setSource: function( imageObject, swappingImage ) {
		imageObject.is( "img" ) &&
		imageObject.attr( "src", swappingImage ) ||
		imageObject.css( { "background-image": "url(" + swappingImage + ")" } );
	},

	// Determine which property contains image source
	// and return valid image data
	getSource: function( imageObject ) {
		return typeof imageObject === "string" ?
			imageObject :
			imageObject.is( "img" )  ?
				imageObject.attr( "src" ) :
				canvasize.strip( imageObject.css( "background-image" ) );
	},

	// remove URL wrapping and quotes
	strip: function( dataURI ) {
		return (/^[url\(]*["']*(.*?)["']*[\)]*$/i).exec( dataURI )[ 1 ];
	},

	// Generete unique cache key
	// Using checksum implementation
	// OLD: ~ string.slice( -100 );
	generateCacheKey: function( string ) {
		var i, checksum = 0x12345678;
		for ( i = 0; i < string.length; i++ ) {
			checksum += ( string.charCodeAt( i ) * i );
		}
		return checksum;
	},
	// Cache wrapper to prevent redundant requests
	// Deferred object
	loadImageCached: function( source ) {
		cacheKey = canvasize.generateCacheKey( source );
		if ( !canvasize.cache[ cacheKey ] ) {
			canvasize.cache[ cacheKey ] = $.Deferred(function( deferred ) {
				canvasize.image( deferred, source );
			}).promise();
		}
		return canvasize.cache[ cacheKey ].done();
	},

	// Deferred object
	loadImage: function( source ) {
		return $.Deferred(function( deferred ){
			canvasize.image( deferred, source );
		}).promise();
	},

	// Preload image data to browser cache
	image: function( deferred, source ) {
		var image = new Image();

		function cleanUp() {
			image.onload = image.onerror = null;
		}

		deferred.then( cleanUp, cleanUp );

		image.onload = function() {
			deferred.resolve( this );
		};

		image.onerror = deferred.reject;
		image.src = source;
	},

	// So we store previous image source in data property
	// And this method is switching back and forth between old and new source
	// TODO: implement source switch relying on current effect 
	swap: function( imageObject ) {
		data = imageObject.data( canvasize.config.dataKey ) || 
		canvasize.error( "document object model is changed", "stop now", "critical error" );

		data && (function () {
			swappingImage = data.source;
			data.source = canvasize.getSource( imageObject );
			canvasize.setSource( imageObject, swappingImage );
		})();
	},

	// Apply visulal effect to Image Object
	// Return new image data-uri
	// Deferred object
	process: function( imageObject, settings ) {
		return $.Deferred(function( effect ){

			var canvas = $( "<canvas>" )[ 0 ],
				ctx = canvas.getContext( "2d" );

			$.extend( canvas, {
				width: imageObject.width,
				height: imageObject.height,
				top: 0, left: 0
			});

			ctx.drawImage( imageObject, 0, 0 );
			
			$.extend( settings, {
				canvas: canvas,
				ctx: ctx,
				data: ctx.getImageData( 0, 0, canvas.width, canvas.height ).data,
				image: imageObject
			});

			canvasize.effects[ settings.effect ]( settings, effect );

		}).promise();
	},

	// Basic logic.
	// Run through affected elements and decide with actions to take
	initialize: function( images, promises, options ) {
		images.each(function( idx, image ) {
			promises.push(

				$.Deferred(function( promise ) {
					canvasize[   "loadImage" + ( options.cacheEnabled ? "Cached" : "" ) ]( canvasize.getSource( $( image ) ) )
					.done(function( loadedImage ) {

						canvasize.process( loadedImage, options )
						.done(function( processedImage ) {

							$( image ).data( canvasize.config.dataKey, { "source": processedImage } );
							canvasize.swap( $( image ) );
							promise.resolve();

						});

					})
					.fail(function() { promise.reject( image ); });
				}).promise()

			);
		});
	}
};
