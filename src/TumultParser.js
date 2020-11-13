//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

/**
 * Parse for prefix in a message. It check that the message start with the prefix and return the argument and a boolean. TODO -> make return type a structure. TODO -> make the prefix integrated in the type of command
 * @param {String} text The text to parse
 * @param {String} prefix The prefix to check against the text
 * @returns {Object}
 */
function prefixParser(text, prefix) {
  if (text.startsWith(prefix) && text.substring(prefix) !== ' ') {
    let rest = text.replace(prefix, '');
    return { arg: rest.trim(), commandCalled: true };
  }
  return { commandCalled: false };
}

/**
 * Parse for command in a message. It check that the first word separated by a given separator is the given word.
 * @param {String} text The text to parse
 * @param {String} word The word to check against the text
 * @param {String} separatorword The separator used to separe world
 * @returns {Object}
 */
function defaultParser(text, word, separatorWord = ' ') {
  if (
    text === word ||
    (text.startsWith(word) && text.substring(word.length)[0] === separatorWord)
  ) {
    let rest = text.replace(word, '');
    return { arg: rest.trim(), commandCalled: true };
  }
  return { commandCalled: false };
}

module.exports = {
  defaultParser,
  prefixParser,
};
