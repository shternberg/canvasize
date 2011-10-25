(function () {
	this.dummy = {
		// Dummy Image Object
		srcImage: $( "<img>", {
			src: "data/dummy.gif" 
		}),

		// Dummy Image Object with data-uri
		uriImage: $( "<img>", {
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg=="
		}),
		brokenUrl: "/test/broken/link/image.jpg"
	}
}());