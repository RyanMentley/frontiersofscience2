frontiersofscience2
===================

Frontiers of Science II class project


## Project Overview

Objective is a cause and effect system of solar weather events.

Tools chosen thus far include Web (JavaScript, HTML, CSS) and potentially a Wiimote (as a mouse) for our Imagine RIT Display.

---

## Status

Currently testing inter-window communication with JavaScript.

Available Methods:

- Window Object
- [Cross Document Messages](http://caniuse.com/#feat=x-doc-messaging)
- [SharedWorkers](http://caniuse.com/#feat=sharedworkers)

The first method is subject to varying scrutiny, but is the most compatible of the available options.  This method requires spawning the second window and assigning a reference variable to access it.  Then triggering events by calling them directly treating that reference as a window object.

Cross Document Messages are not fully supported by IE (event IE10), but work everywhere else.  Like the Window Object method this still requires that the second window be spawned by the first, and a reference variable is then used to send the communication.  However, communication becomes a game of catch and receive, instead of direct access, which secures the code and keeps the overall system cleaner.

The third method is ideal, but only supported in Chrome, Safari, and Opera.  This limits compatibility, but greatly improves functionality.  It allows windows to communicate without being spawned from one or the other.  This mixed with the postMessage (Cross Document Messages) would be the ideal solution.

I have performed extensive testing on the SharedWorker object and built a [library](http://cdelorme.com/SharedWorker/) of code we could adopt and modify for our purposes.
