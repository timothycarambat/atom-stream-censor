# Atom Stream Censor

When doing programming live streaming, showing your keys is like sharing your credit card to Twitter. Watching past streams and collecting keys is a hobby that preys on the careless. Rolling keys over every stream you expose them is tiresome and way more effort than its worth.

Introducing **Stream Censor** where you can edit the `.env` (or other secret's files) live on stream or recording without worry! You can blur the entire file and since its your config you can feel your way through it while editing, while others will have no idea what your typing.

There are three levels of blur you can change on the fly:
- Low (kinda like bad glaucoma, you can figure it out, but over a stream - nearly impossible)
- Medium (this is like seeing anything after a **very** hard night out in your 30s)
- High (this file has about as much visibility as trying to find a grain of rice on a paper plate in a snowstorm.)

## Settings:
In the settings of this package you can add file types to the `sensitiveFiles` array and they will get ignored when Stream Censor is enabled.
The default blur level can be found here without having the use the `Packages > Stream Censor> Increase/Decrease` menu items.
Don't mess with the default `isEnabled` value. Should be `false`. Who am I to tell you what to do. I'm a README not a cop.

## Starting Stream Censor
`ALT + CRTL + O` (or your own combination) will enable or disable the package. You will get a notification so that you know what the current status is.
You can also enable by `RMB > Toggle Stream Censor` or `Packages > Stream Censor> Toggle`.
