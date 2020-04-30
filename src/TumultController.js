//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
"use strict";

const { Client } = require("discord.js");
const TumultDiscordUtility = require("./TumultDiscordUtility");
const TumultBuildMessages = require("./TumultBuildMesages.js");
const TumultCommand = require("./TumultCommand.js");

class TumultController {
  constructor(
    token,
    commands,
    config,
    permission,
    { options = {}, partials = [], activity } = {}
  ) {
    this.createClient(token, partials, activity);
    this.commands = TumultDiscordUtility.arrayToCollectionCommand(commands);
    // this.reactions = reaction;
    this.options = options;
    this.config = config;
    this.permission = permission;
    this.createHandler();
  }

  createClient(token, partials, activity = "mention me + help") {
    this.client = new Client({ partials });
    this.client.on("ready", () => {
      console.log("Starting!");
      this.client.user.setActivity(activity);
    });
    this.client
      .login(token)
      .then(() => console.log("We're in !"))
      .catch((err) => console.log(err));
  }

  addCommands(commands, path = []) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }
    for (let command of commands) {
      if (!(command instanceof TumultCommand)) {
        throw "Argument commands should be an instance of TumultCommand, or an array of TumultCommand";
      }
    }
    if (!Array.isArray(path)) {
      throw "Path need to be an array";
    }
    let cmd = this.commands;
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
  }

  removeCommands(commandsName, path = []) {
    if (!Array.isArray(commandsName)) {
      commandsName = [commandsName];
    }
    if (!Array.isArray(path)) {
      throw "Path need to be an array";
    }
    if (typeof path === "string") {
      path = [path];
    }
    let cmd = this.commands;
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
        .replace(/,/, ", ")} are not valid commands`;
    }
    for (let commandName of commandsName) {
      cmd.delete(commandName);
      console.log(`INFO: command ${commandName} removed`);
    }
  }

  createHandler() {
    this.client.on("message", this.handleMessage.bind(this));
    // this.client.on("guildMemberSpeaking", this.handleVocalMessage.bind(this));
    // this.client.on("messageReactionAdd", this.handleReactionAdd.bind(this));
    // this.client.on("messageReactionRemove", this.handleReaction.bind(this));
  }

  checkPermission(id, level, key) {
    return this.permission[level][key].some((d) => d === id);
  }

  checkRolesPermission(roles, level) {
    return roles.some((r) => this.checkPermission(r.id, level, "roles"));
  }

  checkLevelMessage(authorID, roles, channelID, level) {
    return (
      this.checkPermission(authorID, level, "users") ||
      this.checkRolesPermission(roles, level) ||
      this.checkPermission(channelID, level, "channels")
    );
  }

  getPermission(authorID, roles, channelID) {
    if (this.checkLevelMessage(authorID, roles, channelID, "blacklist")) {
      return this.permission.level.blacklist;
    }
    if (this.checkLevelMessage(authorID, roles, channelID, "whitelist")) {
      return this.permission.level.whitelist;
    }
    if (this.checkLevelMessage(authorID, roles, channelID, "admins")) {
      return this.permission.level.admins;
    }
    return this.permission.level.default;
  }

  async handleReactionAdd() { } //}reaction, user) { }

  async handleVocalMessage() { } //}member, speaking) { }

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
    if (message.channel.type === "dm") {
      console.log("INFO: DM message received");
      message.reply("There's no DM functionality");
    } else if (message.channel.type === "text") {
      this.handleCommands(this.commands, message, message.content);
    }
  }

  async handleCommands(commands, message, argText) {
    const keys = commands.keys();
    let done = false;
    let res = false;
    while (!done && !res) {
      const key = keys.next();
      console.log("KEY", key);
      done = key.done;
      if (!done) {
        res = await this.handleCommandMessage(
          commands.get(key.value),
          message,
          argText
        );
        console.log("RES", res);
      }
    }
    return res;
  }

  async handleCommandMessage(command, message, text) {
    const resParser = command.parser(text, command.name);
    console.log("res", resParser);
    if (resParser.commandCalled) {
      console.log(`INFO: command ${command.name} has been call`);
      const permissionLevel = this.getPermission(
        message.author.id,
        message.member.roles.cache,
        message.channel.id
      );
      if (permissionLevel < command.permission) {
        this.sendError(message.channel, "Insufficient permission");
        return false;
      }
      console.log("ARG", resParser.arg);
      if (resParser.arg === this.config.help) {
        message.channel.send(command.help.call(command));
        return true;
      }
      let stopHere = await this.handleCommands(
        command.subCommand,
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
      return true;
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
