//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//vim:set et sts=4 ts=4 tw=80:
//This Source Code Form is subject to the terms of the MIT License.
//If a copy of the ML was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/MIT
//author: JackRed <jackred@tuta.io>
'use string';

const TumultParser = require('./TumultParser');
const TumultDiscordUtility = require('./TumultDiscordUtility');

class AlanaCommand {
  constructor(name, action,
							{
								permission = 0,
								subCommand = [],
								generalHelp = '',
								help = '',
								parser = TumultParser.defaultParser
							} = {}) {
		//permission=0, subCommand=[],
		//				generalHelp='', help='',
		//			parser=TumultParser.defaultParser) {
		this.name = name; // string
    this.action = action; // function
    this.subCommand = TumultDiscordUtility.arrayToCollectionCommand(subCommand); // array of Command
    this.generalHelp = (generalHelp === '') ? this.defaultGeneralHelp : generalHelp; // function > string
    this.help = (help === '') ? this.defaultHelp : help; // function > string
    this.permission = permission; // int
    this.parser = parser; // fuction -> [string]
  }
  // todo: add a help function for `helpXXX`
  // that return `generalHelp` + `help`
  defaultHelp() {
    let msg = this.generalHelp();
    for (let command in this.subCommand) {
      msg +='  ' + this.subCommand[command].generalHelp();
    }
    return msg;
  }

  defaultGeneralHelp() {
    return '';
  }

  listSubCommand(){
    return Object.keys(this.subCommand);
  }
}

module.exports = AlanaCommand;
