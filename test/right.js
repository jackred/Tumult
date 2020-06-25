//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use strict';

const assert = require('assert');
const Tumult = require('../src');
const test = require('./test');

test('create right', () => {
  const right = new Tumult.Right();
  const keys = Object.keys(right);
  const arrayEqual = [
    '_users',
    '_roles',
    '_channels',
    '_discordPermissions',
    '_otherRight',
  ];
  assert.deepStrictEqual(right._rightName, arrayEqual);
  arrayEqual.push('_rightName');
  assert.deepStrictEqual(keys, arrayEqual);
  assert.strictEqual(right._users.size, 0);
});

test('create right with arguments', () => {
  const right = new Tumult.Right({
    users: [1, 8],
    roles: new Set([4, 5]),
  });
  // not sure about using Array.from here
  assert.deepStrictEqual(Array.from(right._users), [1, 8]);
  assert.deepStrictEqual(Array.from(right._roles), [4, 5]);
});

test('use getters', () => {
  const right = new Tumult.Right({
    users: [1, 2, 3],
  });
  assert.strictEqual(right._users, right.users);
  assert.ok(right.users.add(4).has(4));
  right.users.delete(4);
  assert.ok(!right.users.has(4));
});

test('use setters', () => {
  const right = new Tumult.Right({});
  right.users = [1, 2, 3];
  right.roles = new Set([44, 7]);
  assert.deepStrictEqual(Array.from(right._users), [1, 2, 3]);
  assert.deepStrictEqual(Array.from(right._roles), [44, 7]);
  assert.throws(() => (right.users = 7), { name: /^TypeError$/ });
});

test('clear set', () => {
  const right = new Tumult.Right({ users: [1], roles: [2] });
  right.clear();
  assert.strictEqual(right.users.size, 0);
  assert.strictEqual(right.roles.size, 0);
});

test('concat others rights', () => {
  const right1 = new Tumult.Right({ users: [1] });
  const right2 = { users: [3] };
  const right3 = new Tumult.Right({ users: [2] });
  right1.concat(right2);
  right3.concat(right1, right2);
  assert.deepStrictEqual(Array.from(right1._users), [1, 3]);
  // check if it wasn't modified
  assert.deepStrictEqual(Array.from(right2.users), [3]);
  assert.deepStrictEqual(Array.from(right3._users), [2, 1, 3]);
});

test('an union of rights', () => {
  const right1 = new Tumult.Right({ users: [1] });
  const right2 = new Tumult.Right({ users: [2] });
  const right3 = Tumult.Right.union(right1, right2);
  assert.deepStrictEqual(Array.from(right3._users), [1, 2]);
});
