//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>

// @ts-check
'use strict';

/**
 * A modified version of the Set type which allow multiple argument for add and delete
 * @template {any} T
 * @extends {Set}
 */
class TumultSet extends Set {
  /**
   * @constructor
   * @param {T[]} [iterable=[]] If an iterable object is passed, all of its elements will be added to the new Set. If you don't specify this parameter, or its value is null, the new Set is empty.
   */
  constructor(iterable = []) {
    super(iterable);
  }

  /**
   * @param {...T | undefined} elements the elements to add to the set, one by one
   * @returns {TumultSet<T>}
   */
  add(...elements) {
    if (elements.length === 0) {
      elements = [undefined];
    }
    for (let element of elements) {
      super.add(element);
    }
    return this;
  }

  /**
   * @param {...T | undefined} elements the elements to delete from the set, one by one
   * @returns {boolean}
   */
  delete(...elements) {
    if (elements.length === 0) {
      elements = [undefined];
    }
    return elements.reduce((acc, elt) => super.delete(elt) && acc, true);
  }
}

module.exports = TumultSet;
