# What Is This
[game name] is a game about raising monsters that live in nfc cards. Inspired by Monster Rancher, you'll be pitting your monsters in contests. You can bet on the outcome to get money and buy things for your home.

# Setup
## Pre-requirements
This app uses `nfc-pcsc` and `nfccard-tool` to read nfc data from cards. You'll need some kind usb NFC reader. This app assumes NDEF data.

## Installation
`cd` into the root app directory

`npm install` to download node modules.

`node app.js` to get started. Make sure the nfc reader is plugged in before starting the app.

## How To Use
### Making monsters
You can make monsters without front-end ui by appending `make-monster` to the launch command. You'll also need to specify the monster you want to make and its name. 

E.g.

`node app.js make-monster monster=scruffhauser name=scruffy`

This will cause all cards scanned to create a new monster with the name of "Scruffy". You'll need to `ctrl-c` to stop the app and restart it without those parameters to resume normal functionality.