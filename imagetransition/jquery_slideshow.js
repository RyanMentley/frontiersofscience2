(function($) {

	// Namespace
	var ns = {};


	// Properties
	ns.current = -1;
	ns.delay = 4000;
	ns.trans = 200;


	/* Animations */

	ns.display = function() {
		var obj = $('<div>');
		obj.addClass('display');
		obj.html(this.ss[this.current].image);
		this.before(obj);
		obj.fadeOut(1000, function() {
			$(this).remove();
		});
	};

	ns.action = function(action) {
		var obj = $('<div>');
		obj.addClass('action');
		obj.html(action);
		this.after(obj);
		obj.fadeOut(1000, function() {
			$(this).remove();
		});
	};

	ns.transition = function() {
		var self = this;
		if (this.trans) {
			this.stop().fadeOut(this.trans, function() {
				self.attr('src', self.ss[self.current].image);
				self.stop().fadeIn(self.trans);
			});
		} else {
			self.attr('src', self.ss[self.current].image);
		}
	};


	/* Keyboard Controls */

	ns.forward = function() {
		this.current++;
		if (this.current >= this.ss.length) this.current = 0;
		this.restart();
		this.transition();
	};

	ns.backward = function() {
		this.current--;
		if (this.current < 0) this.current = this.ss.length - 1;
		this.restart();
		this.transition();
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
		$(document).on("click", function() {
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
		this.clear();
		var self = this;
		this.interval = setTimeout(function() {
				delete self.interval;
				self.start();
			},
			this.ss[this.current].delay
		);
	};


	/* Image Processing */

	ns.generate = function() {
		this.ss = [];
		if (this.images) {
			for (var img in this.images) {
				if (this.images[img].image) {
					this.ss.push({
						image: this.images[img].image,
						delay: this.images[img].delay ? this.images[img].delay : this.delay
					});
				} else if (this.images[img].range) {
					if (this.images[img].range.start && this.images[img].range.end && this.images[img].range.type) {
						for (var i = this.images[img].range.start; i <= this.images[img].range.end; i++) {
							this.ss.push({
								image: (this.images[img].range.prefix ? this.images[img].range.prefix : '') + i + this.images[img].range.type,
								delay: this.images[img].range.delays && this.images[img].range.delays.number == i ? this.images[img].range.delays.delay : this.images[img].delay ? this.images[img].delay : this.delay
							});
						}
					}
				} else {
					this.ss.push({
						image: this.images[img],
						delay: this.delay
					});
				}
			}
		}
		return this.ss && this.ss.length > 1
	}

	ns.preload = function() {
		for (var img in this.ss) {
			(new Image()).src = this.ss[img].image;
		}
	};


	/* Initialization & Accessibility */

	ns.init = function() {
		if (this.generate()) {
			this.preload(this.ss);
			this.controls();
			this.start();
		}
	};

	$.fn.ss = function(params) {
		$.extend(true, this, ns, params);
		this.init();
		return this;
	};

})(jQuery);