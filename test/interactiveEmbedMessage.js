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
const { MessageEmbed } = require('discord.js');

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

test('create interactive embed message', () => {
  const embed1 = new Tumult.InteractiveEmbedMessage(
    render1D,
    { '➡': reactArrow },
    { data: [{ title: 'Hey text' }], i: 0 }
  );
  const embed2 = new Tumult.InteractiveEmbedMessage(
    render1D,
    { '➡': reactArrow },
    {
      data: [
        { title: 'Hey text' },
        { title: 'no', author: '77777', useless: 'toto' },
      ],
      i: 1,
    }
  );
  assert.strictEqual(embed1.renderFn, render1D);
  assert.strictEqual(embed2.renderFn, render1D);
  assert.deepStrictEqual(embed1.body, new MessageEmbed({ title: 'Hey text' }));
  assert.deepStrictEqual(
    embed2.body,
    new MessageEmbed({ title: 'no', author: '77777' })
  );
});

test('handleReact on interactive embed message', () => {
  const embed1 = new Tumult.InteractiveEmbedMessage(
    render1D,
    { '➡': reactArrow, '-': reactNothing },
    {
      data: [{ title: 'Hey text' }, { title: 'no', author: '77777' }],
      i: 0,
    }
  );
  const res = embed1.handleReact('➡');
  const res2 = embed1.handleReact('-');
  const res3 = embed1.handleReact('not reacting');
  assert.strictEqual(res, true);
  assert.strictEqual(res2, false);
  assert.strictEqual(res3, false);
  assert.strictEqual(embed1.internalData.i, 1);
});

test('render interactive embed message', () => {
  const embed1 = new Tumult.InteractiveEmbedMessage(
    render1D,
    { '➡': reactArrow, '-': reactNothing },
    {
      data: [
        { title: 'Hey text' },
        { title: 'no', author: '77777', useless: 'toto' },
      ],
      i: 0,
    }
  );
  embed1.internalData.i = 1;
  embed1.render();
  assert.deepStrictEqual(
    embed1.body,
    new MessageEmbed({ title: 'no', author: '77777' })
  );
  const embed2 = new Tumult.InteractiveEmbedMessage(
    render2D,
    { '➡': reactArrow, '+': reactPlus },
    {
      data: [
        [{ title: 'Hey text' }, { title: 'New title' }],
        [
          { title: 'no', author: '77777', useless: 'toto' },
          { title: 'Other title', timestamp: 888888 },
        ],
      ],
      i: 0,
      p: 0,
    }
  );
  embed2.internalData.i = 1;
  embed2.internalData.p = 1;
  embed2.render();
  assert.deepStrictEqual(
    embed2.body,
    new MessageEmbed({ title: 'Other title', timestamp: 888888 })
  );
});

test('react (handle and render) interactive message', () => {
  const embed1 = new Tumult.InteractiveEmbedMessage(
    render2D,
    { '➡': reactArrow, '+': reactPlus },
    {
      data: [
        [{ title: 'Hey text' }, { title: 'New title' }],
        [
          { title: 'no', author: { name: '77777' }, useless: 'toto' },
          { title: 'Other title', timestamp: 888888 },
        ],
      ],
      i: 0,
      p: 0,
    }
  );
  embed1.react('➡');
  embed1.react('+');
  assert.deepStrictEqual(
    embed1.body,
    new MessageEmbed({
      title: 'Other title',
      timestamp: 888888,
      author: { name: '77777' },
    })
  );
});
