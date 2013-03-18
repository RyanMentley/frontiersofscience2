(function($) {

	// Namespace
	var ns = {};

	// Message Handler
	ns.handleMessage = function(e) {

		// Process Message Received
		var tmp = $('<p>').text(e.originalEvent.data);

		// Append message to screen
		$('.confirmations').first().append(tmp);

	};

	// Onload
	$(function() {

		// Assign & Open Space
		$('input#open').on('click', function() {
			if (!ns.earth) ns.earth = window.open('earth.html');
		});

		// Test Handlers
		$('input#send').on('click', function() {
			ns.earth.postMessage((new Date()).getTime(), '*');
		});

		// Establish Listener on This Side
		$(window).on('message', ns.handleMessage);

	});

})(jQuery);