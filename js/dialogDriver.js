  //const { BehaviorTree, Sequence, Task, SUCCESS, FAILURE } = require('behaviortree');


  export class DialogDriver {

    constructor() {
      // load the list of dialogues
      this.response = "no";
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

      switch (this.player.dialogStage) {
        case 0: { // Approach dialogue
          const opts = this.nPC.getPreAmble(this.textAssets);
          qDialog.displayYesNo(opts, this);
          this.player.dialogStage = 1;
          this.player.score = 0;
          break;
        }

        case 1:
        case 3:
        case 5: { // Ask section
          if (response == "no") {
            this.fin("true",this.textAssets.walkaway, qDialog);
            break;
          }

          const opts = this.nPC.getOpts(this.textAssets);
          const stats = this.nPC.getStats(this.textAssets);

          const playerText = "Name: " + this.player.name + "<br>" +
            "Turn: " + (this.player.dialogStage+1)/2 + "<br>" +
            "Score: " + this.player.score;

          qDialog.displayAsk(opts, stats, playerText, this.textAssets, this.player.dialogStage);
          this.player.dialogStage++;
          break;
        }

        case 2:
        case 4:
        case 6: { // Catch result of Ask
          if (response == "no") {
            this.fin("true",this.textAssets.turndown, qDialog);
            break;

          }
          // The player has chosen to continue and selected an option in
          // response.
          // Dialogue has passed back the mode and the row of the
          // choice in response
          //

          let result = null;

          if (this.nPC.npcRel < 3)
            // in dialogue mode}
            result = getDiagResponse(response, self);
          else
            result = getRoomResponse(response, self);

          this.player.score = this.player.score + result.score;
          qDialog.displayResult(result);
          this.player.dialogStage++;
          break;

        }

        case 7: {
          // Reached the end so see if the player score is big enough to
          //
          const prompt = this.nPC.advance(this.player, this.textAssets);
          qDialog.displayResult(
            {
              score: -1,
              text: prompt
            } );
            this.player.dialogStage = 0;
            this.player.score = 0;
        }

      }

      function getDiagResponse(response, self) {
        if (response.effect > self.nPC.npcLst) {  // Player over-reached
          self.nPC.processFailure();
          this.player.dialogStage = 0;
          this.player.score = 0;
          return {
            score: -1,
            text: self.textAssets.failDialog
          };
        }
        // Passed so calculate score

        const result = (self.nPC.npcLst + 1) * (self.nPC.npcLst == response.id.effect) +
          self.nPC.npcLst * (self.nPC.npcLst - 1 == response.id.effect);

        let resps = null;
        if (response.choice == "say") {
          resps = self.textAssets.nPCResponse.find(rs => rs.rset == response.id.respSet);
        }
        else {
          resps = self.textAssets.nPCAction.find(rs => rs.rset == response.id.respSet);
        }

        console.log(resps);
        const nText = resps.responses[result].replace("+n", self.nPC.npcName);
        return {
          score: result,
          text: nText
        };
      }

      function getRoomResponse(response, self) {
        if (response.cor - self.player.skill > self.nPC.npcCor) {
          self.nPC.processFailure();
          this.player.dialogStage = 0;
          this.player.score = 0;
          return {
            score: -1,
            text: self.textAssets.failRoom
          };
        }
        const result = response.id.cor * self.player.skill;

        if (response.choice == "say") {
          const resps = self.textAssets.nPCResponse.find(rs => rs.set == response.id.respSet);}
        else {
          const resps = self.textAssets.nPCAction.find(rs => rs.set == response.id.respSet);}
        const nText = resps.responses[result].text.replace("+n", self.nPC.npcName);
        return {
          score: result,
          text: nText
        };
      }
    }

    fin(diag, prompt, qDialog) {
      this.player.dialogStage = 0;
      this.player.score = 0;
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

    };


    stepOn(qDialog, response) {

      switch (this.player.dialogStage) {
        case 0: {
          let prompt = "You approach the " + this.container.name +
            ". It is " + this.container.description.charAt(0).toLowerCase() +
            this.container.description.slice(1) +
            ". Do you want to search the " + this.container.name + "?";

          qDialog.displayYesNo(prompt, this);
          this.player.dialogStage = 1;
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
              ", " + this.container.contents[i].description;

            prompt = prompt + "<br><br>Do you want to collect these items?";

            qDialog.displayYesNo(prompt, this);
            this.player.dialogStage++;
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
          this.container.contents.forEach(function(row) {
            self.player.addInventory(row);
            qDialog.addEnchantments(row);
          });

          qDialog.updateStats(this.player);
          this.container.contents = null;

          this.fin(true, prompt, qDialog);
        }
      }
    }

    fin(diag, prompt, qDialog) {
      this.player.dialogStage = 0;
      if (diag) {
        qDialog.displayEndDialogue(prompt, this);
      } else {
        this.emitter.emit('finCon', this);
      }
    }
  }
