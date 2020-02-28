Music written in Javascript
===========================

This project demonstrates writing music in Javascript. In the beginning I used NodeJS with MIDI to control a synth, and then got into [4klang](https://github.com/hzdgopher/4klang/) which is a very compact but extremely powerful synth, which finally inspired me to atttempt writing a synth in WebAssembly running entirely in the browser.

# Webassembly music in the browser

This is a live-coding environment for music running entirely in the browser, synthesizing music in webassembly using [AssemblyScript](https://docs.assemblyscript.org/).

You can test it yourself here (remove the `gist` url parameter if you want a clean project ):
https://petersalomonsen.com/webassemblymusic/livecodev2/?gist=5b795090ead4f192e7f5ee5dcdd17392

Demo videos:
https://www.youtube.com/watch?v=C8j_ieOm4vE&list=PLv5wm4YuO4IxRDu1k8fSBVuUlULA8CRa7

Sources are in the [wasmaudioworklet](wasmaudioworklet) folder.

There are also more resources like articles and earlier versions at https://petersalomonsen.com

# 4klang

My experiments with the [4klang](https://github.com/hzdgopher/4klang/) synth can be found int the [4klang](4klang) folder.

If you just want to listen to the songs:
https://soundcloud.com/psalomo/4klang-lazy-grooves
https://soundcloud.com/psalomo/4klang-first-attempt

You may check out the windows exe of the "first attempt" song (link to zip with exe found in video description):

https://www.youtube.com/watch?v=zHrbLSjKmxQ

# NodeJS MIDI

My first attempt on writing music with Javascript used NodeJS with MIDI routed to [ZynAddSubFX](http://zynaddsubfx.sourceforge.net/) for the sounds

https://youtu.be/oPfOeEbM4M0

And you can listen to the song [songs/upbeat.js](songs/upbeat.js) here: 
https://soundcloud.com/psalomo/80s-nostalgica

Run directly from nodejs, only dependes on the node midi package, and connect to a midi device.
