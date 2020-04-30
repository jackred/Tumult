//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
"use strict";

const { Collection } = require("discord.js");

function arrayToCollectionCommand(array) {
  const resCollection = new Collection();
  for (let command of array) {
    resCollection.set(command.name, command);
  }
  return resCollection;
}

module.exports = {
  arrayToCollectionCommand,
};
