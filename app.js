import express from 'express';
import path from 'path';
import NfcController from './nfc-controller.js';
import EventEmitter from 'node:events';
import MonsterManager from './monster-manager.js';

// Work around for __dirname not being useable with experimental modules
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
global.__dirname = path.dirname(__filename);
// ---

// grab only the user given arguments
global.__args = process.argv.slice(2, process.argv.length);
console.log ("Launching app with the following parameters", global.__args);
// ---

let app = express();
var ip = '0.0.0.0';
var port = 3000;
var eventEmitter = new EventEmitter();
var nfcController = new NfcController(eventEmitter);
var monsterManager = new MonsterManager(eventEmitter, nfcController);

// Swapping between read and write as events are detected for proof of concept.
// docs for controlling events https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter
/*
eventEmitter.on('CARD_READ', (cardJson) => {
  console.log('App detected Card Json:', cardJson)
  nfcController.PrepareToWrite({name: 'Battle-a', rng: Math.random()})
  })
  
eventEmitter.on('CARD_WRITE', (cardVersionData) => {
  console.log('App detected Card Write:', cardVersionData)
  nfcController.PrepareToRead();
})
*/

let requestHandler = app.listen (
    port,
    ip,
    () => {
        console.log ('Running server at ' + ip + ':' + port);
    }
)

process.on('SIGINT', () => {
  nfcController.shutdown();
  process.exit();
});