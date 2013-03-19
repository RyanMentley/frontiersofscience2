(function(ws) {

	// Prepare Namespace Container
	var ns = {};


	/* Methods */

	ns.remove = function(p) {

		for (var x in ns.ports) {
			if (ns.ports[x] === p) ns.ports.splice(x, 1);
		}

	};

	ns.closePort = function(p) {

		// Wrap close in a try-catch for Opera
		try {

			// Close, Remove, and Send Notification
			p.close();
			ns.remove(p);

		} catch (err) { /* Unresolvable */ }

	};

	// Send msg to Port
	ns.sendTo = function(p, msg) {

		// Try Catch for Opera
		try {

			// Send Message
			p.postMessage(msg);

		} catch (err) {

			// Close this port and delete it
			ns.closePort(p);

		}

	};

	// Distribute Message to All ports
	ns.send = function(port, msg) {

		for (var x in ns.ports) if (ns.ports[x] !== port) ns.sendTo(ns.ports[x], msg);

	};

	// Handle received messages
	ns.message = function(port, e) {

		if (e.data && e.data.command) {

			// Redistribute to all connected components
			ns.send(port, e.data);

		}

	};

	ns.connect = function(e) {

		// Setup ports
		if (!ns.ports) ns.ports = [];

		// Attach new connection to the ports
		var port = e.ports[0];
		ns.ports.push(port);
		port.addEventListener('message', function(e) {
			ns.message(this, e);
		}, false);
		port.start();

	};

	ns.error = function(p) {

		// Remove connection
		ns.closePort(p);

	};

	// Core Initialization Events
	ws.addEventListener('error', ns.error, false);
	ws.addEventListener('connect', ns.connect, false);


})(self);