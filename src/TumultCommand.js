//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use string';

const TumultParser = require('./TumultParser');
const TumultBuildMessages = require('./TumultBuildMesages');
const TumultDiscordUtility = require('./TumultDiscordUtility');

/**
 * A command that will be called if it's name is send as a message
 * TODO -> Multiple class for command, derived from base command. Message / reaction / etc
 */
class TumultCommand {
  /**
   * @param {String|Array<String>} name The names of the command, which will be used to call it
   * @param {Function} action The function the command will execute when called. TODO -> not mandatory. Make Prefix Command and Action Command
   * @param {Object} [options={}] Configuration options for the commands
   * @param {Number} [options.permission=0]
   * @param {Array<TumultCommand>} [options.subCommand=[]] The sub commands that will be matched against the rest of the messages if this command is called
   * @param {String|Function} [options.generalHelp=""] The message that will be returned when someone all the help subcommand on this command
   * @param {String|Function} [options.help=""] The message that will be returned when being called by the root help command
   * @param {Function} [options.parser=TumultParser.defaultParser] The function used to parse the messages and check if this command should be called
   */
  constructor(
    name,
    action,
    {
      permission = 0,
      subCommand = [],
      generalHelp = '',
      help = '',
      parser = TumultParser.defaultParser,
    } = {}
  ) {
    //permission=0, subCommand=[],
    //				generalHelp='', help='',
    //			parser=TumultParser.defaultParser) {
    /**
     * The name of the command, which will be used to call it
     * @type {String}
     */
    if (typeof name === 'string') {
      name = [name];
    }
    this.name = name; // string
    this.action = action; // function
    this.subCommand = TumultDiscordUtility.arrayToCollectionCommand(subCommand); // array of Command
    this.setSubCommand = new Set(this.subCommand.values());
    this.generalHelp = this.createHelp(generalHelp);
    this.help = this.createHelp(help, this.defaultBuildHelp); // function > string
    this.permission = permission; // int
    this.parser = parser; // fuction -> [string]
  }

  /** @function help
   * @description Return the help messages. Usually it containes description of the argument, how to use the command and its sub command. TODO -> Getter
   * @memberof TumultCommand
   * @instance
   * @return {String|MessageEmbed}
   */
  // help and general help need to be clearer
  // there's a build and other
  // need constant // standard
  defaultBuildHelp({ color } = {}) {
    const help = this.generalHelp();
    let subHelps = [];
    for (let val of this.setSubCommand) {
      subHelps.push({ name: val.name, value: val.generalHelp() });
    }
    const msg = TumultBuildMessages.buildHelpMessage(this.name, help, {
      subHelps,
      color,
    });
    return msg;
  }

  /** @function generalHelp
   * @description Return the general help message, without description related to argument. Usually it contains information about what the command does. TODO -> default used for error TODO -> Getter
   * @memberof TumultCommand
   * @instance
   * @return {String|MessageEmbed}
   */

  defaultBuildGeneralHelp({ color } = {}) {
    const msg = TumultBuildMessages.buildHelpMessage(
      this.name,
      this.generalHelp(),
      { color }
    );
    return msg;
  }

  createHelp(toSet, defaultFn = () => '') {
    let result;
    switch (typeof toSet) {
      case 'string':
        if (toSet === '') {
          result = defaultFn;
        } else {
          result = () => toSet;
        }
        break;
      case 'function':
        result = toSet;
        break;
      default:
        throw 'Wrong parameters given as command constructor. Help parameter should be either string or function';
    }
    return result;
  }

  /**
   * List all subCommands name
   * @returns {Array<String>}
   */
  listSubCommand() {
    return Object.keys(this.subCommand);
  }
}

module.exports = TumultCommand;
