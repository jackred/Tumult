//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

const assert = require('assert');
const Tumult = require('../src');
const test = require('./test');

test('create permission', () => {
  const permission = new Tumult.Permission();
  assert.strictEqual(permission.everyone, 'everyone');
  assert.deepStrictEqual(Object.keys(permission.rights), ['blacklist']);
});

test('create permissionhh with arguments', () => {
  const permission = new Tumult.Permission({
    whitelist: { users: [1, 2, 3] },
    everyone: 'default',
  });
  assert.strictEqual(permission.everyone, 'default');
  assert.deepStrictEqual(Object.keys(permission.rights), [
    'blacklist',
    'whitelist',
  ]);
  assert.deepStrictEqual(Array.from(permission.rights.whitelist.users), [
    1,
    2,
    3,
  ]);
});

test('create cached rights', () => {
  const permission = new Tumult.Permission({
    whitelist: { users: [1, 2, 3], otherRight: ['mod', 'blacklist'] },
    mod: { users: [2, 4], otherRight: ['admins'] },
    admins: { users: [1, 5] },
    blacklist: { users: [6] },
  });
  const cachedKeys = Object.keys(permission._cachedRights);
  assert.deepStrictEqual(Array.from(cachedKeys), [
    'blacklist',
    'whitelist',
    'mod',
    'admins',
  ]);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedRight.users),
    [6]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.whitelist.derivedRight.users),
    [1, 2, 3, 4, 6, 5]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.mod.derivedRight.users),
    [2, 4, 1, 5]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.admins.derivedRight.users),
    [1, 5]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedSet),
    [permission.rights.blacklist]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.whitelist.derivedSet),
    [
      permission.rights.whitelist,
      permission.rights.mod,
      permission.rights.blacklist,
      permission.rights.admins,
    ]
  );
  assert.deepStrictEqual(Array.from(permission._cachedRights.mod.derivedSet), [
    permission.rights.mod,
    permission.rights.admins,
  ]);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.admins.derivedSet),
    [permission.rights.admins]
  );
});

test('add right to permission', () => {
  const permission = new Tumult.Permission({
    whitelist: { users: [1, 2, 3] },
  });
  const right = new Tumult.Right({
    users: [4, 5, 6],
    otherRight: ['whitelist'],
  });
  permission.rights.mod = right;
  assert.deepStrictEqual(Object.keys(permission.rights), [
    'blacklist',
    'whitelist',
    'mod',
  ]);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.mod.derivedRight.users),
    [4, 5, 6, 1, 2, 3]
  );
  assert.deepStrictEqual(Array.from(permission._cachedRights.mod.derivedSet), [
    permission.rights.mod,
    permission.rights.whitelist,
  ]);
});

test('remove right from permission', () => {
  const permission = new Tumult.Permission({
    whitelist: { users: [1, 2, 3] },
    blacklist: { users: [4], otherRight: ['whitelist'] },
  });
  delete permission.rights.whitelist;
  assert.deepStrictEqual(Object.keys(permission.rights), ['blacklist']);
  assert.deepStrictEqual(Object.keys(permission._cachedRights), ['blacklist']);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedRight.users),
    [4]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedSet),
    [permission.rights.blacklist]
  );
});

test('set new value to right', () => {
  const permission = new Tumult.Permission({
    whitelist: { users: [1, 2, 3] },
    blacklist: { users: [4], otherRight: ['whitelist'] },
    mod: { users: [7] },
  });
  permission.rights.whitelist = new Tumult.Right({
    users: [5, 6],
    otherRight: ['blacklist'],
  });
  permission.rights.mod = { users: [8] };
  assert.deepStrictEqual(Array.from(permission.rights.whitelist.users), [5, 6]);
  assert.deepStrictEqual(Array.from(permission.rights.mod.users), [8]);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedRight.users),
    [4, 5, 6]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.whitelist.derivedRight.users),
    [5, 6, 4]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.mod.derivedRight.users),
    [8]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.whitelist.derivedSet),
    [permission.rights.whitelist, permission.rights.blacklist]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedSet),
    [permission.rights.blacklist, permission.rights.whitelist]
  );
  assert.deepStrictEqual(Array.from(permission._cachedRights.mod.derivedSet), [
    permission.rights.mod,
  ]);
});

test('modify a right value', () => {
  const permission = new Tumult.Permission({
    whitelist: { users: [1, 2, 3] },
    blacklist: { users: [4], otherRight: ['whitelist'] },
    mod: { users: [7] },
  });
  permission.rights.mod.users.add(4);
  permission.rights.whitelist.otherRight.add('mod');
  permission.rights.whitelist.users.delete(1);
  permission.rights.blacklist.users.clear();
  permission.rights.blacklist.users = [78];
  assert.deepStrictEqual(Array.from(permission.rights.whitelist.users), [2, 3]);
  assert.deepStrictEqual(Array.from(permission.rights.blacklist.users), [78]);
  assert.deepStrictEqual(Array.from(permission.rights.mod.users), [7, 4]);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.mod.derivedRight.users),
    [7, 4]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedRight.users),
    [78, 2, 3, 7, 4]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.whitelist.derivedRight.users),
    [2, 3, 7, 4]
  );
  assert.deepStrictEqual(Array.from(permission._cachedRights.mod.derivedSet), [
    permission.rights.mod,
  ]);
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.whitelist.derivedSet),
    [permission.rights.whitelist, permission.rights.mod]
  );
  assert.deepStrictEqual(
    Array.from(permission._cachedRights.blacklist.derivedSet),
    [
      permission.rights.blacklist,
      permission.rights.whitelist,
      permission.rights.mod,
    ]
  );
});
