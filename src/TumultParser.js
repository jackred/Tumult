//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
"use strict";

function prefixParser(text, prefix) {
  if (text.startsWith(prefix) && text.substring(prefix) !== " ") {
    let rest = text.replace(prefix, "");
    return { arg: rest.trim(), commandCalled: true };
  }
  return { commandCalled: false };
}

function defaultParser(text, word, separatorWord = " ") {
  if (
    text === word ||
    (text.startsWith(word) && text.substring(word.length)[0] === separatorWord)
  ) {
    let rest = text.replace(word, "");
    return { arg: rest.trim(), commandCalled: true };
  }
  return { commandCalled: false };
}

module.exports = {
  defaultParser,
  prefixParser,
};
