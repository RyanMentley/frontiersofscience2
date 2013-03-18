
// Handle confirmations
window.confirmation = function(message) {

	// Prepare Message
	var tmp = $('<p>').text(message);

	// Append Message
	$('.confirmations').first().append(tmp);

}

// Onload
$(function() {

	// Assign & Open Space & create reference back to earth
	$('input#open').on('click', function() {
		if (!window.earth) window.earth = window.open('earth.html');
		window.earth.space = window;
	});

	// Test Handlers
	$('input#send').on('click', function() {
		window.earth.message((new Date()).getTime());
	});

});
