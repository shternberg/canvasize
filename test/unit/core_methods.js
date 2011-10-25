module( "core::methods", { teardown: moduleTeardown } );

test( "availableEffects()", 2, function() {
	canvasize.effects.effect1 = {};
	canvasize.effects.effect2 = {};

	equal( /effect1,effect2/.exec( canvasize.availableEffects() ), "effect1,effect2", "New effects are avilable" );

	delete canvasize.effects.effect1;
	delete canvasize.effects.effect2;
	
	equal( /effect1,effect2/.exec( canvasize.availableEffects() ), null, "Effects removed" );
});

getSourceTestCase = function( type ) {
	var image =  type === "src" ? dummy.srcImage : dummy.uriImage;

	return [
		{ test: image.attr( "src" ), msg: "from string" },
		{ test: image, msg: "from image object" },
		{ test: $( "<div>" ).css( { "background-image": "url(" + image.attr( "src" ) + ")" } ), msg: "from DOM element DIV" },
		{ test: $( "<span>" ).css( { "background-image": "url(" + image.attr( "src" ) + ")" } ), msg: "from DOM element SPAN" },
		{ test: $( "<a>" ).css( { "background-image": "url(" + image.attr( "src" ) + ")" } ), msg: "from DOM element A" }
	];
}

test( "getSource(String|Element)", 10, function() {
		var source = function(el) {
			return canvasize.getSource(el);
		}
		$.each( getSourceTestCase('src'), function() {
			equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( source( this.test ) )[ 0 ], dummy.srcImage.attr( "src" ), "src " + this.msg );
		});
		$.each( getSourceTestCase('uri'), function() {
			equal( source( this.test ), dummy.uriImage.attr( "src" ), "data-uri " + this.msg );
		});
});

test( "setSource(imageObject, swappingImage)", 2, function() {
		var image = $( "<img>" );
		canvasize.setSource( image, "#" );
		equal( image.attr( "src" ), "#", "Make sure src is set correctly" );

		var image = $( "<div>" );
		canvasize.setSource( image, dummy.uriImage.attr( "src" ) );
		equal( canvasize.strip( image.css( "background-image" ) ), dummy.uriImage.attr( "src" ) , "Make sure background-image is set correctly");
});

stripTestCase = [
	{ test: "{query}", msg: "" },
	{ test: "'{query}'", msg: "with single quotes" },
	{ test: "\"{query}\"", msg: "with double quotes" },
	{ test: "url({query})", msg: "with url wrapping" },
	{ test: "url('{query}')", msg: "with url wrapping and single quotes" },
	{ test: "url(\"{query}\")", msg: "with url wrapping and double quotes" },
];

test( "strip(String)", 6, function() {
	var query = "image.jpg";
	$.each( stripTestCase, function() {
		equal( canvasize.strip( this.test.replace( "{query}", query ) ), query, "String " + this.msg );
	});
});  

test( "strip(Data-Uri)", 6, function() {
	var query = dummy.uriImage.attr( "src" );
	$.each( stripTestCase, function() {
		equal( canvasize.strip( this.test.replace( "{query}", query ) ), query, "Data-Uri " + this.msg );
	});
});

test( "generateCacheKey(String)", 3, function() {
		equal( canvasize.generateCacheKey( "some string with !@#$$%^&*(;'" ), 305444943, "String with special characters" );
		equal( canvasize.generateCacheKey( dummy.brokenUrl ), 305453680, "Make sure that src checksum is right" );
		equal( canvasize.generateCacheKey( dummy.uriImage.attr( "src" ) ), 305950020, "Make sure that data-uri checksum is right" );
});

asyncTest("loadImage(broken-url)", 2, function() {
	canvasize.loadImage( dummy.brokenUrl )
	.fail( function( error ) {
		ok($( error.target ).is( "img" ), "Broken url return object is image");
		ok( true, "Broken url is caught");
	})
	.always( function() { start() });
});

asyncTest("loadImage(src)", 1, function() {	
	canvasize.loadImage( dummy.srcImage.attr( "src" ) )
	.done( function( loadedImage ) {
		equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( loadedImage.src ), dummy.srcImage.attr( "src" ), "src Image is loaded ok");
	})
	.always( function( ) { start() });
});

asyncTest("loadImage(data-uri)", 1, function() {
	canvasize.loadImage( dummy.uriImage.attr( "src" ) )
	.done( function( loadedImage ) {
		equal( loadedImage.src, dummy.uriImage.attr( "src" ), "data-uri Image is loaded ok");
	})
	.always( function( ) { start() });
});

