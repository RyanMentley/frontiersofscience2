(function($) {

	// Temporary Home for establishing new system
	var ns = {};


	/* Shared Worker Methods */

	// Send operations must be wrapped in try-catch for Opera compatibility
	ns.swSend = function(msg) {

		if (this.sharedWorker) {

			// Try Catch to send a message
			try {

				// Send the Message
				this.sharedWorker.port.postMessage(msg);

			} catch (err) {

				// Manually Run error handler
				this.swError();

			}

		}

	};

	// Try to reset the pages contents
	ns.swError = function(e) {

		console.log("Deleting SW");

		// Unset any requests and sharedworker objects
		delete this.requests;
		delete this.SharedWorker;

		// Rebuild any missing parts
		if (!this.space) {
			this.loadSpace();
		}
		if (!this.earth) {
			this.loadEarth();
		}

		// Remove and Rebuild Buttons
		this.loadButtons();

		// Reset SharedWorker Object
		this.loadSharedWorker();

	};

	ns.swMessage = function(e) {

		// Confirm data received
		if (e.data && e.data.command) {

			// Check for method, then execute it
			if (this.swCommands[e.data.command]) {
				this.swCommands[e.data.command](this, e.data);
			}

		}

	};

	ns.swPrint = function(m) {

		// Append message to system
		if (m == 'earth') {
			this.addEarth();
		} else {
			this.addSpace();
		}

	};

	ns.swRequest = function(request) {

		// Remove Opposing Component & buttons
		if (request == 'earth' && this.space) {
			this.space.remove();
			delete this.space;
			if (this.earth) {
				$('input[type=button]', this.earth).remove();
			}
		} else if (this.earth) {
			this.earth.remove();
			delete this.earth;
			if (this.space) {
				$('input[type=button]', this.space).remove();
			}
		}

	};

	// SharedWorker Message Commands array
	ns.swCommands = {
		'message': function(o, m) {

			// Handle Message
			o.swPrint(m.message);

		},
		'check-requests': function(o) {

			// Return object requests
			if (o.requests) {

				// Send Message
				o.swSend({ 'command': 'request', 'request': o.requests });

				// Delete Requests
				delete o.requests;

			}

		},
		'request': function(o, m) {

			// Check Requests
			o.swRequest(m.request);

		},
		'reset': function(o) {

			// Reset manually
			o.swError();

		}
	};


	/* Interactive Commands */

	ns.addEarth = function() {

		if (this.earth) {
			this.earth.append($('<p>').text((new Date()).getTime()));
		} else if (this.sharedWorker) {
			this.swSend({ 'command': 'message', 'message': 'earth' });
		}

	};

	ns.addSpace = function() {

		if (this.space) {
			this.space.append($('<p>').text((new Date()).getTime()));
		} else if (this.sharedWorker) {
			this.swSend({ 'command': 'message', 'message': 'space' });
		}

	};


	/* System Methods */

	// Load Earth
	ns.loadEarth = function() {

		// Create Earth Container
		this.earth = $('<div>').addClass('earth').append($('<p>').text('I am the Earth.'));

		// Append Earth
		this.append(this.earth);

		// Reference Variable
		var self = this;

		// Add Event Handler
		this.earth.on('click', function() {
			self.addSpace();
		});

	};

	// Load Space
	ns.loadSpace = function() {

		// Create Space Container
		this.space = $('<div>').addClass('space').append($('<p>').text('I am Space.'));

		// Append Space
		this.append(this.space);

		// Reference Variable
		var self = this;

		// Add Event Handler
		this.space.on('click', function() {
			self.addEarth();
		});

	};

	// Append Buttons to both
	ns.loadButtons = function() {

		// Space Separator
		var btn = $('<input>').attr('type', 'button').attr('value', 'Separate Space').addClass('move-space');
		this.space.prepend(btn);

		// Earth Separator
		var btn = $('<input>').attr('type', 'button').attr('value', 'Separate Earth').addClass('move-earth');
		this.earth.prepend(btn);

		// Reference Variable
		var self = this;

		// Establish Event Handlers
		$('.move-space').first().on('click', function() {
			self.separateSpace();
		});
		$('.move-earth').first().on('click', function() {
			self.separateEarth();
		});

	};

	ns.separateEarth = function() {

		// Set SharedWorker Request Flag
		this.requests = 'earth';

		// Load new Window
		window.open(window.location);

		// Remove Earth
		this.earth.remove();
		delete this.earth;

		// Remove other button
		$('input[type=button]', this.space).remove();

	};

	ns.separateSpace = function() {

		// Set SharedWorker Request Flag
		this.requests = 'space';

		// Load new Window
		window.open(window.location);

		// Remove Earth
		this.space.remove();
		delete this.space;

		// Remove other button
		$('input[type=button]', this.earth).remove();

	};

	// Load SharedWorker
	ns.loadSharedWorker = function() {

		// Prepare the SharedWorker (if able)
		if (window.SharedWorker) {

			// Reference Variable
			var self = this;

			// Create Shared Worker
			this.sharedWorker = new SharedWorker('worker.js');

			// Attach Listeners
			this.sharedWorker.addEventListener('error', function() {
				self.swError();
			}, false);
			this.sharedWorker.port.addEventListener('message', function(e) {
				self.swMessage(e);
			}, false);

			// Activate
			this.sharedWorker.port.start();

			// Check for Requests
			this.swSend({ 'command': 'check-requests' });

		}

	};

	// Init checks sharedworker
	ns.init = function() {

		// Load both
		this.loadSpace();
		this.loadEarth();

		// Load SharedWorker
		this.loadSharedWorker();

		// If SharedWorker is supported Append Buttons
		if (this.sharedWorker) this.loadButtons();

	};

	// Extend jQuery
	$.fn.setupDemo = function() {
		$.extend(true, this, ns);
		this.init();
		return this;
	};

	// Onload Setup Demo
	$(function() {
		$('body').first().setupDemo();
	});

})(jQuery);