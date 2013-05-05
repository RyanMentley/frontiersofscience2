
Project Status:

Done, and ready for compression then uploading.


---

Modifications to the captioner:

For a 50 line solution it is a solidly built and clean solution.

To accommodate our package I made a couple minor modifications:

- I replaced the captionElement with a captionCallback
- I added an endedCallback to trigger external events


I built a message system that we can re-use, so it would make more sense to pass the contents there.  To abstract your system from mine a local callback to an anon function that supplies my systems extra arguments is cleaner than calling my message code directly.  It allows your code to remain re-usable as well.

When the playback ends normally we would want to run a number of operations.  Adding a callback allows the actions to be defined per instance.  In our case we want to remove the message container, and return to normal animations.

---

Empty the repository history of large files (images):
http://stackoverflow.com/questions/4444091/git-filter-branch-to-delete-large-file