asyncTest("loadImageCached(String)", 7, function() {
	canvasize.loadImageCached( dummy.brokenUrl )
	.fail( function( error ) {
		ok($( error.target ).is( "img" ), "Broken url return object is image");
		ok( true, "Broken url is caught");
	})
	.always( function() { start() });
	
	stop(5);
	canvasize.loadImageCached( dummy.srcImage.attr( "src" ) )
	.done( function( loadedImage ) {
		equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( loadedImage.src ), dummy.srcImage.attr( "src" ), "src Image is loaded ok");
	})
	.always( function( ) { start() });

	canvasize.loadImageCached( dummy.uriImage.attr( "src" ) )
	.done( function( loadedImage ) {
		equal( loadedImage.src, dummy.uriImage.attr( "src" ), "data-uri Image is loaded ok");
	})
	.always( function( ) { start() });

	canvasize.cache[ canvasize.generateCacheKey( dummy.brokenUrl ) ]
	.fail( function( error ) {
		ok($( error.target ).is( "img" ), "Cache contains broken image");
	})
	.always( function() { start() });

	canvasize.cache[ canvasize.generateCacheKey( dummy.srcImage.attr( "src" ) ) ]
	.done( function( loadedImage ) {
		equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( loadedImage.src ), dummy.srcImage.attr( "src" ), "Cache contains src image");
	})
	.always( function() { start() });

	canvasize.cache[ canvasize.generateCacheKey( dummy.uriImage.attr( "src" ) ) ]
	.done( function( loadedImage ) {
		equal( loadedImage.src, dummy.uriImage.attr( "src" ), "Cache contains data-uri image");
	})
	.always( function() { start() });
});

test("swap(imageObject)", 9, function() {

	raises(function() {
		canvasize.swap( dummy.uriImage );
	}, "Image data is not set - must throw error to pass");


	var srcImage =  dummy.srcImage.clone()
		.data( canvasize.config.dataKey, { "source": dummy.uriImage.attr( "src" ) } ),
		srcImageData = srcImage.data( canvasize.config.dataKey );

	canvasize.swap( srcImage );

	equal( srcImageData.source, dummy.srcImage.attr( "src" ), "Effect swap data attribute" );
	equal( srcImage.attr( "src"), dummy.uriImage.attr( "src" ), "Effect swap src attribute" );

	canvasize.swap( srcImage );

	equal( srcImageData.source, dummy.uriImage.attr( "src"), "Effect swap back data attribute" );
	equal( srcImage.attr( "src"), dummy.srcImage.attr( "src"), "Effect swap  back src attribute" );

	var element =  $( "<div>" )
		.css( { "background-image": "url(" + dummy.srcImage.attr( "src" ) + ")" } )
		.data( canvasize.config.dataKey, { "source": dummy.uriImage.attr( "src" ) } ),
		elementImageData = element.data( canvasize.config.dataKey );	

	canvasize.swap( element );

	equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( elementImageData.source ), dummy.srcImage.attr( "src" ), "Effect swap data attribute" );
	equal( canvasize.strip( element.css( "background-image" ) ), dummy.uriImage.attr( "src" ), "Effect swap background-image attribute" );

	canvasize.swap( element );

	equal( elementImageData.source, dummy.uriImage.attr( "src"), "Effect swap back data attribute" );
	equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( element.css( "background-image" ) ), dummy.srcImage.attr( "src"), "Effect swap  back background-image attribute" );
});

asyncTest("process(imageObject, settings)", 6, function() {
	canvasize.effects.testEffect = function( settings, effect ) { effect.resolve( "processedImageData", settings ) };

	canvasize.loadImage( dummy.uriImage.attr( "src" ) )
	.done( function( loadedImage ) {

		canvasize.process( loadedImage, { effect: "testEffect" } )
		.done(function( processedImageData, settings ) {
			equal( processedImageData, "processedImageData", "Make sure processing engine is working" );

			ok( $( settings.canvas ).is( "canvas" ), "Make  canvas is Ok" );
			
			ok( (typeof settings.ctx === "object" ), "Make sure that context is Ok" );
			
			ok( (typeof settings.data === "object" ), "Make sure image data is passed through" );
			
			equal( settings.effect, "testEffect", "Make sure effect alias is correct" );
			
			ok( $( settings.image ).is( "img" ), "Make sure image object is passed through" );
			
		})
		.always( function() {
			start();
			delete canvasize.effects.testEffect;
		});

	});
});


asyncTest("initialize( images, promises, options )", 7, function() {
	var promises = [],
	options = {};

	canvasize.effects.testEffect = function( settings, effect ) { effect.resolve( dummy.uriImage.attr( "src"), settings ) };

	var images = $();
	images.push( $( "<img>", { src: dummy.srcImage.attr( "src") } ) );
	images.push( $( "<div>" ).css("background-image", "url(" + dummy.srcImage.attr( "src")  + ")" ) );
	images.push( $( "<span>" ).css("background-image", "url(" + dummy.srcImage.attr( "src")  + ")" ) );

	canvasize.initialize( images , promises, { effect: "testEffect" } );

	$.when.apply( null, promises )
	.always( function() {

		ok( this.isResolved(), "Deferred object is in the resolved state" )
		equal( images.length, 3, "Count processed image" );

		images.each(function(idx) {
		  equal( canvasize.getSource( this ), dummy.uriImage.attr( "src"), "Image " + idx + " Initialized successfully");
		});

		start();
	});
	
	stop();

	var brokenImages = $.extend( {}, images );
	brokenImages.push( $( "<img>", { src: dummy.brokenUrl } ) );

	var brokenPromises = [];

	canvasize.initialize( brokenImages , brokenPromises, { effect: "testEffect" } );

	$.when.apply( null, brokenPromises )
	.always( function() {
		ok( this.isRejected(), "Deferred object is in the rejected state" )
		equal( brokenPromises.length, 4, "Count broken promises" );
		start();
		delete canvasize.effects.testEffect;
	});

});