(function($) {

	// Namespace
	var ns = {};


	// Properties
	ns.options = {
		delay: 4000,
		trans: 200
	};
	ns.current = -1;
	ns.ss;
	ns.images = [];


	/* Animations */

	ns.display = function() {
		if (this.ss && this.images[this.ss]) {
			var obj = $('<div>');
			obj.addClass('display');
			obj.html(this.images[this.ss][this.current].image);
			this.before(obj);
			obj.fadeOut(1000, function() {
				$(this).remove();
			});
		}
	};

	ns.action = function(action) {
		if (this.ss && this.images[this.ss]) {
			var obj = $('<div>');
			obj.addClass('action');
			obj.html(action);
			this.after(obj);
			obj.fadeOut(1000, function() {
				$(this).remove();
			});
		}
	};

	ns.transition = function() {
		var self = this;
		if (this.options.trans) {
			this.stop().fadeOut(this.options.trans, function() {
				self.attr('src', self.images[self.ss][self.current].image);
				self.stop().fadeIn(self.trans);
			});
		} else {
			self.attr('src', self.images[self.ss][self.current].image);
		}
	};


	/* Keyboard Controls */

	ns.forward = function() {
		if (this.ss && this.images[this.ss]) {
			this.current++;
			if (this.current >= this.images[this.ss].length) {
				if (this.changeSS) {
					this.ss = this.changeSS;
					delete this.changeSS;
				}
				this.current = 0;
			}
			this.restart();
			this.transition();
		}
	};

	ns.backward = function() {
		if (this.ss && this.images[this.ss]) {
			this.current--;
			if (this.current < 0) this.current = this.images[this.ss].length - 1;
			this.restart();
			this.transition();
		}
	};

	ns.toggle = function() {
		if (this.interval) {
			this.clear();
		} else {
			this.restart();
		}
	};

	ns.controls = function() {
		var self = this;

		// Keyboard Controls
		$(document).on("keyup", function(e) {
			if (e.keyCode) {
				if (e.keyCode == 32) {
					self.toggle();
					self.action(self.interval ? "Started" : "Paused");
				} else if (e.keyCode == 37) {
					self.backward();
					self.action("Last Image");
				} else if (e.keyCode == 39) {
					self.forward();
					self.action("Next Image");
				}
			}
		});

		// Mouse Controls
		this.on("click", function() {
			self.forward();
		});
		$(document).on("mousemove", function() {
			self.display();
		});

	};


	/* Timer Controls */

	ns.clear = function() {
		if (this.interval) {
			clearTimeout(this.interval);
			delete this.interval;
		}
	};

	ns.start = function() {
		this.forward();
	};

	ns.restart = function() {
		if (this.ss && this.images[this.ss]) {
			this.clear();
			var self = this;
			this.interval = setTimeout(function() {
					delete self.interval;
					self.start();
				},
				this.images[this.ss][this.current].delay
			);
		}
	};


	/* Image Processing */

	ns.generate = function(images) {
		var ret = [];

		// Parse images to build standardized array
		if (images) {
			for (var i in images) {
				if (images[i].image) {
					ret.push({
						image: images[i].image,
						delay: images[i].delay ? images[i].delay : this.options.delay
					});
				} else if (images[i].range) {
					if (images[i].range.start && images[i].range.end && images[i].range.type) {
						for (var x = images[i].range.start; x <= images[i].range.end; x++) {
							ret.push({
								image: (images[i].range.prefix ? images[i].range.prefix : '') + x + images[i].range.type,
								delay: images[i].delay ? images[i].delay : this.options.delay
							});
						}
					}
				} else {
					ret.push({
						image: images[i],
						delay: this.options.delay
					});
				}
			}
		}

		// Preload if length exists
		if (ret.length) this.preload(ret);

		// Return anything larger than 1
		return ret.length <= 1 || ret;
	};

	ns.preload = function(images) {
		for (var i in images) {
			(new Image()).src = images[i].image;
		}
	};


	/* Initialization & Accessibility */

	ns.changeTo = function(name) {
		if (this.images[name]) {
			this.changeSS = name;
		}
	};

	ns.changeNow = function(name) {
		if (this.images[name]) {
			this.clear();
			this.current = -1;
			this.ss = name;
			this.start();
		}
	};

	ns.addImages = function(show, images) {
		this.images[show] = this.generate(images);
	};

	$.fn.ss = ns.init = function(params) {
		$.extend(true, this, ns, { options: params });
		this.controls();
		if (params.images) {
			delete this.options.images;
			this.ss = 1;
			this.images[1] = this.generate(params.images);
			this.start();
		}
		return this;
	};

})(jQuery);