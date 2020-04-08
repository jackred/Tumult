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
    this.generalHelp = this.createHelp(generalHelp, this.defaultGeneralHelp);
    this.help = this.createHelp(help, this.defaultHelp); // function > string
    this.permission = permission; // int
    this.parser = parser; // fuction -> [string]
  }
  // todo: add a help function for `helpXXX`
  // that return `generalHelp` + `help`
  defaultHelp() {
    let msg = this.generalHelp();
    msg += this.subCommand.reduce((acc, val) => acc + '\n' + val.generalHelp(), '');
    return msg;
  }

  defaultGeneralHelp() {
		return '';
	}

	createHelp(toSet, defaultFn) {
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

		listSubCommand(){
			return Object.keys(this.subCommand);
		}
	}

	module.exports = AlanaCommand;
