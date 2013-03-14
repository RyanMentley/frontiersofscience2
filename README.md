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

The first method is more widely supported but requires that the first window spawn the second so it has a reference to it.  This method may also require exposing the API used in the second window for actions.

The second is supported in all browsers except IE (even IE10), which retains partial support only for iFrames.  If we go that route we can redirect IE users.

