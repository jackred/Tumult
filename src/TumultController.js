//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use strict';

const { TextChannel } = require('discord.js');

class AlanaController {
  constructor(client, command, config, permission,  options={}) {
    this.client = client;
    this.commands = command;
    // this.reactions = reaction;
    this.options = options;
    this.config = config;
    this.permission = permission;
    this.createHandler();
  }

  createHandler() {
    this.client.on('message', this.handleMessage.bind(this));
    // this.client.on('guildMemberSpeaking', this.handleVocalMessage.bind(this));
    // this.client.on('messageReactionAdd', this.handleReactionAdd.bind(this));
    // this.client.on('messageReactionRemove', this.handleReaction.bind(this));
  }

  checkPermission(id, level, key) {
    return this.permission[level][key].some((d) => d === id);
  }

  checkRolesPermission(roles, level) {
    return roles.some(r => this.checkPermission(r.id, level, 'roles'));
  }
  
  checkLevelMessage(authorID, roles, channelID, level) {
    return this.checkPermission(authorID, level, 'users')
      || this.checkRolesPermission(roles, level)
      || this.checkPermission(channelID, level, 'channels');
  }
  
  getPermission(authorID, roles, channelID){
    if (this.checkLevelMessage(authorID, roles, channelID, 'blacklist')) { return this.permission.level.blacklist; }
    if (this.checkLevelMessage(authorID, roles, channelID, 'whitelist')) { return this.permission.level.whitelist; }
    if (this.checkLevelMessage(authorID, roles, channelID, 'admins')) { return this.permission.level.admins; }
    return this.permission.level.default;
  }
  
  async handleReactionAdd(reaction, user){}

  async handleVocalMessage(member, speaking){}

  async catchErrorCommand(fn, channel){
    try {
      return await fn();
    } catch (error){
      this.sendError(channel, error);
      return true;
    } 
  }
  
  handleMessage(message) {
    if (message.author.bot) { return; }
    if (message.channel.type === 'dm'){
      console.log('INFO: DM message received');
      message.reply("There's no DM functionality");
    } else if (message.channel.type === 'text') {
      this.handleMessageCommand(this.commands, message, message.content);
    }
  }

  async handleMessageCommand(command, message, text) {
		console.log(command);
		if (Object.keys(command).length === 0 && command.constructor === Object) { return false; }
    const permissionLevel = this.getPermission(message.author.id, message.member.roles.cache, message.channel.id);
    console.log('INFO: permission', permissionLevel, 'command permission', command.permission);
    if (permissionLevel < command.permission) {
      this.sendError(message.channel, 'Insufficient permission');
    } else {
      let parsed = command.parser(text, this.config.prefix);
      if (parsed !== -1){
				if (parsed.first === this.config.help){
					message.channel.send(command.help.call(command));
					return true;
				}
				if (parsed.first in command.subCommand){
					const stopHere = await this.handleMessageCommand(command.subCommand[parsed.first], message, parsed.rest);
					if (stopHere) { return stopHere; }
				}
      }
      const stopHere = await this.catchErrorCommand(async () => {
				return await command.action.call(command, message, text, this.db, this.client, this.tts, this.stt);
      },
																										message.channel);// some action can trigger command AND args
      return stopHere;
    }
    return false;
  }

  sendError(channel, error){
    console.log('Error:', error);
    channel.send('```A problem occured:\n' + error +'```');
  }
  
}

module.exports = AlanaController;
