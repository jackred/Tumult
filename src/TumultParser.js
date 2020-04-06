//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use strict';

const TumultUtility = require('./TumultUtility');

function prefixParser(text, prefixs) {
  let res = -1;
  for (let prefix in prefixs) {
    if (text.startsWith(prefixs[prefix])){
      let rest = text.replace(prefixs[prefix], '');
      res = {'first': prefixs[prefix], 'rest': rest.trim()};
    }
  }
  return res;
}


function defaultParser(text, word=' ') {
  let res = TumultUtility.splitIn2(text, word);
  return {'first': res[0], 'rest': (res.length === 1) ? '' : res[1].trim() };
}


module.exports = { 
  defaultParser,
  prefixParser
};
