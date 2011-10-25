// Run minified source from dist (do make first)
// Should be loaded before QUnit but after src
(function() {
	if ( /canvasize\=min/.test( window.location.search ) ) {
		document.write(unescape("%3Cscript%20src%3D%27../dist/canvasize.min.js%27%3E%3C/script%3E"));
	}
})();