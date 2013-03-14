(function($) {

	// Namespace
	var ns = {};

/*

Method 1:

Spawn Second Window.
Send operations to that window with direct calls.
Test triggering events from scripts available on that window.

Method 2:

Spawn Second Window.
Use sendMessage and receiveMessage to handle event triggers.

*/


	console.log(window.length);

})(jQuery);