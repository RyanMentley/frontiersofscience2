(function($) {

	// Namespace
	var ns = {};

	ns.handleMessage = function(e) {

		// Update source if required
		if (!ns.space) {
			ns.space = e.originalEvent.source;
		} else if (ns.space !== e.source) {
			ns.space = e.originalEvent.source;
		}

		// Process Message
		var tmp = $('<p>').text(e.originalEvent.data);

		// Append Message
		$('.messages').first().append(tmp);

		// Send Confirmation Response
		ns.space.postMessage('Received on: ' + (new Date()).getTime(), '*');

	}

	// Establish Event Listener
	$(window).on('message', ns.handleMessage);

})(jQuery);