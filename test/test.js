//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

// copied from discord.js/collection test
function test(desc, fn) {
  try {
    fn();
  } catch (e) {
    console.error(`Failed to ${desc}`);
    throw e;
  }
}

module.exports = test;
