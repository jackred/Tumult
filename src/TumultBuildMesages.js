//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use strict';

const { MessageEmbed } = require('discord.js');

function buildErrorMessage(title, error, { color = [255, 0, 0] } = {}) {
  let embed = new MessageEmbed();
  embed.setTitle(title);
  embed.setDescription(`**${error}**`);
  embed.setColor(color);
  embed.setTimestamp();
  return embed;
}

function buildCommandErrorMessage(nameCommand, error) {
  return buildErrorMessage(`When executing *${nameCommand}*`, error);
}

function buildControllerErrorMessage(error) {
  return buildErrorMessage('Unexpected internal error', error);
}

function buildWarningMessage(warning) {
  return buildErrorMessage('Warning', warning, { color: [200, 180, 0] });
}

function buildHelpMessage(
  title,
  help,
  { color = [0, 0, 255], subHelps = [] } = {}
) {
  let embed = new MessageEmbed();
  embed.setTitle(title);
  embed.setDescription(`**${help}**`);
  embed.addFields(subHelps);
  embed.setColor(color);
  embed.setTimestamp();
  return embed;
}

module.exports = {
  buildCommandErrorMessage,
  buildControllerErrorMessage,
  buildWarningMessage,
  buildHelpMessage,
};
