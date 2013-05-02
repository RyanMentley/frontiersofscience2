(function($) {


	// Primary Namespace
	var ns = {};


	// Static Properties

	ns.timerQueue = [];
	ns.poolMax = 5;
	ns.loaded = [];
	ns.loading = [];
	ns.pool = [];
	ns.slides = {};
	ns.loadedSlides = [];
	ns.slideShows = [];


	/* Static Methods */

	/*================ Global Interval Logic ================*/

	// Automatic GCD /w Recursion
	ns.gcd = function(args) {

		// Catch no argument calls
		if (!args) return false;

		// Splice for Recursion
		if (args.length > 2) args[1] = ns.gcd(args.splice(1, args.length));

		// Basic Operation
		while (args.length > 1 && args[1] != 0) {
			var z = args[0] % args[1];
			args[0] = args[1];
			args[1] = z;
		}
		return args[0] || false;

	};

	// Execute registered interval callbacks
	ns.intervalProcess = function() {
		var changed = false;
		for (var x = 0, len = ns.timerQueue.length; x < len; x++) {
			if (ns.timerQueue[x].callback) ns.timerQueue[x].callback(ns.timer);
			if (ns.timerQueue[x].once) {
				ns.timerQueue.splice(x, 1);
				len--;
				changed = true;
			}
		}
		if (changed) ns.rebuildInterval();
	};

	// Handle interval management
	ns.rebuildInterval = function() {

		// Stop interval
		if (ns.interval) {
			clearInterval(ns.interval);
			delete ns.interval;
		}

		// If we have items in our queue rebuild
		if (ns.timerQueue.length) {

			// Rebuild Timer by GCD of timerQueue times
			ns.timer = ns.gcd($.map(ns.timerQueue, function(instance) { return instance.delay; }));

			// Establish New Interval
			ns.interval = setInterval(ns.intervalProcess, ns.timer);

		}

	};

	// Adds a callback and rebuilds interval
	ns.addCallback = function(callback) {
		ns.timerQueue.push(callback);
		ns.rebuildInterval();
	};

	// Removes a callback by name & rebuilds interval
	ns.removeCallback = function(name) {
		for (var x = 0, len = ns.timerQueue.length; x < len; x++) {
			if (ns.timerQueue[x].name == name) {
				ns.timerQueue.splice(x, 1);
				ns.rebuildInterval();
				len--;
			}
		}
	};


	/*================ Preloader Logic ================*/

	// Display a fading message tied to the center top of the screen
	ns.displayMessage = function(message) {
		$('.slideMessage').remove();
		var obj = $('<div>').addClass('slideMessage').html(message);
		$('body').first().append(obj);
		obj.fadeOut(2000, function() { $(this).remove(); })
	};

	// Rebuild an image in the pool
	ns.buildImageAt = function(index) {
		ns.pool[index] = new Image();
		$(ns.pool[index]).on('load', function() { ns.preloaded(this); });
	};

	// Checks name OR all slides against loadedSlides
	ns.isReady = function(name) {
/* For some reason build in functions failed 100% to return valid checks on name inside array, go ahead and uncomment my test to check
		console.log("Is " + name + " inside:");
		console.log(ns.loadedSlides);
		console.log("jQuery inArray Results:");
		console.log($.inArray(name, ns.loadedSlides, 0));
		console.log("Javascript Native indexOf Results:");
		console.log(ns.loadedSlides.indexOf(name));
/**/

		var ret = false;
		if (name) {
			for (var x = 0; x < ns.loadedSlides.length; x++) {
				if (ns.loadedSlides[x] == name) ret = true;
			}
		} else {
			ret = (Object.keys(ns.slides).length == ns.loadedSlides.length);
		}
		return ret;
	};

	// Print pre-loader status to displayMessage
	ns.printStatus = function(index) {

		// Prepare Statistics
		var name = ns.loading[index].name;
		var total = ns.slides[ns.loading[index].name].length;
		var current = ns.slides[ns.loading[index].name].length - ns.loading[index].images.length;
		var progress = Math.ceil(current/total * 100);

		// Prepare Message
		var message = $('<p>').html("Preloading of " + name + ": " + progress + "%")
		if (progress == 100) {
			ns.loading.splice(index, 1);
			ns.loadedSlides.push(name);
			var message = $('<p>').html("Preloading of " + name + " is complete.");
			for (var x = 0, len = ns.slideShows.length; x < len; x++) {
				ns.slideShows[x].triggerHandler('ready', { 'name': name });
			}
		}

		// Prepare Containers
		var progress_bar = $('<div>').css('width', progress + "%").addClass('progress');
		var container = $('<div>').append(message).append(progress_bar);

		// Show Message
		ns.displayMessage(container);

	};

	// Check the first image in the loading instance against the loaded array
	ns.isLoaded = function(index) {
		for (var x = 0, len = ns.loaded.length; x < len; x++) {
			if (ns.loaded[x].indexOf(ns.loading[index].images[0]) > -1) {
				return ns.loading[index].images.splice(0, 1);
			}
		}
	};

	// Preload from queue
	ns.preload = function() {

		// Display Preloader Status of first instance
		if (ns.loading.length > 0) ns.printStatus(0);

		// Cycle Loading Array
		for (var x = 0; x < ns.loading.length; x++) {

			// Cycle Available Image Tags for Preloading
			for (var i = 0; i < ns.poolMax; i++) {
				if (!ns.pool[i] && ns.loading[x]) {

					// Thanks to WebKit for failing to execute consecutive load events on the same img tag
					ns.buildImageAt(i);

					// Parse images for next available
					ns.isLoaded(x);

					// Load or render Completion
					if (ns.loading[x].images.length) {
						ns.pool[i].src = ns.loading[x].images.splice(0, 1);
					} else {
						ns.printStatus(x);
					}

				}
			}
		}

	};

	// Event handler for image preloading
	ns.preloaded = function(image) {
		ns.loaded.push(image.src);
		for (var x = 0; x < ns.poolMax; x++) {
			if (image === ns.pool[x]) {
				$(ns.pool[x]).off('load');
				delete ns.pool[x];
			}
		}
		ns.preload();
	};

	// Generate a new named slide
	ns.generate = function(name, slideshow, images) {

		// Prepare Storage
		var slide = [];

		// Parse images to build a standardized array of objects
		if (images && images.length) {
			for (var x = 0, lenx = images.length; x < lenx; x++) {
				if (images[x].image) {
					var image = {};
					image.image = images[x];
					if (image[x].delay) image.delay = images[x].delay;
					if (image[x].trans) image.trans = images[x].trans;
					slide.push(image);
				} else if (images[x].range) {
					if (images[x].range.start && images[x].range.end && images[x].range.type) {
						for (var i = images[x].range.start; i <= images[x].range.end; i++) {
							var image = {};
							image.image = (images[x].range.prefix ? images[x].range.prefix : '') + i + images[x].range.type;
							if (images[x].delay) image.delay = images[x].delay;
							slide.push(image);
						}
					}
				} else {
					var image = {};
					image.image = images[x];
					slide.push(image);
				}
			}
		}

		// Push generated slides to slides array
		ns.slides[name] = slide;

		// Create Array of strings
		var images = $.map(slide, function(o) { return o.image; });

		// Dedupe before pushing to preloader
		$.each(images, function(image) {
			for (var x = 0, lenx = images.length; x < lenx; x++) {
				if (images[x] === images[image] && image !== x) {
					images.splice(x, 1);
					lenx--;
				}
			}
		});

		// Add to ns.loading queue
		ns.loading.push({ 'name': name, 'slideshow': slideshow, 'images': images });

		// Initiate preloader
		ns.preload();

	};





	/*================ Image Tag Logic ================*/

	ns.ImageTag = function() {};

	// Render Logic
	ns.ImageTag.prototype.render = function() {
		var self = this;
		var trans = (ns.slides[this.slides][this.current].trans ? ns.slides[this.slides][this.current].trans : this.options.trans);
		if (trans) {
			var img = this.current;
			this.fadeOut(trans, function() {
				self.attr('src', ns.slides[self.slides][self.current].image).fadeIn(trans);
			});
		} else {
			self.attr('src', ns.slides[this.slides][this.current].image);
		}
	};




	/*================ Canvas Tag Logic ================*/

	ns.CanvasTag = function() {};

	// Render Logic
	ns.CanvasTag.prototype.render = function() {
		// Canvas Logic
	};




	/*================ SlideShow Instance ================*/

	// Namespace & Instance Initialization of default properties
	ns.SlideShow = function(params) {
		this.current = 0;
		this.timer = 0;
		this.slideQueue = [];
	};

	// Properties
	ns.SlideShow.prototype.options = {
		'delay': 4000,
		'trans': 200,
		'auto': true,
		'loop': true,
		'wait': false,
		'scale': false
	};

	ns.SlideShow.prototype.initialize = function(params) {

		// Merge Params with Options
		$.extend(true, this.options, params);

		// Extend Logic by Type
		if (this[0].nodeName.toLowerCase() == 'img') {
			$.extend(true, this, new ns.ImageTag());
		} else if (this[0].nodeName.toLowerCase() == 'canvas') {
			$.extend(true, this, new ns.CanvasTag());
		} else {
			// STOP SOMETHING IS VERY WRONG
		}

		// Establish Controls & Listeners
		this.controls();

		// If images supplied, generate
		if (this.options.images) {
			this.slides = "internal_main";
			ns.generate(this.slides, this, this.options.images);
			delete this.options.images;
		}

		// Add global reference
		ns.slideShows.push(this);

	};

	// Establish Keyboard & Mouse Controls, and logical events
	ns.SlideShow.prototype.controls = function() {
		var self = this;

		// Custom Events
		this.on('complete', function(e, data) {
			if (self.slideQueue && self.slideQueue.length > 0) self.slides = self.slideQueue.splice(0, 1);
		});
		this.on('ready', function(e, data) {
			if (self.slideQueue.length && ns.isReady(self.options.wait ? false : self.slideQueue[0])) {
				self.start(self.slideQueue.splice(0, 1));
			} else if (self.slides && data.name && self.slides == data.name) {
				if (self.options.auto) self.start();
			}
		});

	};

	// Begin or Resume Animation, Queue if not ready
	ns.SlideShow.prototype.start = function(name) {
		if (name && ns.slides[name] && !ns.isReady(this.options.wait ? false : name)) {
			this.queueSlide(name);
		} else {
			if (name && ns.slides[name] && (!this.slides || name !== this.slides)) {
				if (this.playing) this.stop();
				this.current = 0;
				this.timer = 0;
				this.slides = name;
			}
			if (!this.playing && this.slides) {
				var self = this;
				var cb = {
					name: self.slides,
					callback: function(time) { self.forward(time); },
					delay: ns.gcd($.map(ns.slides[self.slides], function(image) { return (image.delay ? image.delay : self.options.delay); }))
				};
				ns.addCallback(cb);
				this.render();
				this.playing = true;
			}
		}
	};

	// Stop Slideshow
	ns.SlideShow.prototype.stop = function() {
		if (this.playing) {
			ns.removeCallback(this.slides);
			this.playing = false;
		}
	};

	// Start or Stop slideshow
	ns.SlideShow.prototype.toggle = function() {
		if (this.playing) {
			this.stop();
		} else {
			this.start();
		}
		return this.playing;
	};

	// Queue a set of slides once the current one is "complete"
	ns.SlideShow.prototype.queueSlide = function(name) {
		if (name && ns.slides[name]) this.slideQueue.push(name);
	};

	// Calculate & Return delay of current image from slides
	ns.SlideShow.prototype.delay = function() {
		return (ns.slides[this.slides][this.current].delay ? ns.slides[this.slides][this.current].delay : this.options.delay);
	};

	// Display next Slide
	ns.SlideShow.prototype.forward = function(time) {
		if (time) {// timer called
			this.timer += time;
			if (this.timer >= this.delay()) {
				this.render();
				this.timer = 0;
				this.current++;
			}
		} else {// Forward Called via arrows
			this.render();
			this.timer = 0;
			this.current++;
		}
		if (this.current >= ns.slides[this.slides].length) {
			this.current = 0;
			if (this.slideQueue.length) this.start(this.slideQueue.splice(0, 1));
			if (!this.options.loop) this.stop();
		}
	};

	// Display previous Slide
	ns.SlideShow.prototype.backward = function() {
		this.current--;
		this.timer = 0;
		this.render();
	};

	// Allow adding of new slides by name with images in same format
	ns.SlideShow.prototype.addSlides = function(show, images) {
		ns.generate(show, this, images);
	};

	// Extend jQuery object to house SlideShow methods
	$.fn.SlideShow = function(params) {
		$.extend(true, this, new ns.SlideShow(params));
		this.initialize(params);
		return this;
	};

	// Confirm has name, append prefix to avoid internal clashing, and register callback
	$.ssAddCallback = ns.SlideShow.prototype.addCallback = function(cb) {
		if (cb.name) {
			cb.name = "external_" + cb.name;
			ns.addCallback(cb);
		}
	};

	// External access to remove named CB
	$.ssRemoveCallback = ns.SlideShow.prototype.removeCallback = function(name) {
		ns.removeCallback('external_' + name);
	};




// Old Headers I may reuse when I organize my new code
	/* Timer Controls */
	/* Animations */
	/* Keyboard Controls */
	/* Image Processing */
	/* Initialization & Accessibility */
	/* External Access */


})(jQuery);