  //const { BehaviorTree, Sequence, Task, SUCCESS, FAILURE } = require('behaviortree');


  export class DialogDriver {

    constructor() {
      // load the list of dialogues
      this.response = "no";
      this.stage = 0;
      this.score = 0;
    }
    //  Called when a Scene shuts down, it may then come back again later
    // (which will invoke the 'start' event) but should be considered dormant.
    // Initialize the dialog modal
    init(player, nPC, emitter, textAssets) {
      this.player = player;
      this.nPC = nPC;
      this.emitter = emitter;
      this.textAssets = textAssets;
      this.type = "finNPC";

    };

    stepOn(qDialog, response) {

      self = this;

      switch (this.stage) {
        case 0: { // Approach dialogue
          const opts = this.nPC.getPreAmble(this.textAssets);
          qDialog.displayYesNo(opts, this);
          this.stage = 1;
          break;
        }

        case 1:
        case 3:
        case 5: { // Ask section
          if (response == "no") {
            this.fin("true", this.textAssets.walkaway, qDialog);
            break;
          }
          qDialog.displaynPCDialogPlayer(this.stage, this.score, this.player);
          qDialog.displaynPCDialogNPC(this.nPC, this.textAssets);

          const opts = this.nPC.getOpts(this.textAssets);
          const gifts = this.player.getObjs("Gift", "g");

          qDialog.displayAsk(opts, gifts, this.textAssets, this.stage, this.nPC.npcName);
          this.stage++;
          break;
        }

        case 2:
        case 4:
        case 6: { // Catch result of Ask
          if (response == "no") {
            this.fin("true", this.textAssets.turndown, qDialog);
            break;

          }
          // The player has chosen to continue and selected an option in
          // response.
          // Dialogue has passed back the mode and the row of the
          // choice in response
          //
          let result = null;

          if (response.choice == "give") {
            let obj = this.player.inventory.find(o => o.name == response.id);
            result = getGiftResponse(obj.properties, self);

            // Delete gift from array
            let ix = this.player.inventory.findIndex(o => o.name == response.id);
            let del = this.player.inventory.splice(ix, 1);
          } else {
            if (this.nPC.npcRel < 3)
              // in dialogue mode
              result = getDiagResponse(response, self);
            else
              result = getRoomResponse(response, self);
          }

          result.text = result.text.replace("+n", self.nPC.npcName);
          if (result.text.includes("+a")) {
            result = processBonusAction(result, self);
          }

          this.score = this.score + result.score;
          qDialog.displaynPCDialogPlayer(this.stage, this.score, this.player);
          qDialog.displaynPCDialogNPC(this.nPC, this.textAssets);

          this.stage++;
          qDialog.displayResult(result);
          break;

        }

        case 7: {
          // Reached the end so see if the player score is big enough to
          //
          const prompt = this.nPC.advance(this.player, this.score, this.textAssets);
          qDialog.displayResult({
            score: -1,
            text: prompt
          });
          this.player.addExperience(this.score);
          qDialog.updateControls(this.player);
          this.stage = 0;
          this.score = 0;
        }

      }

      function getGiftResponse(obj, self) {
        let score = 0;
        if (obj.Lst) {
          self.nPC.npcLst += obj.Lst;
          score = obj.Lst;
        }
        if (obj.Rel) {
          self.nPC.npcLst += obj.Rel;
          score += obj.Rel;
        }
        return {
          score: score,
          text: "+n thanks you for the gift"
        }
      }

      function getDiagResponse(response, self) {
        if (response.effect > self.nPC.npcLst) { // Player over-reached
          self.nPC.processFailure();
          this.stage = 0;
          this.score = 0;
          return {
            score: -1,
            text: self.textAssets.failDialog
          };
        }

        const result = self.nPC.calculateDialogResponse(response.id.effect);

        if (result.ix == -1) {
          return {
            score: 0,
            text: self.textAssets.diagBored
          }
        }

        let resps = null;
        if (response.choice == "say") {
          resps = self.textAssets.nPCResponse.find(rs => rs.rset == response.id.respSet);
        } else {
          resps = self.textAssets.nPCAction.find(rs => rs.rset == response.id.respSet);
        }

        const nText = resps.responses[result.ix];
        return {
          score: result.res,
          text: nText
        };
      }

      function getRoomResponse(response, self) {
        if (response.cor - self.player.skill > self.nPC.npcCor) {
          self.nPC.processFailure();
          self.stage = 0;
          self.score = 0;
          return {
            score: -1,
            text: self.textAssets.failRoom
          };
        }
        const result = response.id.cor * self.player.skill;

        if (response.choice == "say") {
          const resps = self.textAssets.nPCResponse.find(rs => rs.set == response.id.respSet);
        } else {
          const resps = self.textAssets.nPCAction.find(rs => rs.set == response.id.respSet);
        }
        const nText = resps.responses[result];
        return {
          score: result,
          text: nText
        };
      }

      function processBonusAction(result, self) {
        // find the substring
        const str = result.text;
        const act = str.indexOf("+a");
        const newactid = str.substring(act + 3, str.length);
        let newresp = result.text.substring(0, act - 1);
        const action = self.textAssets.playerAction.find(a => a.id == newactid);
        let newact = action.text.replace("+n", self.nPC.npcName);

        newresp += "</p><p>You " + newact.charAt(0).toLowerCase() + newact.slice(1) +
          "<p class='npcResp'>";

        const score = self.nPC.calculateDialogResponse(2);
        let newscore = score.res + result.score;
        const resps = self.textAssets.nPCAction.find(r => r.rset == action.respSet);
        newresp = newresp + resps.responses[score.ix].replace("+n", self.nPC.npcName);
        return {
          text: newresp,
          score: newscore
        }
      }
    }

    fin(diag, prompt, qDialog) {
      this.stage = 0;
      this.score = 0;
      if (diag) {
        qDialog.displayEndDialogue(prompt, this);
      } else {
        this.emitter.emit(this.type, this);
      }
    }

  }

  export class ContainerDriver {
    constructor() {
      // load the list of dialogues
      this.response = "no";
    }

    // Initialize the dialog modal
    init(player, container, emitter) {
      this.player = player;
      this.container = container;
      this.emitter = emitter;
      this.type = "finCon";
      this.stage = 0;

    };


    stepOn(qDialog, response) {

      switch (this.stage) {
        case 0: {
          let prompt = "You approach the " + this.container.name +
            ". It is " + this.container.description.charAt(0).toLowerCase() +
            this.container.description.slice(1) +
            ". Do you want to search the " + this.container.name + "?";

          qDialog.displayYesNo(prompt, this);
          this.stage = 1;
          break;
        }
        case 1: {

          if (response == "no") {
            this.fin(false, "", qDialog);
            break;
          }

          if (this.container.contents) {
            let prompt = this.container.search;
            // There are items to collect
            prompt = prompt + ":";
            let i = 0;
            for (i = 0; i < this.container.contents.length; i++)
              prompt = prompt + "<br>" + this.container.contents[i].name +
              ", " + this.container.contents[i].properties.Description;

            prompt = prompt + "<br><br>Do you want to collect these items?";

            qDialog.displayYesNo(prompt, this);
            this.stage++;
            break;

          } else {
            prompt = this.container.search + " nothing.";
            this.fin(true, prompt, qDialog);
            break;
          }
        }
        case 2: {

          if (response == "no") {
            this.fin(false, "", qDialog);
            break;
          }

          prompt = "These items have been added to your inventory.";
          const self = this;
          this.container.contents.forEach(function(obj) {
            self.player.addObject(obj, obj.name);
            qDialog.addObject(obj, obj.name);
          });

          qDialog.updateStats(this.player);
          this.container.contents = null;

          this.fin(true, prompt, qDialog);
        }
      }
    }

    fin(diag, prompt, qDialog) {
      this.stage = 0;
      if (diag) {
        qDialog.displayEndDialogue(prompt, this);
      } else {
        this.emitter.emit('finCon', this);
      }
    }
  }

  export class ObjectDriver {
    constructor() {
      this.response = "no";
    }

    // Initialize the dialog modal
    init(player, tile, emitter) {
      this.player = player;
      this.tile = tile;
      this.emitter = emitter;
      this.stage = 0;
      this.type = "finObj";

    };

    stepOn(qDialog, response) {

      if (this.tile.properties.Class == "Door") {
        this.stepOnDoor(qDialog, response);
      } else {
        this.stepOnPickup(qDialog, response);
      }
    }

    stepOnPickup(qDialog, response) {

      switch (this.stage) {
        case 0: {
          let desc = this.tile.properties.Description;
          let prompt = "You find a " + this.tile.getTileData().type +
            ". It is " + desc.charAt(0).toLowerCase() +
            desc.slice(1) +
            ". Do you want to pick up the " + this.tile.getTileData().type + "?";

          qDialog.displayYesNo(prompt, this);
          this.stage = 1;
          break;
        }
        case 1: {

          if (response == "no") {
            this.fin(false, "", qDialog);
            break;
          }

          prompt = "The " + this.tile.getTileData().type + " has been added to your inventory.";
          const self = this;

          self.player.addObject(this.tile, this.tile.getTileData().type);
          qDialog.addObject(this.tile, this.tile.getTileData().type);
          qDialog.updateStats(this.player);

          this.tile.resetCollision(true);
          this.tile.setVisible(false);

          this.fin(true, prompt, qDialog);
        }
      }
    }

    stepOnDoor(qDialog, response) {
      switch (this.stage) {
        case 0: {
          // Check if player has the key
          const pKey = this.player.inventory.find(obj => obj.properties.DoorId == this.tile.properties.DoorId);
          if (pKey) {
            let prompt = "The " + pKey.name + " will fit the lock of the " + this.tile.getTileData().type +
              ". Do you want to open the " + this.tile.getTileData().type + "?";
            qDialog.displayYesNo(prompt, this);
            this.stage = 1;
            break;
          } else {
            let prompt = "You do not have a key to open the " + this.tile.getTileData().type;
            this.fin(true, prompt, qDialog);
            break;
          }
        }
        case 1: {

          if (response == "no") {
            this.fin(false, "", qDialog);
            break;
          }

          prompt = "You open the " + this.tile.getTileData().type + ".";

          let ix = this.player.inventory.findIndex(obj => obj.properties.DoorId == this.tile.properties.DoorId);
          this.player.inventory.splice(ix, 1);

          console.log(this.tile);

          let tmLayer = this.tile.layer.tilemapLayer;
          const doorId = this.tile.properties.DoorId;

          tmLayer.forEachTile(removeDoor, this, this.tile.x - 2, this.tile.y - 2, 5, 5)

          this.fin(true, prompt, qDialog);

          function removeDoor(t) {
            console.log(t);
            if (t.properties.DoorId == doorId) {
              t.resetCollision(true);
              t.setVisible(false);
            }
          }
        }
      }
    }

    fin(diag, prompt, qDialog) {
      this.stage = 0;
      if (diag) {
        qDialog.displayEndDialogue(prompt, this);
      } else {
        this.emitter.emit('finObj', this);
      }
    }

  }
