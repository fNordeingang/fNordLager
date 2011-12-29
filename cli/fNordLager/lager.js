var rl = require('readline'),
    _ = require('underscore'),
    fs = require('fs');

var i = rl.createInterface(process.stdin, process.stdout, null);

(function ( global ) {

  /**
   * Enum for the different modes
   * @enum {number}
   */
  var Mode = {
    Add     : 0,
    Sell    : 1,
    Load    : 2,
    Command : 3,
    Show    : 4
  };

  /**
   * List of things, will be filled be fNordLager.deserializeThings
   * @typedef {Array.<fNordLager.Thing>}
   * @type {fNordLager.Thing}
   */
  var thingList;

  /**
   * List of things, will be filled be fNordLager.deserializeUsers
   * @typedef {Array.<fNordLager.User>}
   * @type {fNordLager.User}
   */
  var userList;

  /**
   * The current {Mode}
   * @type {number} Must match {Mode}
   */
  var currentMode = Mode.Command;

  /**
   * The current {fNordLager.User}
   * @type {fNordLager.User}
   */
  var currentUser;

  /**
   * Main fNordLager module
   */
  var fNordLager = (function () {
    return {

      /**
       * The Thing Model
       * @param {object|undefined} data
       * @param {string|undefined} data.name the name of the {fNordLager.Thing}
       * @param {number|undefined} data.quantity the quantity of the {fNordLager.Thing}
       * @param {string|undefined} data.barcode the barcode of the {fNordLager.Thing}
       * @param {number|undefined} data.price the price of the {fNordLager.Thing}
       * @param {number|undefined} data.memberPrice the member price of the {fNordLager.Thing}
       */
      Thing: function ( data ) {
        //Build the Thing object
        return {
          name        : data.name         || "unnamed",
          quantity    : data.quantity     || 0,
          barcode     : data.barcode      || "unknown",
          price       : data.price        || 99.9,
          memberPrice : data.memberPrice  || 99.9
        };
      },

      /**
       * The User Model
       * @param {object} data
       * @param {string|undefined} data.name the name of the user
       * @param {number|undefined} data.balance the balance of the user
       * @param {boolean|undefined} data.member true if the user is a fNord member
       */
      User: function ( data ) {
        //Build the User object
        return {
          name    : data.name     || "unknown",
          balance : data.balance  || 0,
          history : data.history  || [],
          member  : data.member   || false
        };
      },

      /**
       * Get the name of the given {Mode}
       * @param {number} mode mode number
       * @type {string} the name of the {Mode}
       */
      getModeName: function ( mode ) {
        var modeName = "Command";
        _.each(Mode, function ( k, v ) {
          if ( mode === k ) modeName = v;
        });
        return modeName;
      },

      /**
       * Set the {Mode}
       * @param {Array.<string>} input the input array
       */
      setMode: function ( input ) {
        var cmd = input[0];
        fNordLager[cmd+"Command"](input);
      },

      /**
       * The set command
       * @param input
       */
      setCommand: function ( input ) {
        if ( input[1] === "mode" ) {
          if ( input[2] === "Sell" && !currentUser ) {
            console.log("please set the user first with 'set user <username>'");
          }
          else {
            currentMode = Mode[input[2]];
          }
        }
        else if ( input[1] === "user" ) {
          currentUser = fNordLager.findUser(input[2]);
        }
      },

      /**
       * The id command, prints out the current user
       */
      idCommand: function () {
        if ( currentUser ) {
          console.log(currentUser);
        }
        else {
          console.log("please set the user first with 'set user <username>'");
        }
      },

      /**
       * The help command, prints out the README
       */
      helpCommand: function () {
        fs.readFile('README.markdown', function (err, data) {
          console.log(data.toString());
        });
      },

      /**
       * The reload command, reloads the database
       */
      reloadCommand: function () {
        fNordLager.deserializeUsers();
        fNordLager.deserializeThings();
      },

      /**
       * CommandMode function
       * This decides what to do with all different kinds of user input
       */
      commandMode: function () {
        var modeName = fNordLager.getModeName(currentMode);
        if( currentUser ) {
          modeName += "(" + currentUser.name + ")";
        }
        var prompt = "$["+modeName+"]>";
        i.setPrompt(prompt, prompt.length+1);
        i.question(prompt + " ", function ( answer ) {
          var input = answer.split(" ");
          var command = input[0];
          var barcode;
          var qty;

          if ( command.match(/quit|q/) ) {
            i.close();
            process.stdin.destroy();
            return;
          }
          else if ( command.match(/exit/) ) {
            currentUser = null;
            currentMode = Mode.Command;
          }

          if( currentMode === Mode.Command ) {
            fNordLager.setMode(input);
          }
          else if ( command === "set" ) {
            fNordLager.setMode(input);
          }
          else if ( currentMode === Mode.Add ) {
            barcode = command;
            qty = 1;

            if ( input.length === 2 ) {
              qty = command;
              barcode = input[1];
            }

            console.log(fNordLager.thingAddSell(barcode, qty));
          }
          else if ( currentMode === Mode.Sell ) {
            barcode = command;
            qty = -1;

            if ( input.length === 2 ) {
              qty = -command;
              barcode = input[1];
            }

            thing = fNordLager.thingAddSell(barcode, qty);

            if ( !currentUser.history ) {
              currentUser.history = [];
            }

            currentUser.history.push(thing);

            fNordLager.serializeUsers();

            console.log(thing);
            console.log(currentUser);
          }
          else if ( currentMode === Mode.Load ) {
            currentUser = fNordLager.findUser(command);
            if(currentUser) {
              currentUser.balance = parseFloat(currentUser.balance) + parseFloat(input[1]);
              fNordLager.serializeUsers();
              console.log(currentUser);
            }
            else {
              console.log("user not found %s", command);
            }
          }
          else if ( currentMode === Mode.Show ) {
            var thing = fNordLager.findThing(command);
            if ( command === "all" ) {
              _.each(thingList, function (_thing) {
                console.log(_thing);
              });
            }
            else if ( thing ) {
              console.log(thing);
            }
            else {
              console.log("not found");
            }
          }

          fNordLager.commandMode();
        });
      },

      /**
       * Add or subtract a given quantity to/from a Thing
       * @type {fNordLager.Thing} the found and maybe modified {fNordLager.Thing}
       * @param {string} barcode of the {fNordLager.Thing}
       * @param {number} qty the quantity to add/subtract
       */
      thingAddSell: function ( barcode, qty ) {
        var thing = fNordLager.findThing(barcode);

        if ( thing.quantity <= 0 && qty < 0 ) {
          return thing;
        }

        thing.quantity = parseInt(thing.quantity, 10) + parseInt(qty, 10);

        fNordLager.serializeThings();

        if( qty < 0 && currentUser ) {
          var price = currentUser.member && (thing.memberPrice > 0) ? thing.memberPrice : thing.price;
          currentUser.balance = parseFloat(currentUser.balance) - parseFloat(price);
          fNordLager.serializeUsers();
        }

        return thing;
      },

      /**
       * Find a {fNordLager.Thing} by its barcode
       * @type {fNordLager.Thing}
       * @param {string} barcode the barcode to search for
       */
      findThing: function (barcode) {
        /**
         * The found Thing, null if not found
         * @type {?fNordLager.Thing}
         */
        var thing = null;

        /** Search for the given barcode */
        _.each(thingList, function ( v ) {
          if ( barcode === v.barcode ) thing = v;
        });

        return thing;
      },

      /**
       * Find a {fNordLager.User} by its name
       * @type {?fNordLager.User}
       * @param {string} name the name to search for
       */
      findUser: function (name) {
        /**
         * The found User, null if not found
         * @type {?fNordLager.User}
         */
        var user = null;

        /** Search for the given username */
        _.each(userList, function ( v ) {
          if ( name === v.name ) user = v;
        });

        return user;
      },

      /**
       * Serialize the {thingList} to filesystem
       */
      serializeThings: function () {
        fs.writeFile("things.json", JSON.stringify(thingList));
      },

      /**
       * deserialize the {thingList} from filesystem
       */
      deserializeThings: function () {
        fs.readFile('things.json', function (err, data) {
          thingList = JSON.parse(data);
        });
      },

      /**
       * Serialize the {userList} to filesystem
       */
      serializeUsers: function () {
        fs.writeFile("users.json", JSON.stringify(userList));
      },

      /**
       * deserialize the {userList} from filesystem
       */
      deserializeUsers: function () {
        fs.readFile('users.json', function (err, data) {
          userList = JSON.parse(data);
        });
      }
    }
  })();

  //deserialize {thingList} and {userList}
  fNordLager.deserializeThings();
  fNordLager.deserializeUsers();

  //run the start command
  fNordLager.commandMode();

  global.fNordLager = fNordLager;

})(global);

