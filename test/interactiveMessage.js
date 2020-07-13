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

function render1D(internalData) {
  return internalData.data[internalData.i || 0];
}

function render2D(internalData) {
  return internalData.data[internalData.i || 0][internalData.p || 0];
}

function reactArrow() {
  this.internalData.i++;
  return true;
}

function reactPlus() {
  this.internalData.p++;
  return true;
}

function reactNothing() {
  return false;
}

test('create interactive message', () => {
  const list1 = new Tumult.InteractiveMessage(
    render1D,
    { '➡': reactArrow },
    { data: ['Hey text'], i: 0 }
  );
  const list2 = new Tumult.InteractiveMessage(
    render1D,
    {},
    { data: ['Hey text'] }
  );
  assert.strictEqual(list1.renderFn, render1D);
  assert.strictEqual(list1.body, 'Hey text');
  assert.strictEqual(list2.body, 'Hey text');
  assert.deepStrictEqual(list1.internalData, { i: 0, data: ['Hey text'] });
  assert.deepStrictEqual(list1.emojiMap, { '➡': reactArrow });
});

test('handleReact on interactive message', () => {
  const list1 = new Tumult.InteractiveMessage(
    render1D,
    { '➡': reactArrow, '-': reactNothing },
    { data: ['Hey text', 'Nope'], i: 0 }
  );
  const res = list1.handleReact('➡');
  const res2 = list1.handleReact('-');
  const res3 = list1.handleReact('not reacting');
  assert.strictEqual(res, true);
  assert.strictEqual(res2, false);
  assert.strictEqual(res3, false);
  assert.strictEqual(list1.internalData.i, 1);
});

test('render interactive message', () => {
  const list1 = new Tumult.InteractiveMessage(
    render1D,
    { '➡': reactArrow },
    { data: ['Hey text', 'Nope'], i: 0 }
  );
  list1.internalData.i = 1;
  list1.render();
  assert.strictEqual(list1.body, 'Nope');
  const list2 = new Tumult.InteractiveMessage(
    render2D,
    { '➡': reactArrow, '+': reactPlus },
    {
      data: [
        ['Hey text', 'Hey text verbose 1'],
        ['Nope', 'Nope but longer'],
      ],
      i: 0,
      p: 0,
    }
  );
  list2.internalData.i = 1;
  list2.internalData.p = 1;
  list2.render();
  assert.strictEqual(list2.body, 'Nope but longer');
});

test('react (handle and render) interactive message', () => {
  const list1 = new Tumult.InteractiveMessage(
    render1D,
    { '➡': reactArrow },
    { data: ['Hey text', 'Nope'], i: 0 }
  );
  list1.react('➡');
  assert.strictEqual(list1.body, 'Nope');
});
