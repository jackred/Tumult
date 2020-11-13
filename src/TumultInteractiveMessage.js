//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

class TumultInteractiveMessage {
  constructor(renderFn, emojiMap, internalData = {}) {
    this.renderFn = renderFn;
    this.emojiMap = emojiMap;
    this.internalData = internalData;
    this.init();
  }

  init() {
    this.render();
  }

  react(emojiName) {
    const shouldRender = this.handleReact(emojiName);
    if (shouldRender) {
      this.render();
    }
  }

  handleReact(emojiName) {
    if (emojiName in this.emojiMap) {
      return this.emojiMap[emojiName].call(this);
    }
    return false;
  }

  render() {
    this.body = this.renderFn(this.internalData);
  }
}

module.exports = TumultInteractiveMessage;
