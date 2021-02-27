//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

const { Client } = require('discord.js');
const TumultDiscordUtility = require('./TumultDiscordUtility');
const TumultBuildMessages = require('./TumultBuildMesages');
const TumultCommand = require('./TumultCommand');

/**
 * Wrapper around the client, provide interface for events handling and command
 */
class TumultController {
  /**
   * @param {String} token Token of the account to log in with
   * @param {Object} permission Object containing permission information. TODO -> change to a class / structure specific as it has a special format
   * @param {Object} [options] Options for client or commands
   * @param {Object} [options.options={}] Options gave by the user, forwarded to every command.
   * @param {Array<PartialType>} [options.partials=[]] Options for the client to catch partial. Event will still be emitted when there's no data for a the structure. See the "Partials" on discord.js.org. TODO -> give all option to client
   * @param {string|ActivityOptions} [options.activity="mention me + help"] Activity being played, or options for setting the activity
   * @param {Array.<TumultCommand>} [options.messageCommands=[]] The top level messages commands that will be matched againts every message.
   * @param {String} [options.helpKey="help"] The key used to call the help message on any command
   */
  constructor(
    token,
    permission,
    {
      options = {},
      partials = [],
      activity = 'mention me + help',
      messageCommands = [],
      helpKey = 'help',
    } = {}
  ) {
    this.createClient(token, partials, activity);
    this.createHandler();
    /**
     * Collection of the message commands
     * @type {Collection<String, tumultCommand>}
     */
    this.messageCommands = TumultDiscordUtility.arrayToCollectionCommand(
      messageCommands
    );
    this.setMessageCommands = new Set(this.messageCommands.values());
    // this.reactions = reaction;
    /**
     * Options gave by the user, forwarded to every command.
     * @type {Object}
     */
    this.options = options;
    /**
     * Object containing permission information. TODO -> change to a class / structure specific as it has a special format
     * @type {Object}
     */
    this.permission = permission;
    /**
     * The key used to call the help message on any command
     * @type {String}
     */
    this.helpKey = helpKey;
  }

  // TODO -> add "_" in front of non doc function (private)
  createClient(token, partials, activity) {
    this.client = new Client({ partials });
    this.client.on('ready', () => {
      console.log('Starting!');
      // TODO -> change for setPresence
      // TODO -> command to change presence
      this.client.user.setActivity(activity);
    });
    this.client
      .login(token)
      .then(() => console.log("We're in !"))
      .catch((err) => console.log(err));
  }

