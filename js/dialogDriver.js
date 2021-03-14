  const {
    BehaviorTree,
    Sequence,
    Task,
    SUCCESS,
    FAILURE
  } = require('behaviortree');


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
      init(qDialog, player, nPC, textAssets) {

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
        }}));


        BehaviorTree.register("ask", new Task({
          run: function(bb) {

            if (bb.player.dialogStatus % 2) return SUCCESS;
            if (bb.response == 'no') {
                bb.player.dialogStatus = 0;
                qDialog.displayEndDialogue("PlayerExit");
                return FAILURE;
              }

            const opts=bb.nPC.getOpts(textAssets);
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

            if (bb.nPC.npcLevel < 3 )
                if (bb.return.effect > bb.nPC.npcLst) {
                    bb.nPC.processFailure();
                    qDialog.displayEndDialogue ("BadEnd1");
                    bb.player.dialogStatus = 0;
                    return FAILURE;
                  }
                  else {
                    bb.player.score = bb.player.score +
                      (bb.nPC.npcLst + 1) * (bb.nPC.npclst == bb.response.effect) +
                      bb.nPC.npcLst * (bb.nPC.npclst-1 == bb.response.effect);
                    bb.nPC.getResult();
                    }

            else if (bb.response.cor - bb.player.skill > b.nPC.npcCor) {
                    bb.nPC.processFailure();
                    qDialog.displayEndDialogue ("BadEnd2");
                    Bb.player.dialogStatus = 0;
                    return FAILURE;
                  }
                  else
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
          }
        ));

        BehaviorTree.register("update", new Task({
            run: function(bb) {

              // Update player and nPC Stats based on success
              return SUCCESS;
            }
          }
        ));


      const rootStage = new Sequence({
        nodes: ['preamble', 'ask', 'check', 'ask', 'check', 'ask', 'check','update']
      });

      const bTree = new BehaviorTree({
        tree: rootStage,
        blackboard: bb
      });
    }

    stepDialog (response) {
      bb.response = response;
      btree.step();
    }
  }
