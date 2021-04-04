# Perf log
starts off at 60fps
memory leak to 30fps
huge garbage collection spike


# TODO NEXT
Perf notes.

Try implementing this program from scratch. Profile it.
Then profile computeRenderCommands on its own (ignore rendering and framework, etc).
Think about implementing computeRenderCommands from scratch.





# Things to mop
- convert vue files to classes
- use hygen to make vue components
- return iterables, not generators


# BUGS
- referencing super xy doesn't have super's name prefix
- cursor ends up on last character (don't fix this)
- select border is messed up
- sometimes inserting kills existing expression (esp. with tri/ease)

# TODO
- be able to change metaorganism+
  - this will take some thought
  - save old attributes, what if new required has different type?
- push attribute up to share with other ones
  - "remove this reference to individual clone before pushing attribute to super"
- create plain vector
- clonenumber11
- vector custom attribute
- rename attribute+
- line
- triangle
- interval
- non fill shape
- WSYWIG
- sliders
- projects
- the void upgrade
  - the void attributes always have same uuid
- the void attributes
- prettier 100 ch width