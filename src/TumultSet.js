//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use strict';

/**
 * A modified version of the Set type which allow multiple argument for add and delete
 * @extends {Set}
 */
class TumultSet extends Set {
  constructor(iterable = []) {
    super(iterable);
  }

  add(...elements) {
    for (let element of elements) {
      super.add(element);
    }
    return this;
  }

  delete(...elements) {
    return elements.reduce((acc, elt) => super.delete(elt) && acc, true);
  }
}

module.exports = TumultSet;
