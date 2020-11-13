//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

const assert = require('assert');
const Tumult = require('../src');
const test = require('./test');

test('create USet', () => {
  const uset = new Tumult.USet();
  assert.strictEqual(uset.size, 0);
  const uset2 = new Tumult.USet([1, 1, 2, 3]);
  assert.deepStrictEqual(Array.from(uset2), [1, 2, 3]);
});

test('adding element', () => {
  const uset = new Tumult.USet();
  uset.add(1);
  uset.add(2, 3);
  uset.add(2, 4);
  assert.deepStrictEqual(Array.from(uset), [1, 2, 3, 4]);
});

test('deleting element', () => {
  const uset = new Tumult.USet([1, 2, 3, 4, 5, 6]);
  assert.ok(uset.delete(1));
  assert.ok(!uset.delete(1, 2, 3));
  assert.deepStrictEqual(Array.from(uset), [4, 5, 6]);
});
