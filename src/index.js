//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

module.exports = {
  Controller: require('./TumultController'),
  Command: require('./TumultCommand'),
  Parser: require('./TumultParser'),
  InteractiveMessage: require('./TumultInteractiveMessage'),
  InteractiveEmbedMessage: require('./TumultInteractiveEmbedMessage'),
  Permission: require('./TumultPermission').TumultPermission,
  Right: require('./TumultPermission').TumultRight,
  USet: require('./TumultSet'),
};

/**
 * @external Snowflake
 * @see {@link https://discord.js.org/#/docs/main/stable/typedef/Snowflake}
 */
/**
 * @external Collection
 * @see {@link https://discord.js.org/#/docs/main/master/class/Collection}
 */
/**
 * @external PartialType
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/PartialType}
 */
/**
 * @external ActivityOptions
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/ActivityOptions}
 */
/**
 * @external MessageEmbed
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/MessageEmbed}
 */