  /**
   *
   * @param {TumultCommand|Array.<TumultCommand>} commands The commands to add to the controller
   * @param {Arrat<String>} [path=[]] The path where to add the command. Each element should be the name of a command, the first one being at the root.
   */
  addMessageCommands(commands, path = []) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }
    for (let command of commands) {
      if (!(command instanceof TumultCommand)) {
        // TODO -> error system
        throw 'Argument commands should be an instance of TumultCommand, or an array of TumultCommand';
      }
    }
    if (!Array.isArray(path)) {
      throw 'Path need to be an array';
    }
    let cmd = this.messageCommands;
    while (path.length > 0 && cmd.has(path[0])) {
      cmd = cmd.get(path.shift()).subCommand; // pop on first element
    }
    if (path.length !== 0) {
      throw `Incorrect path. ${path[0]} couldn"t be found.`;
    }
    for (let command of commands) {
      cmd.set(command.name, command);
      console.log(`INFO: command ${command.name} added`);
    }
    this.setMessageCommands = new Set(this.messageCommands.values());
  }

  /**
   *
   * @param {String|Array<String>} commandsName The names of the commands to remove from the controller
   * @param {Arrat<String>} [path=[]] The path to the commands to be removed. Each element should be the name of a command, the first one being at the root.
   */
  removeMessageCommands(commandsName, path = []) {
    if (!Array.isArray(commandsName)) {
      commandsName = [commandsName];
    }
    if (!Array.isArray(path)) {
      throw 'Path need to be an array';
    }
    if (typeof path === 'string') {
      path = [path];
    }
    let cmd = this.messageCommands;
    while (path.length > 0 && cmd.has(path[0])) {
      cmd = cmd.get(path.shift()).subCommand; // pop on first element
    }
    if (path.length !== 0) {
      throw `Incorrect path. ${path[0]} couldn"t be found.`;
    }
    const unknownCommands = commandsName.filter((name) => !cmd.has(name));
    if (unknownCommands.length !== 0) {
      throw `${unknownCommands
        .toString()
        .replace(/,/, ', ')} are not valid commands`;
    }
    for (let commandName of commandsName) {
      cmd.delete(commandName);
      console.log(`INFO: command ${commandName} removed`);
    }
    this.setMessageCommands = new Set(this.messageCommands.values());
  }

  createHandler() {
    this.client.on('message', this.handleMessage.bind(this));
    // this.client.on("guildMemberSpeaking", this.handleVocalMessage.bind(this));
    // this.client.on("messageReactionAdd", this.handleReactionAdd.bind(this));
    // this.client.on("messageReactionRemove", this.handleReaction.bind(this));
  }

  checkPermission(id, level, key) {
    return this.permission[level][key].some((d) => d === id);
  }

  checkRolesPermission(roles, level) {
    return roles.some((r) => this.checkPermission(r.id, level, 'roles'));
  }

  checkLevelMessage(authorID, roles, channelID, level) {
    return (
      this.checkPermission(authorID, level, 'users') ||
      this.checkRolesPermission(roles, level) ||
      this.checkPermission(channelID, level, 'channels')
    );
  }

  getPermission(authorID, roles, channelID) {
    if (this.checkLevelMessage(authorID, roles, channelID, 'blacklist')) {
      return this.permission.level.blacklist;
    }
    if (this.checkLevelMessage(authorID, roles, channelID, 'whitelist')) {
      return this.permission.level.whitelist;
    }
    if (this.checkLevelMessage(authorID, roles, channelID, 'admins')) {
      return this.permission.level.admins;
    }
    return this.permission.level.default;
  }

  async handleReactionAdd() {} //}reaction, user) { }

  async handleVocalMessage() {} //}member, speaking) { }

  async catchErrorCommand(fn, channel) {
    try {
      return await fn();
    } catch (error) {
      this.sendError(channel, error);
      return true;
    }
  }

  handleMessage(message) {
    if (message.author.bot) {
      return;
    }
    if (message.channel.type === 'dm') {
      console.log('INFO: DM message received');
      message.reply("There's no DM functionality");
    } else if (message.channel.type === 'text') {
      this.handleCommands(this.setMessageCommands, message, message.content);
    }
  }
  // TODO -> change name / behaviour to match all command
  async handleCommands(commands, message, argText) {
    const cmds = commands.values();
    let res = false;
    let done = false;
    while (!res && !done) {
      const cmd = cmds.next();
      done = cmd.done;
      if (!done) {
        console.log('KEYS', cmd.value.name);
        res = await this.handleCommandMessage(cmd.value, message, argText);
        console.log('RES', res);
      }
    }
    return res;
  }

  async handleCommandMessage(command, message, text) {
    let resParser;
    let i = 0;
    do {
      resParser = command.parser(text, command.name[i]);
      console.log('res ->', resParser, i, command.name[i]);
      i++;
    } while (i <= command.name.length && !resParser.commandCalled);
    console.log('res', resParser);
    if (resParser.commandCalled) {
      console.log(`INFO: command ${command.name} has been call`);
      const permissionLevel = this.getPermission(
        message.author.id,
        message.member.roles.cache,
        message.channel.id
      );
      if (permissionLevel < command.permission) {
        this.sendError(message.channel, 'Insufficient permission');
        return false;
      }
      console.log('ARG', resParser.arg);
      if (resParser.arg === this.helpKey) {
        message.channel.send(command.help.call(command));
        return true;
      }
      let stopHere = await this.handleCommands(
        command.setSubCommand,
        message,
        resParser.arg
      );
      if (stopHere) {
        return true;
      }
      stopHere = await command.action
        .call(command, message, resParser.arg, this.options)
        .catch((error) => {
          this.sendErrorCommand(message.channel, command.name, error);
          return false;
        });
      return stopHere;
    }
    return false;
  }

  sendErrorCommand(channel, nameCommand, error) {
    const msgEmbed = TumultBuildMessages.buildCommandErrorMessage(
      nameCommand,
      error
    );
    console.log(`Error on ${nameCommand}, ${error}`);
    channel.send(msgEmbed);
  }
}

module.exports = TumultController;
