//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use strict';

const { TextChannel } = require('discord.js');
const TumultDiscordUtility = require('./TumultDiscordUtility');

class AlanaController {
  constructor(client, commands, config, permission,  options={}) {
    this.client = client;
    this.commands = TumultDiscordUtility.arrayToCollectionCommand(commands);
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
			this.handleCommands(this.commands, message, message.content);
    }
  }

	async handleCommands(commands, message, argText) {
		const keys = commands.keys();
		let done = false;
		let res = false;
		while ((!done) && (!res)) {
			const key = keys.next();
			console.log('KEY', key);
			done = key.done;
			if (!done) {
				res = await this.handleCommandMessage(commands.get(key.value), message, argText);
				console.log("RES", res);
			}
		}
		return res;
	}
	
	async handleCommandMessage(command, message, text) {
		const resParser = command.parser(text, command.name);
		console.log('res', resParser);
		if (resParser.commandCalled) {
			console.log(`INFO: command ${command.name} has been call`);
			const permissionLevel = this.getPermission(message.author.id, message.member.roles.cache, message.channel.id);
			if (permissionLevel < command.permission) {
				this.sendError(message.channel, 'Insufficient permission');
				return false;
			}
			console.log('ARG', resParser.arg);
			if (resParser.arg === this.config.help) {
				message.channel.send(command.help.call(command));
				return true;
			}
			let stopHere = await this.handleCommands(command.subCommand, message, resParser.arg);
			if (stopHere) { return true; }
			stopHere = await command.action.call(command, message, resParser.arg, this.options);
			return true;			
		}
		return false;
	}

	
	sendError(channel, error){
		console.log('Error:', error);
		channel.send('```A problem occured:\n' + error +'```');
	}
	
}

module.exports = AlanaController;
