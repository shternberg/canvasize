module("plugin", {
	setup: function() {
		canvasize.effects.testEffectOne = function( settings, effect ) { effect.resolve( dummy.uriImage.attr( "src"), settings ) };
		canvasize.effects.testEffectTwo = function( settings, effect ) { effect.resolve( dummy.srcImage.attr( "src"), settings ) };
		
		this.images = $();
		this.images.push( $( "<img>", { src: dummy.srcImage.attr( "src") } ) );
		this.images.push( $( "<div>" ).css("background-image", "url(" + dummy.srcImage.attr( "src")  + ")" ) );
		this.images.push( $( "<span>" ).css("background-image", "url(" + dummy.srcImage.attr( "src")  + ")" ) );
	},
	teardown: function() {
		//this.images = $();
		//delete canvasize.effects.testEffectOne;
		//delete canvasize.effects.testEffectTwo;
		QUnit.reset();
	}
});


asyncTest( "$.canvasize( images, effect, options )", 6, function() {

	var images = this.images;

	var testEffectOne = new $.canvasize( images, "testEffectOne" );

	testEffectOne.ready(function(){

		images.each(function() {
			equal(canvasize.getSource( this ), dummy.uriImage.attr( "src"), "Element " + this[0].tagName + " effect one is ok");
		});
		
		var testEffectTwo = new $.canvasize( images, "testEffectTwo" );
		testEffectTwo.ready(function(){
			images.each(function() {
				equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( canvasize.getSource( this ) ), dummy.srcImage.attr( "src"), "Element " + this[0].tagName + " effect two is ok");
			});
			start();
		});
		
	});

});

asyncTest( ".canvasize( effect, options )", 6, function() {

	var images = this.images;

	var testEffectOne = images.canvasize( "testEffectOne" );

	testEffectOne.ready(function(){

		images.each(function() {
			equal(canvasize.getSource( this ), dummy.uriImage.attr( "src"), "Element " + this[0].tagName + " effect one is ok");
		});
		
		var testEffectTwo = images.canvasize( "testEffectTwo" );
		testEffectTwo.ready(function(){
			images.each(function() {
				equal( RegExp( dummy.srcImage.attr( "src" ) ).exec( canvasize.getSource( this ) ), dummy.srcImage.attr( "src"), "Element " + this[0].tagName + " effect two is ok");
			});
			start();
		});
		
	});

});

test( "plugin.settings", 1, function() {
	var images = this.images;
	var testEffectOne = images.canvasize( "testEffectOne", {cacheEnabled: false, param: true } );

	deepEqual( testEffectOne.settings, {
	  "effect": "testEffectOne",
	  "dataKey": "canvasize",
	  "debug": true,
	  "cacheEnabled": false,
	  "param": true
	}, "Make sure that settings are ok" );

});



asyncTest( "plugin.ready( function )", 2, function() {

	var images = this.images;
	var testEffectOne = images.canvasize( "testEffectOne" );
	testEffectOne.ready(function() {
		ok( true, "Make sure method is exist through element.canvasize" );
	});
	
	var testEffectOne = new $.canvasize(images, "testEffectOne" );
	testEffectOne.ready(function() {
		ok( true, "Make sure method is exist through new $.canvasize" );
		start();
	});

});



asyncTest( "plugin.toggle", 3, function() {
	var images = this.images,
	initialImages = $.extend({}, this.images),
	processedImages;
	
	var testEffectOne = images.canvasize( "testEffectOne" );

	testEffectOne.ready(function() {
		processedImages = $.extend({}, images);
	});
	
	testEffectOne.toggle();
	
	testEffectOne.ready(function() {
		deepEqual( images, initialImages, "toggle one is ok - initial" );
	});

	testEffectOne.toggle();

	testEffectOne.ready(function() {
		deepEqual( images, processedImages, "toggle two is ok - processed" );

	});

	testEffectOne.toggle();
	testEffectOne.toggle();
	testEffectOne.toggle();
	testEffectOne.toggle();
	
	testEffectOne.ready(function() {
		deepEqual( images, processedImages, "toggle multiply is ok - processed" );
		start();
	});

});


test( "errors handling", 2, function() {
	raises(function() {
		new $.canvasize();
	}, "Raise Error: Ellements aren't specified ");

	raises(function() {
		new $.canvasize( this.images );
	}, "Raise Error:  Effect isn't specified ");
});