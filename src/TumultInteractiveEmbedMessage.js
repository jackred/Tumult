//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

const { MessageEmbed } = require('discord.js');
const TumultInteractiveMessage = require('./TumultInteractiveMessage');

class TumultInteractiveEmbedMessage extends TumultInteractiveMessage {
  constructor(renderFn, emojiMap, internalData = {}) {
    super(renderFn, emojiMap, internalData);
  }

  init() {
    this.body = {};
    this.render();
  }

  render() {
    this.body = new MessageEmbed({
      ...this.body,
      ...this.renderFn(this.internalData),
    });
  }
}

module.exports = TumultInteractiveEmbedMessage;
