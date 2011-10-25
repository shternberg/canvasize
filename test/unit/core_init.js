module( "core::init", { teardown: moduleTeardown });

test( "effects", 5, function() {
	ok( $.isPlainObject( canvasize.effects ), "Make sure that effects are available" ); 

	canvasize.effects.effect1 = {};
	canvasize.effects.effect2 = {};

	equal( /effect1/.exec( canvasize.availableEffects() ), "effect1", "effect1 is exist" );
	equal( /effect2/.exec( canvasize.availableEffects() ), "effect2", "effect2 is exist" );

	delete canvasize.effects.effect1;
	delete canvasize.effects.effect2;

	notEqual( /effect1/.exec( canvasize.availableEffects() ), "effect1", "effect1 is not exist" );
	notEqual( /effect2/.exec( canvasize.availableEffects() ), "effect2", "effect2 is not exist" );
});

test( "cache", 1, function() {  
	ok( $.isPlainObject( canvasize.cache ), "Make sure that cache is empty" ); 
});

test("config", 3, function() {  
	ok( typeof canvasize.config.dataKey === "string", "Make sure that data Key is set" ); 
	ok( canvasize.config.debug, "Make sure that debug mode is enabled" ); 
	ok( canvasize.config.cacheEnabled, "Make sure that cache is activated" ); 
});

test( "isCanvasSupported", 1, function() {  
	ok( canvasize.isCanvasSupported, "Make sure that canvas is supported" );
});


