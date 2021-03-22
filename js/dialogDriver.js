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
          qDialog.displayYesNo( opts, this);
          this.player.dialogStage = 1;
          this.player.score = 0;
        break;
        }

        case 1:
        case 3:
        case 5: { // Ask section
          if (response == "no") {
            this.fin(true, this.textAssets.walkaway, qDialog);
            break;
          }

          const opts = this.nPC.getOpts(this.textAssets);
          const stats = this.nPC.getStats(this.textAssets);
          qDialog.displayAsk(opts, stats, "Name: " + this.player.name);
          this.player.dialogStage++;
          break;
          }

          case 2:
          case 4:
          case 6:  { // Catch result of Ask
            if (response == "no") {
              this.fin(true, this.textAssets.turndown, qDialog);
              break;
            }
            // The player has chosen to continue and selected an option in
            // response.

            if (this.nPC.Rel < 3)
            {// in dialogue mode
                if (response.effect > this.nPC.npcLst) { // Player over-reached
                  const prompt = this.nPC.processFailure("dialogue", this.textAssets);
                  this.fin(true, prompt, qDialog);
                  break;
                }
                // Passed so update player score

                const result = (this.nPC.npcLst + 1) * (this.nPC.npclst == response.effect) +
                this.nPC.npcLst * (this.nPC.npclst - 1 == response.effect);
                const prompt = this.nPC.getResult(result, this.textAssets);
                qDialog.displayResult(prompt);
                this.player.score = this.player.score + result;
                this.player.dialogstage++;
                break;
            }
            // Room mode
            if (this.response.cor - this.player.skill > this.nPC.npcCor) {
              const prompt = this.nPC.processFailure("room", this.textAssets);
              this.fin(true, prompt, qDialog);
              break;
            }

            const result = response.cor * this.player.skill;
            const prompt = this.nPC.getResult(result, this.textAssets);
            qDialog.displayResult(prompt);
            this.player.score = this.player.score + result;
            this.player.dialogstage++;
            break;
            }
            case 7: {
              // Reached the end so see if the player score is big enough to
              //
              const prompt = this.nPC.advance(this.player.score);
              this.fin(true, prompt, qDialog)
            }

        }
      }

    fin(diag, prompt, qDialog) {
      this.player.dialogStage = 0;
      this.player.score = 0;
      if (diag) {
        qDialog.displayEndDialogue(prompt, this);
      } else {
        this.emitter.emit(this.type,this);
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
      this.emitter.emit('finCon',this);
      }
    }
  }
