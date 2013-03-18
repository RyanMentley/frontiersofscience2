
window.message = function(message) {

	// Prepare Message
	var tmp = $('<p>').text(message);

	// Append Message
	$('.messages').first().append(tmp);

	// Send Confirmation
	window.space.confirmation('Received On: ' + (new Date()).getTime());

}
