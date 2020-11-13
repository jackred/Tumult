//-*- Mode: js2; js2-basic-offset: 2;  tab-width: 2; -*-
//This Source Code Form is subject to the terms of the Apache 2.0 License.
//If a copy of the A2 was not distributed with this
//file, You can obtain one at https://opensource.org/licenses/Apache-2.0

//author: JackRed <jackred@tuta.io>
'use strict';

const TumultSet = require('./TumultSet');

/**
 * Structures used
 * @param {Object} options
 * @param {Object} options.blacklist
 * @param {String} options.everyone
 * @param {...Object} options.rights
 */
class TumultPermission {
  constructor({ blacklist = {}, everyone = 'everyone', ...rights } = {}) {
    const handler = {
      set: (target, prop, value) => {
        let tmpRight = new TumultRight(value);
        tmpRight.permission = this;
        const res = Reflect.set(target, prop, tmpRight);
        this.updateCachedSet();
        return res;
      },
      deleteProperty: (target, prop) => {
        if (prop in target) {
          for (let i in target) {
            if (target[i].otherRight.has(prop)) {
              target[i].otherRight.delete.call({ __cache: false }, prop);
            }
          }
          let res = delete target[prop];
          this.updateCachedSet();
          return res;
        }
        return false;
      },
    };
    let tmpRights = { blacklist: new TumultRight(blacklist) };
    tmpRights.blacklist.permission = this;
    for (let key in rights) {
      tmpRights[key] = new TumultRight(rights[key]);
      tmpRights[key].permission = this;
    }
    this.rights = new Proxy(tmpRights, handler);
    this.everyone = everyone;
    this.updateCachedSet();
  }
  isInPermission() {}

  isBlacklist(user, roles, channel, discordPermission) {}

  isWhitelist(permission, user, roles, channel, discordPermission) {}

  isAllowed(rights, user, roles, channel, discordPermission) {
    let allowed = !this.isBlacklist(user, roles, channel, discordPermission);
    if (!allowed) {
      return allowed;
    }
    allowed =
      rights.includes(this.everyone) ||
      this.isWhitelist(rights, user, roles, channel, discordPermission);
    return allowed;
  }

  getDerivedSet(rights) {
    let allRight = new TumultSet([rights]);
    let queue = new TumultSet(rights.otherRight);
    for (let right of queue) {
      allRight.add(this.rights[right]);
      queue.add(...this.rights[right].otherRight);
    }
    return allRight;
  }

  updateCachedSet() {
    this._cachedRights = {};
    for (let right in this.rights) {
      const derivedSet = this.getDerivedSet(this.rights[right]);
      const derivedRight = TumultRight.union(...derivedSet);
      this._cachedRights[right] = { derivedSet, derivedRight };
    }
  }

  updateCachedRight() {
    for (let right in this.rights) {
      const derivedRight = TumultRight.union(
        ...this._cachedRights[right].derivedSet
      );
      this._cachedRights[right].derivedRight = derivedRight;
    }
  }
}

/**
 * Structures used
 * @param {Object} options
 * @param {Array} options.users
 * @param {Array} options.roles
 * @param {Array} options.channels
 * @param {Array} options.discordPermission
 * @param {Array} options.otherRight
 */
class TumultRight {
  constructor({
    users = [],
    roles = [],
    channels = [],
    discordPermissions = [],
    otherRight = [],
  } = []) {
    this.createSet('_users', users);
    this.createSet('_roles', roles);
    this.createSet('_channels', channels);
    this.createSet('_discordPermissions', discordPermissions);
    this.createSet('_otherRight', otherRight);
    this._rightName = [
      '_users',
      '_roles',
      '_channels',
      '_discordPermissions',
      '_otherRight',
    ];
    this.createSetters();
  }

  // should if it's instance, but circular dependencies, howto? TODO
  set permission(permission) {
    if (permission instanceof TumultPermission) {
      this._permission = permission;
    } else {
      throw 'permission should be an instance of Tumult.Permission';
    }
  }

  get permission() {
    return this._permission;
  }

  updateCachedRightOfPermission() {
    let msg = 'false';
    if (this._permission !== undefined) {
      this._permission.updateCachedRight();
      msg = ' true';
    }
    //console.log("updateRight", msg);
  }

  updateCachedSetOfPermission() {
    let msg = 'false';
    if (this._permission !== undefined) {
      this._permission.updateCachedSet();
      msg = ' true';
    }
    //console.log("updateSet", msg);
  }

  clear() {
    for (let uset of this._rightName) {
      this[uset].clear();
    }
    this.updateCachedSetOfPermission();
  }

  createSet(propertyName, value) {
    const tmp = new TumultSet(value);
    const updateFunction =
      propertyName === '_otherRight'
        ? this.updateCachedSetOfPermission
        : this.updateCachedRightOfPermission;
    tmp.updateFunction = updateFunction.bind(this);
    const handler = {
      get: function (target, name, receiver) {
        if (name in target.__proto__) {
          // from https://stackoverflow.com/questions/43236329/why-is-proxy-to-a-map-object-in-es2015-not-working
          let ret = Reflect.get(target, name);
          if (typeof ret === 'function') {
            ret = ret.bind(target);
            if (
              ['add', 'delete', 'clear'].includes(name) &&
              this.__cache !== false
            ) {
              return (...args) => {
                let res = ret(...args);
                target.updateFunction();
                return res;
              };
            }
          }
          return ret;
        } else {
          return Reflect.get(target, name, receiver);
        }
      },
    };
    this[propertyName] = new Proxy(tmp, handler);
  }

  setElt(toSet, value) {
    this.createSet(toSet, value);
    this[toSet].updateFunction();
  }

  getElt(toGet) {
    return this[toGet];
  }

  createSetters() {
    for (let property in this) {
      Object.defineProperty(this, property.substring(1), {
        set: function (value) {
          this.setElt(property, value);
        },
        get: function () {
          return this.getElt(property);
        },
      });
    }
  }

  // to update Right
  concat(...rights) {
    for (let right of rights) {
      const tmp = new TumultRight(right);
      for (let tSet of tmp._rightName) {
        this[tSet].add.call({ __cache: false }, ...tmp[tSet]);
      }
    }
    this.updateCachedSetOfPermission();
  }

  static union(...rights) {
    //
    let newRight = new TumultRight();
    newRight.concat(...rights);
    return newRight;
  }
}

module.exports = { TumultPermission, TumultRight };
//
