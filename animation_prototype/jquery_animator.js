(function($) {


	// Namespace
	var ns = {};


	// Global Shared Recursive GCD Method
	ns.gcd = function(args) {
		if (!args) return false;// Catch Empty Call
		if (args.length > 2) args[1] = ns.gcd(args.splice(1, args.length));// Recursion
		while (args.length > 1 && args[1] != 0) {
			var z = args[0] % args[1];
			args[0] = args[1];
			args[1] = z;
		}
		return args[0] || false;
	};


	// Global Interval Abstraction
	ns.gtLayer = function(contents) {
		this.name = "external_" + contents.name;
		this.cb = contents.callback;
		this.delay = contents.delay;
		this.timer = 0;
	};
	ns.gtLayer.prototype.callback = function(time) {
		this.timer += time;
		if (this.timer >= this.delay) {
			this.cb();
			this.timer = 0;
		}
	};
	ns.gtLayer.prototype.resetTimer = function() {
		this.timer = 0;
	};


	//  Timer Abstraction for Internal System
	ns.gtPlayLayer = function(data) {

		// Prepare Properties
		this.current = [];
		this.timer = [];
		this.delays = [];
		this.complete = [];

		// Apply Properties
		this.name = "internal_" + data.name;
		this.cb = data.callback;
		this.content = data.content;
		this.defaultDelay = data.delay;

		// Reference variable
		var self = this;

		// Prepare Callback Tracking
		if (this.content.canvasFrames) {

			// Prepare Delay Calculation Storage Array
			var delayStorage = [];
			delayStorage.push(this.defaultDelay);

			// Build index of initial delays & values
			for (var x = 0, len = this.content.canvasFrames.length; x < len; x++) {
				this.current.push(0);
				this.timer.push(0);
				this.complete.push(false);
				this.delays.push(Slides[CanvasFrames[this.content.canvasFrames[x]].slide].frames[0].delay ? Slides[CanvasFrames[this.content.canvasFrames[x]].slide].frames[0].delay : this.defaultDelay);

				// Append De-Duplicated Delays
				delayStorage = delayStorage.concat($.map(Slides[CanvasFrames[this.content.canvasFrames[x]].slide].frames, function(image) { return (image.delay ? image.delay : self.defaultDelay); }).filter(function(itm,i,a){
					return i==a.indexOf(itm);
				}));
			}

			// Finalize GCD to Delay Property
			this.delay = ns.gcd(delayStorage);

		} else {
			this.current.push(0);
			this.timer.push(0);
				this.complete.push(false);
			this.delays.push(this.content.frames[this.current[0]].delay ? this.content.frames[this.current[0]].delay : this.defaultDelay);

			// Calculate GCD of Delays for Global Interval
			var unique=$.map(Slides[this.content.name].frames, function(image) { return (image.delay ? image.delay : self.defaultDelay); }).filter(function(itm,i,a){
				return i==a.indexOf(itm);
			});
			unique.push(this.defaultDelay);
			this.delay = ns.gcd(unique);
		}
	};

	// Timer Abstraction Methods
	ns.gtPlayLayer.prototype.callback = function(time) {

		// Get number of running layers
		var len = this.timer.length;

/*
Enormous changes could be added here.
Building a list of the items to be rendered would be an ideal start before actually calling
each callback.  We could determine which parts came due, and which parts overlap, eliminating
duplicate callback calls and unnecessary callbacks that are not affected by the rendering.

We also could chain it to a buffering frame system, which should be implemented to the slideShow object.

The Canvases should also store a calculation of the height and width of all drawn components, allowing
us to scale the entire package to the screen size.
*/

		// Loop through all timers
		for (var x = 0; x < len; x++) {

			// Increment Timer(s) by time
			this.timer[x] += time;

			// Check against delay
			if (this.timer[x] >= this.delays[x]) {

				// Update Timer & Current values
				this.timer[x] -= this.delays[x];
				this.current[x]++;

				// Check if canvas or slide
				if (Canvases[this.content.name]) {
					for (var i = 0; i < len; i++) {

						// Assemble renderable object
						var rend = {
							path: Slides[CanvasFrames[this.content.canvasFrames[i]].slide].frames[this.current[i]].path
						};
						if (CanvasFrames[this.content.canvasFrames[i]].top) rend.top = CanvasFrames[this.content.canvasFrames[i]].top;
						if (CanvasFrames[this.content.canvasFrames[i]].left) rend.left = CanvasFrames[this.content.canvasFrames[i]].left;
						if (CanvasFrames[this.content.canvasFrames[i]].height) rend.height = CanvasFrames[this.content.canvasFrames[i]].height;
						if (CanvasFrames[this.content.canvasFrames[i]].width) rend.width = CanvasFrames[this.content.canvasFrames[i]].width;
						if (CanvasFrames[this.content.canvasFrames[i]].rotate) rend.rotate = CanvasFrames[this.content.canvasFrames[i]].rotate;

						// Render the defined object
						this.cb(rend);
					}

					// Loop Handler Logic
					if (this.current[x] == Slides[CanvasFrames[this.content.canvasFrames[x]].slide].frames.length - 1) {
						this.current[x] = -1;
						this.complete[x] = true;
					}
				} else if (Slides[this.content.name]) {

					// Call Render Process
					this.cb(this.content.frames[this.current[x]]);

					// Re-assign Delay for timer
					this.delays[x] = this.content.frames[this.current[x]].delay;

					// Loop Handler Logic
					if (this.current[x] == this.content.frames.length - 1) {
						this.current[x] = -1;
						this.complete[x] = true;
					}
				}
			}

			// Check complete
			var comp = true;
			for (var i = 0; i < this.complete.length; i++) {
				if (!this.complete[i]) comp = false;
			}
			if (comp) {
				for (var i = 0; i < this.complete.length; i++) this.complete[i] = false;
				$(this).triggerHandler('complete');
			}
		}
	};
	ns.gtPlayLayer.prototype.resetTimer = function() {
		this.timer = 0;
	};
	ns.gtPlayLayer.prototype.forward = function() {
		if (this.content.canvasFrames) {

			// Change according to smallest delay
			// Check smallest delay and set all timers forward that delay minus timer value
			// Set timer of matching object equal to the delay
			// execute callback

		} else {

			this.timer[0] = this.delays[0];
			this.callback(0);

		}
	};
	ns.gtPlayLayer.prototype.backward = function() {
		if (this.content.canvasFrames) {

			// Change according to smallest delay
			// Check smallest delay and set all timers back by that delay plus the timer of that component
			// Set the smallest delay's matching current to --
			// Perform check against negatives to loop-back
			// Execute the callback

		} else {
			this.current[0] = this.current[0] - 2;
			if (this.current[0] < 0) this.current[0] = this.content.frames.length - 3;
			this.timer[0] = this.delays[0];
			this.callback(0);
		}
	};


	// Define Global Timer
	ns.globalTimer = function() {
		this.queue = [];
	};

	// Global Timer Methods
	ns.globalTimer.prototype.reset = function() {
		for (var x = 0, len = this.queue.length; x < len; x++) {
			this.queue[x].resetTimer();
		}
	};
	ns.globalTimer.prototype.rebuildInterval = function() {
		if (this.interval) {
			clearInterval(this.interval);
			delete this.interval;
		}
		if (this.queue.length) {
			var self = this;
			this.timer = ns.gcd($.map(self.queue, function(instance) { return instance.delay; }));
			this.interval = setInterval(function() { self.processInterval(); }, self.timer);
		}
	};
	ns.globalTimer.prototype.processInterval = function() {
		for (var x = 0, len = this.queue.length; x < len; x++) {
			if (this.queue[x].callback) this.queue[x].callback(this.timer);
		}
	};
	ns.globalTimer.prototype.addCallback = function(callback) {
		this.queue.push(callback);
		this.rebuildInterval();
	};
	ns.globalTimer.prototype.removeCallback = function(name) {
		for (var x = 0, len = this.queue.length; x < len; x++) {
			if (this.queue[x] && this.queue[x].name == name) {
				this.queue.splice(x, 1);
				this.rebuildInterval();
			}
		}
	};
	ns.globalTimer.prototype.hasCallback = function(name) {
		for (var x = 0, len = this.queue.length; x < len; x++) {
			if (this.queue[x].name == name) return true;
		}
		return false;
	};


	// Define Message System
	ns.messageSystem = function() {};
	ns.messageSystem.prototype.displayMessage = function(message) {
		var c = message.class ? message.class : 'ssMessage';
		$('.' + c).remove();
		var obj = $('<div>').addClass(c).append(message.message);
		$('body').first().append(obj);
		if (!message.keep) obj.fadeOut(1000, function() { $(this).remove(); });

	};


	// Define Advanced Pre-Loader
	ns.preloader = function(messageSystem) {
		this.pool = [];
		this.slides = [];
		if (messageSystem) this.ms = messageSystem;
	};

	// Advanced Pre-Loader Shared Properties
	ns.preloader.prototype.poolMax = 5;

	// Advanced Pre-Loader Methods
	ns.preloader.prototype.preload = function(name, paths) {
		this.slides.push({ name: name, images: paths, loaded: [] });
		this.start();
	};
	ns.preloader.prototype.start = function() {
		var self = this;
		for (var x = 0; x < this.poolMax; x++) {
			if (!this.pool[x]) {
				var path = this.next();
				if (path) {
					this.pool[x] = new Image();
					$(this.pool[x]).one("load", function() { self.loaded(this); });
					this.pool[x].src = this.pool[x].alt = path;
				}
			}
		}
	};
	ns.preloader.prototype.next = function() {
		while (this.slides[0] && this.slides[0].images && this.slides[0].images.length) {
			var frame = this.slides[0].images.shift();
			if (Frames[frame]) {
				this.slides[0].loaded.push(frame);
				this.status();
			} else {
				return frame;
			}
		}
	};
	ns.preloader.prototype.loaded = function(image) {
		this.slides[0].loaded.push(image.alt);
		Frames[image.alt] = {
			width: image.width,
			height: image.height
		};
		for (var x = 0; x < this.poolMax; x++) {
			if (this.pool[x] && this.pool[x] === image) {
				delete this.pool.splice(x, 1);
			}
		}
		this.status();
		this.start();
	};
	ns.preloader.prototype.status = function() {
		if (this.slides.length) {

			// Prepare Status
			var name = this.slides[0].name;
			var total = this.slides[0].images.length + this.slides[0].loaded.length + this.pool.length;
			var current = this.slides[0].loaded.length;
			var progress = Math.floor(current/total * 100);

			// Prepare & Display relative progress message
			if (progress < 100) {
				var message = $('<p>').html("Preloading of " + name + ": " + progress + "%");
				var progress_bar = $('<div>').css('width', progress + "%").addClass('progress');
				var container = $('<div>').append(message).append(progress_bar);
				this.ms.displayMessage({ message: container, keep: true, class: 'ssProgress' });
			} else {
				var message = $('<p>').html("Done Loading " + name);
				var progress_bar = $('<div>').css('width', progress + "%").addClass('progress');
				var container = $('<div>').append(message).append(progress_bar);
				this.ms.displayMessage({ message: container, class: 'ssProgress' });

				// Delete from Slides
				delete this.slides.splice(0, 1);

				// Trigger Handler
				$(this).triggerHandler('preloaded', { 'name': name });
			}
		}
	};


	// Define Generator
	ns.generator = function(preloader) {
		var self = this;
		this.preloader = preloader;
		$(this.preloader).on('preloaded', function(e, slide) {
			Slides[slide.name].preloaded = true;
			$(self).triggerHandler('preloaded', slide);
		});
	};

	// Define Generator Methods
	ns.generator.prototype.generate = function(slide) {
		var images = slide.images;

		// Define Local Storage
		var frames = [];

		// Parse images and standardize format for use
		if (images && images.length) {
			for (var x = 0, lenx = images.length; x < lenx; x++) {
				if (images[x].path) {
					var img = {};
					for (var p in images[x]) {
						img[p] = images[x][p];
					}
					frames.push(img);
				} else if (images[x].range && images[x].range.start && images[x].range.end && images[x].range.type) {
					if (images[x].range.reverse) {
						for (var i = images[x].range.end; i >= images[x].range.start; i--) {
							var img = {};
							img.path = (images[x].range.prefix ? images[x].range.prefix : '') + i + images[x].range.type;
							if (images[x].delay) img.delay = images[x].delay;
							frames.push(img);
						}
					} else {
						for (var i = images[x].range.start; i <= images[x].range.end; i++) {
							var img = {};
							img.path = (images[x].range.prefix ? images[x].range.prefix : '') + i + images[x].range.type;
							if (images[x].delay) img.delay = images[x].delay;
							frames.push(img);
						}
					}
				} else {
					frames.push({ path: images[x] });
				}
			}
		}

		// Preload Frames
		this.preloader.preload(slide.name, $.map(frames, function(o) { return o.path }));

		// Return Components
		return frames;
	};
	ns.generator.prototype.addSlides = function(slide) {
		if (slide.name && slide.images && slide.images.length > 0) slide.images = this.generate(slide);
		if (slide.images && slide.images.length) {
			Slides[slide.name] = { frames: slide.images, name: slide.name };
			return true;
		}
	};
	ns.generator.prototype.addCanvasFrame = function(canvasFrame) {
		if (canvasFrame.name  && canvasFrame.slide) {
			if (typeof canvasFrame.slide == "object") {
				if (canvasFrame.slide.name && this.addSlides(canvasFrame.slide)) {
					canvasFrame.slide = canvasFrame.slide.name;
					CanvasFrames[canvasFrame.name] = canvasFrame;
					return true;
				}
			} else {
				if (Slides[canvasFrame.slide]) {
					CanvasFrames[canvasFrame.name] = canvasFrame;
					return true;
				}
			}
		}
	};
	ns.generator.prototype.addCanvas = function(canvas) {
		if (canvas.name && canvas.canvasFrames) {
			if (typeof canvas.canvasFrames === "string") {
				if (CanvasFrames[canvas.canvasFrames]) {
					canvas.canvasFrames = new Array(canvas.canvasFrames);
					Canvases[canvas.name] = canvas;
					return true;
				}
			} else if (typeof canvas.canvasFrames === "object") {
				if (Object.prototype.toString.call(canvas.canvasFrames) === "[object Array]") {
					var canvasFrames = [];
					for (var x = 0, len = canvas.canvasFrames.length; x < len; x++) {
						if (typeof canvas.canvasFrames[x] == "object") {
							if (this.addCanvasFrame(canvas.canvasFrames[x])) {
								canvasFrames.push(canvas.canvasFrames[x].name);
							}
						} else if (Canvases[canvas.canvasFrames]) {
							canvasFrames.push(canvas.canvasFrames);
						}
					}
					canvas.canvasFrames = canvasFrames;
					Canvases[canvas.name] = canvas;
				} else {
					if (this.addCanvasFrame(canvas.canvasFrames)) {
						canvas.canvasFrames = new Array(canvas.canvasFrames.name);
						Canvases[canvas.name] = canvas;
						return true;
					}
				}
			}
		}
	};
	ns.generator.prototype.addToCanvas = function(name, canvasFrames, index) {
		if (Canvases[name]) {
			if (typeof canvasFrames === "object") {

				// Build New CanvasFrames
				if (Object.prototype.toString.call(canvasFrames) === "[object Array]") {

					// Multiple Objects
					for (var x = 0, len = canvasFrames.length; x < len; x++) {
						if (typeof canvasFrames[x] == "object") {
							if (this.addCanvasFrame(canvasFrames[x])) {
								if (index && index < Canvases[name].canvasFrames.length) {
									Canvases[name].canvasFrames.splice(index, 0, canvasFrames[x].name);
								} else {
									Canvases[name].canvasFrames.push(canvasFrames[x].name);
								}
							}
						} else {
							if (CanvasFrames[canvasFrames[x].name]) {
								if (index && index < Canvases[name].canvasFrames.length) {
									Canvases[name].canvasFrames.splice(index, 0, canvasFrames[x]);
								} else {
									Canvases[name].canvasFrames.push(canvasFrames[x]);
								}
								return true;
							}
						}
					}
				} else if (this.addCanvasFrame(canvasFrames)) {

					// Single Object
					if (index && index < Canvases[name].canvasFrames.length) {
						Canvases[name].canvasFrames.splice(index, 0, canvasFrames.name);
					} else {
						Canvases[name].canvasFrames.push(canvasFrames.name);
					}
					return true;
				}
			} else if (CanvasFrames[canvasFrames]) {

				// Add a single named canvasFrame
				if (index && index < Canvases[name].canvasFrames.length) {
					Canvases[name].canvasFrames.splice(index, 0, canvasFrames);
				} else {
					Canvases[name].canvasFrames.push(canvasFrames);
				}
				return true;
			}
		}
	};


	// Image Logic
	ns.imageLogic = function() {};
	ns.imageLogic.prototype.render = function(image) {
		var t = (typeof image.trans !== "undefined" ? image.trans : this.options.trans);

		// Apply Scaling
		if (this.options.scale) {

			// Get Container Size & Image Size
			var maxHeight = this[0].parentNode.height ? this[0].parentNode.height : document.height;
			var maxWidth = this[0].parentNode.width ? this[0].parentNode.width : document.width;
			var height = Frames[image.path].height;
			var width = Frames[image.path].width;

			// Create Ratio's
			var maxRatio = maxWidth / maxHeight;
			var ratio = width / height;

			if (maxRatio > 1) {

				// Use height to determine maximum ratio & Apply
				var hratio =  maxHeight / height;
				height = Math.floor(hratio * height);
				width = Math.floor(hratio * width);
			} else {

				// Use width to determine maximum ratio & Apply
				var wratio =  maxWidth / width;
				height = Math.floor(wratio * height);
				width = Math.floor(wratio * width);
			}

			this[0].height = height;
			this[0].width = width;
		}

		// Render image with delay or without
		if (t) {
			var self = this;
			this.fadeOut(t, function() {
				self.attr('src', image.path).fadeIn(t);
			});
		} else {
			this.attr('src', image.path);
		}
	};
	ns.imageLogic.prototype.getName = function(name) {
		if (Slides[name]) return Slides[name];
	};
	ns.imageLogic.prototype.preloaded = function(name) {
		var check = this.getName(name);
		if (check && check.preloaded) return true;
	};


	// Canvas Logic
	ns.canvasLogic = function() {};
	ns.canvasLogic.prototype.render = function(image) {
		var t = (typeof image.trans !== "undefined" ? image.trans : this.options.trans);
		var self = this;

		// Load Image
		var img = new Image();
		img.src = image.path;

		// Grab Canvas Drawing Area
		var ctx = this[0].getContext('2d');

		// Grab Properties
		var left = (image.left ? image.left : 0);
		var top = (image.top ? image.top : 0);
		var height = image.height ? image.height : Frames[image.path].height;
		var width = image.width ? image.width : Frames[image.path].width;

		// Apply Scaling
		if (this.options.scale) {

			// Get Ratio's
			var maxRatio = this[0].width / this[0].height;
			var ratio = width / height;

			// Check ratio to determine which base to use
			if (maxRatio >= 1) {

				// Use height to determine maximum ratio & Apply
				var hratio =  this[0].height / height;
				height = Math.floor(hratio * height);
				width = Math.floor(hratio * width);
			} else {

				// Use width to determine maximum ratio & Apply
				var wratio =  this[0].width / width;
				height = Math.floor(wratio * height);
				width = Math.floor(wratio * width);

			}
		}

		// Adjust Position
		left += (this[0].width - width) / 2;
		top += (this[0].height - height) / 2;

		// Draw to Temporary Canvas & Apply Rotation
		var can = document.createElement('canvas');
		can.height = height;
		can.width = width;
		var cxt2 = can.getContext('2d');
		cxt2.save();
		if (image.rotate) {
			cxt2.translate(width / 2, height / 2);
			cxt2.rotate(image.rotate * Math.PI / 180);
			cxt2.drawImage(img, -(width / 2), -(height / 2), width, height);
		} else {
			cxt2.drawImage(img, 0, 0, width, height);
		}
		cxt2.restore();

		if (t) {
			this.fadeOut(t, function() {

				// Clear Space & Render
				ctx.clearRect(left, top, width, height);
				ctx.save();
				ctx.drawImage(can, left, top, width, height);
				ctx.restore();
				self.fadeIn(t);
			});
		} else {

			// Clear Space & Render
			ctx.clearRect(left, top, width, height);
			ctx.save();
			ctx.drawImage(can, left, top, width, height);
			ctx.restore();
		}
	};
	ns.canvasLogic.prototype.getName = function(name) {
		if (Canvases[name]) {
			return Canvases[name];
		} else if (Slides[name]) {
			return Slides[name];
		}
	};
	ns.canvasLogic.prototype.preloaded = function(name) {
		if (Canvases[name]) {
			for (var x = 0, len = Canvases[name].canvasFrames.length; x < len; x++) {
				if (!Slides[CanvasFrames[Canvases[name].canvasFrames[x]].slide].preloaded) return false;
			}
			return true;
		} else if (Slides[name] && Slides[name].preloaded) {
			return true;
		}
	};


	// Define SlideShow
	ns.slideShow = function(generator) {
		this.playing = false;
		this.ssQueue = [];
		this.options = {
			'delay': 4000,
			'trans': 200,
			'auto': true,
			'loop': true,
			'scale': false
		};
		this.generator = generator;
	};

	// slideShow Methods
	ns.slideShow.prototype.initialize = function(params) {

		// Merge params with options
		$.extend(true, this.options, params);

		// Extend logic according to container type
		if (this[0].nodeName.toLowerCase() == "img") {
			$.extend(true, this, new ns.imageLogic());
		} else if (this[0].nodeName.toLowerCase() == "canvas") {
			$.extend(true, this, new ns.canvasLogic());

			// Scaling / Size to Fit container
			if (this.options.scale) {
				this[0].height = this[0].parentNode.height ? this[0].parentNode.height : window.innerHeight;
				this[0].width = this[0].parentNode.width ? this[0].parentNode.width : window.innerWidth;
			}
		} else { /* Unsupported tag */ }

		// Add Controls
		this.controls();

		// Generate Supplied Images
		if (this.options.images) {
			if (this.options.auto) this.ssQueue.push("internal_main");
			this.generator.addSlides({ name: 'internal_main', images: this.options.images});
			delete this.options.images;
		}
	};
	ns.slideShow.prototype.addSlides = function(slide) {
		this.generator.addSlides(slide);
	};
	ns.slideShow.prototype.addCanvasFrame = function(canvasFrame) {
		this.generator.addCanvasFrame(canvasFrame);
	};
	ns.slideShow.prototype.addCanvas = function(canvas) {
		this.generator.addCanvas(canvas);
	};
	ns.slideShow.prototype.addToCanvas = function(name, canvasFrames, index) {
		this.generator.addToCanvas(name, canvasFrames, index);
	};
	ns.slideShow.prototype.controls = function() {
		var self = this;

		// Set target if not set
		if (!Targeted) Targeted = this;

		// Mouse Controls
		this.on("click mouseover touchstart", function() {
			if (Targeted !== self) Targeted = self;
		});
		this.on("click touchstart", function() {
			if (Targeted === self) self.forward();
		});

		// Controls
		$(this.generator).on('preloaded', function(e, slide) {
			if (self.ssQueue.length && (!this.playing || this.playing.name !== slide.name)) self.play(self.ssQueue.splice(0, 1)[0]);
		});
	};
	ns.slideShow.prototype.play = function(name) {

		// If name exists and is Slides or Canvases
		if (name && this.getName(name)) {

			// Check that the requested content is ready for playback
			if (!this.preloaded(name)) {
				this.ssQueue.push(name);
			} else {

				// Stop & Remove old Playing Content
				if (this.playing) {
					this.stop();
					$(this.playing).off('complete');
					delete this.playing;
				}

				// Reference to this
				var self = this;

				// Set new Playing & Add Callback
				this.playing = new ns.gtPlayLayer(
					{
						name: name,
						delay: this.options.delay,
						content: this.getName(name),
						callback: function(image) { self.render(image); }
					}
				);

				// Add Custom Trigger?
				$(this.playing).on('complete', function(e) {
					if (!self.options.loop) {
						self.stop();
					} else if (self.ssQueue.length) {
						self.stop();
						self.play(self.ssQueue.splice(0, 1));
					}
				});

				// Add Callback
				Timer.addCallback(this.playing);
			}
		} else if (this.playing) {
			Timer.addCallback(this.playing);
		}
	};
	ns.slideShow.prototype.stop = function() {
		if (this.playing) Timer.removeCallback(this.playing.name);
	};
	ns.slideShow.prototype.toggle = function() {
		var paused = !Timer.hasCallback(this.playing.name);
		if (paused) {
			this.play();
		} else {
			this.stop();
		}
		return paused;
	};
	ns.slideShow.prototype.addToQueue = function(name) {
		if (name && this.getName(name)) this.ssQueue.push(name);
	};
	ns.slideShow.prototype.forward = function() {
		if (this.playing) this.playing.forward();
	};
	ns.slideShow.prototype.backward = function() {
		if (this.playing) this.playing.backward();
	};


	// Name-spaced Globals (eg. local shared variables)
	var Timer = new ns.globalTimer();
	var Messager = new ns.messageSystem();
	var Preloader = new ns.preloader(Messager);
	var Generator = new ns.generator(Preloader);
	var Frames = {};
	var Slides = {};
	var CanvasFrames = {};
	var Canvases = {};
	var Targeted = false;


	// Define External Access Methods

	// Merge jQuery with SlideShow
	$.fn.slideShow = function(params) {
		$.extend(true, this, new ns.slideShow(Generator));
		this.initialize(params);
		return this;
	};

	// Add Global Timer
	$.ssAddCallback = ns.slideShow.prototype.addCallback = function(cb) {
		if (cb.delay && cb.delay > 0 && cb.name && cb.callback && typeof cb.callback === "function") {
			cb.name = 'external_' + cb.name;
			Timer.addCallback(new ns.gtLayer(cb));
		}
	};

	// Remove Global Timer
	$.ssRemoveCallback = ns.slideShow.prototype.removeCallback = function(name) {
		Timer.removeCallback('external_' + name);
	};


	// Register global events
	$(document).on("keyup", function(e) {
		if (Targeted) {
			if (e.keyCode) {
				if (e.keyCode == 32) {// Space
					Messager.displayMessage({ message: Targeted.toggle() ? "Playing" : "Paused" });
				} else if (e.keyCode == 37) {// Arrow Left
					Targeted.backward();
					Messager.displayMessage({ message: "Previous" });
				} else if (e.keyCode == 39) {// Arrow Right
					Targeted.forward();
					Messager.displayMessage({ message: "Next" });
				}
			}
		}
	});
	$(document).on('mouseover touchstart', 'img', function() {
		Messager.displayMessage({ message: this.src });
	});


})(jQuery);