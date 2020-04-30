//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
"use string";

const TumultParser = require("./TumultParser");
const TumultBuildMessages = require("./TumultBuildMesages.js");
const TumultDiscordUtility = require("./TumultDiscordUtility");

class TumultCommand {
  constructor(
    name,
    action,
    {
      permission = 0,
      subCommand = [],
      generalHelp = "",
      help = "",
      parser = TumultParser.defaultParser,
    } = {}
  ) {
    //permission=0, subCommand=[],
    //				generalHelp='', help='',
    //			parser=TumultParser.defaultParser) {
    this.name = name; // string
    this.action = action; // function
    this.subCommand = TumultDiscordUtility.arrayToCollectionCommand(subCommand); // array of Command
    this.generalHelp = this.createHelp(generalHelp);
    this.help = this.createHelp(help, this.defaultBuildHelp); // function > string
    this.permission = permission; // int
    this.parser = parser; // fuction -> [string]
  }

  // help and general help need to be clearer
  // there's a build and other
  // need constant // standard
  defaultBuildHelp({ color } = {}) {
    const help = this.generalHelp();
    const subHelps = this.subCommand.map((val) => {
      return { name: val.name, value: val.generalHelp() };
    });
    const msg = TumultBuildMessages.buildHelpMessage(this.name, help, {
      subHelps,
      color,
    });
    return msg;
  }

  defaultBuildGeneralHelp({ color } = {}) {
    const msg = TumultBuildMessages.buildHelpMessage(
      this.name,
      this.generalHelp(),
      { color }
    );
    return msg;
  }

  createHelp(toSet, defaultFn = () => "") {
    let result;
    switch (typeof toSet) {
      case "string":
        if (toSet === "") {
          result = defaultFn;
        } else {
          result = () => toSet;
        }
        break;
      case "function":
        result = toSet;
        break;
      default:
        throw "Wrong parameters given as command constructor. Help parameter should be either string or function";
    }
    return result;
  }

  listSubCommand() {
    return Object.keys(this.subCommand);
  }
}

module.exports = TumultCommand;
