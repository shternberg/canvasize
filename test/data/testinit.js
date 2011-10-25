(function () {
	/**
	* Ensures that tests have cleaned up properly after themselves. Should be passed as the
	* teardown function on all modules' lifecycle object.
	*/
	this.moduleTeardown = function () {
		QUnit.reset();
	}
}());