  //const { BehaviorTree, Sequence, Task, SUCCESS, FAILURE } = require('behaviortree');


  export class DialogDriver {

    constructor() {
      // load the list of dialogues
      this.response = "no";
    }
    //  Called when a Scene shuts down, it may then come back again later
    // (which will invoke the 'start' event) but should be considered dormant.
    shutdown() {

    }

    // Initialize the dialog modal
    /*  init(qDialog, player, nPC, textAssets) {

        let bb = {
          player: player,
          nPC: nPC,
          stage: 0,
          response: "no"
        };

        BehaviorTree.register("preamble", new Task({

          run: function(bb) {
            if (bb.player.dialogStatus > 0) return SUCCESS;

            const opts = bb.nPC.getPreAmble(textAssets);
            qDialog.displayPreamble(bb.nPC, opts);
            bb.player.dialogStatus = 1;
            return FAILURE;
          }
        }));


        BehaviorTree.register("ask", new Task({
          run: function(bb) {

            if (bb.player.dialogStatus % 2) return SUCCESS;
            if (bb.response == 'no') {
              bb.player.dialogStatus = 0;
              qDialog.displayEndDialogue("PlayerExit");
              return FAILURE;
            }

            const opts = bb.nPC.getOpts(textAssets);
            qDialog.displayAsk(opts);
            bb.player.dialogStatus++;
            return FAILURE;

          }
        }));

        BehaviorTree.register("check", new Task({
          run: function(bb) {
            if (bb.response == "no") {
              bb.player.dialogStatus = 0;
              bb.player.score = 0;
              qDialog.displayEndDialogue("PlayerExit");
              return FAILURE;
            }

            if (bb.nPC.npcLevel < 3)
              if (bb.return.effect > bb.nPC.npcLst) {
                bb.nPC.processFailure();
                qDialog.displayEndDialogue("BadEnd1");
                bb.player.dialogStatus = 0;
                return FAILURE;
              }
            else {
              bb.player.score = bb.player.score +
                (bb.nPC.npcLst + 1) * (bb.nPC.npclst == bb.response.effect) +
                bb.nPC.npcLst * (bb.nPC.npclst - 1 == bb.response.effect);
              bb.nPC.getResult();
            } else if (bb.response.cor - bb.player.skill > b.nPC.npcCor) {
              bb.nPC.processFailure();
              qDialog.displayEndDialogue("BadEnd2");
              Bb.player.dialogStatus = 0;
              return FAILURE;
            } else
              bb.player.score = bb.player.score + (bb.response.cor * bb.player.skill);

            bb.player.dialogstatus++;
            return SUCCESS;

          }
        }));

        BehaviorTree.register("respond", new Task({
          run: function(bb) {
            if (bb.stage !== 2) return SUCCESS;
            bb.stage = 3;
            handleSuccess(bb);
            // Player has been successful so need to put out successful response
            return SUCCESS;
          }
        }));

        BehaviorTree.register("update", new Task({
          run: function(bb) {

            // Update player and nPC Stats based on success
            return SUCCESS;
          }
        }));


        const rootStage = new Sequence({
          nodes: ['preamble', 'ask', 'check', 'ask', 'check', 'ask', 'check', 'update']
        });

        const bTree = new BehaviorTree({
          tree: rootStage,
          blackboard: bb
        });
      }

      stepDialog(response) {
        bb.response = response;
        btree.step();
      } */
  }

  export class ContainerDriver {
    constructor() {
      // load the list of dialogues
      this.response = "no";
    }

    // Initialize the dialog modal
    init(player, container) {
      this.player = player,
      this.container = container
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

          if (response = "no") {
            this.fin(false, "");
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
            prompt = container.search + " nothing.";
            this.fin(true, prompt);
            break;
          }
        }
        case 2: {
          prompt = "These items have been added to your inventory.";
          this.container.contents.forEach(function(row) {
            this.player.addInventory(row);
            qDialog.addEnchantments(row);
          });

          qDialog.updateStats(player);
          this.container.contents = null;

          this.fin(true, prompt);
        }
      }
    }

  fin(diag, prompt) {
    this.player.dialogStage = 0;
    if (diag) {
      qDialog.displayEndDialogue(prompt, this);
    } else {
      const event = new CustomEvent('Fin', {
        detail: this
      });
    }
  }
  }
