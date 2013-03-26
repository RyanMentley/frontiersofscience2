
# Planetary System Notes
## Frontiers of Science II


Our goal is to create a web based interactive page featuring animation through images, and audio.  Use of the mouse to trigger events, and tied to a Wiimote for our presentation.

---

**Description**

A page with two separately processed animated elements.

The first element is the sun with an earth rotating around it, and (if we have enough time) a meteor shower sitting off in a corner.

The second is a close-up of the earth, simply rotating regularly.

The users interactions will (probably) be based on the Sun.

The users movement of the cursor will be captured and trigger events such as a solar flare, or meteor shower.

Ideally we should be able to pop-out one of the two components into a second window, allowing us to separately maximize for two-displays.

For mobile we may wish to use a single window, but swap which component is being displayed to account for the lack of screen real-estate.


---

**Current Project Research**

- Cross-Window Communication
- Image based animation
- Audio Playback in Browser


---

**Cross-Window Communication**

When we separate processing into two separated windows we would need a way of handling communication for triggered events between them.

Three methods for this exist, they include:

- [Linked Direct](http://frontiers.cdelorme.com/cbd/1/)
- [Linked Indirect](http://frontiers.cdelorme.com/cbd/2/)
- [Unlinked Indirect](http://frontiers.cdelorme.com/cbd/3/)

_Linked Direct_ is labeled as such since we create a new window object with a reference (hence the link), and we directly manipulate it by calling functions attached to that window object (by the scripts that load).  This means the code must be out in the open, not inside a closure, which automatically creates messier code.  All references must be established from the initial control-end, which places a higher level of dependencies on our main javascript code.

_Linked Indirect_ still requires the same reference variable, but uses postMessage to trigger events on the other-side.  This limits interaction but improves the flexibility of communication and decouples the code.  This is not supported by IE (even IE10) to separate windows, only frames.

_Unlinked Indirect_ is ideal but involves a substantial amount of additional code and is not supported on mobile, limiting us to Chrome, Opera, and FireFox.  Benefits are decoupled code, automatic handling of new or closed windows without breaking links, making it possible to fall-back to a single window without reloading or excessive amounts of additional code.  It would also allow us to create a single primary javascript file instead of several, improving overall organization, and separating the cross-window communication into its own thing.

---

**Image Based Animation**

May use a [jQuery Slideshow plugin](https://bitbucket.org/CDeLorme/jquery-slideshow-plugin) as the basis for this engine.  Depends on how far in we get versus how much time we have remaining.

Math needs to be done based on mouse positions and some requirements need to be defined.  We should also have a streamlined set of images to place on a poster to indicate acceptable patterns for users visiting our exhibit.

[Demonstration of the modified jQuery Slideshow integration](http://frontiers.cdelorme.com/itd/) for the project is now available.  Demonstration uses a set of 9 basic images swapped to create a smooth animation effect.

Demo has been tested on OS X laptop with Core i7 processor, and an iPhone 5, and worked at an acceptable rate.  Tests on lesser machines may be required to ensure functionality is not limited to newer systems.  Also different transition speeds may be tested.

Additional modifications will need to be added to allow storage of multiple sets of preloaded images, and dynamic switching between each.  Methods like addSlideshow would replace the current constructor process.  Methods like slideshow('name') could be used to switch the targeted slideshow group and reset the current position in the array of images.


---

**Audio Playback in Browser**

We are considering HTML5 Audio Tags, as they are widely supported and would likely be functional.

Concerns of pre-loading and bandwidth overhead limitations need to be investigated.


---

**References:**

- [Post Message](http://davidwalsh.name/window-postmessage)
- [Post Message](http://blog.carbonfive.com/2012/08/17/cross-domain-browser-window-messaging-with-html5-and-javascript/)
- [Mobile touchmove](http://stackoverflow.com/questions/6316503/how-to-get-continuous-mousemove-event-when-using-android-mobile-browser)
- [HTML5 Audio Tag](http://www.position-absolute.com/articles/introduction-to-the-html5-audio-tag-javascript-manipulation/)


---

**Misc Code:**

	var o = document.getElementsByTagName('iframe')[0];
	o.contentWindow.postMessage('Hello B', 'http://documentB.com/');

	function receiver(event) {
	        if (event.origin == 'http://documentA.com') {
	                if (event.data == 'Hello B') {
	                        event.source.postMessage('Hello A, how are you?', event.origin);
	                }
	                else {
	                        alert(event.data);
	                }
	        }
	}
	window.addEventListener('message', receiver, false);

