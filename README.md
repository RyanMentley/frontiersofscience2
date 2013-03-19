# frontiersofscience2

Frontiers of Science II class project


## Project Overview

Objective is a cause and effect system of solar weather events.

Tools chosen thus far include Web (JavaScript, HTML, CSS) and potentially a Wiimote (as a mouse) for our Imagine RIT Display.

---

## Status

Currently testing cross-window communication.  Next is HTML5 audio tags, and finally an image slide show system for smooth animations.

**Demo Code:**

- [Linked Direct](http://frontiers.cdelorme.com/cbd/1/)
- [Linked Indirect](http://frontiers.cdelorme.com/cbd/2/)
- [Unlinked Indirect](http://frontiers.cdelorme.com/cbd/3/)

The first two are relatively simple and show direct access with the window object, and postMessage event based handling.

The third uses the SharedWorker component and is much more complex

The SharedWorker example requires quite a bit more context to be useful, so while it does in fact require more code to build, the demonstration code is almost the entire implementation, not a minimal example like the first two.


**References:**

- [Cross Document Messages](http://caniuse.com/#feat=x-doc-messaging)
- [SharedWorkers](http://caniuse.com/#feat=sharedworkers)
- [Complex SharedWorker Implementationn](http://cdelorme.com/SharedWorker/)
