//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

const { Collection } = require('discord.js');

function arrayToCollectionCommand(array) {
  const resCollection = new Collection();
  for (let command of array) {
    for (let name of command.name) {
      resCollection.set(name, command);
    }
  }
  return resCollection;
}

module.exports = {
  arrayToCollectionCommand,
};
