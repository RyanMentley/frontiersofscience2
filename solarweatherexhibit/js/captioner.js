/*
 * Captioner.js
 * Author: Ryan Mentley
 * Website: https://github.com/RyanMentley/captioner
 */

function Captioner(audioElement, captionCallback, endedCallback, captionArray) {
	this.audioElement = audioElement;
	this.captionCallback = captionCallback;
	this.endedCallback = endedCallback;
	this.captionArray = captionArray;
	this.captionIndex = 0;

	this.updateCaptions = function() {
		var captionUpdateNeeded = false;
		var time = this.audioElement.currentTime;

		// Do we need to advance to the next caption?
		if (this.captionIndex < this.captionArray.length) {
			if (time > this.captionArray[this.captionIndex][0]) {
				captionUpdateNeeded = true;
				this.captionIndex++;
			}
		}

		// Backtrack if needed (in case audio position is moved backward)
		while (this.captionIndex > 0 && this.captionArray[this.captionIndex - 1][0] > time) {
			this.captionIndex--;
			captionUpdateNeeded = true;
		}

		// Update caption
		if (captionUpdateNeeded) {
			this.captionCallback(this.captionArray[this.captionIndex - 1][1]);
		}
	};

	// Callbacks
	var captioner = this;
	audioElement.addEventListener(
		'timeupdate',
		function() {
			captioner.updateCaptions();
		}
	);
	audioElement.addEventListener(
		'ended',
		function() {
			captioner.endedCallback();
		}
	);
}