const $ = require("jquery");
window.$ = window.jQuery = $;
require("jquery-ui-bundle");
require("../staticjs/jquery.titlesequence.js");
var titles = require("../assets/dialogs.json");

export default class DialogClass {
  constructor() {
    //Add controls to the drop-down panel

    this.status = false;
    this.inventory = false;
    this.resp = "no";
    this.driver = null;
    this.stopFlag = true;
    this.scene = null;

    const self = this;

    // Status button
    $(document).ready(function() {
      $("#status").click(function() {
        if (this.status) {
          this.status = false;
          self.scene.resume();
          $("#panel").slideUp("slow");
          $("#inventory").button("enable");
        } else {
          this.status = true;
          self.scene.pause();
          $("#panel").slideDown("slow");
          $("#inventory").button("disable");
        }
      });
    });
    $(document).ready(function() {
      $("#inventory").click(function() {
        if (this.inventory) {
          this.inventory = false;
          self.scene.resume();
          $("#invPanel").slideUp("slow");
          $("#status").button("enable");
        } else {
          this.inventory = true;
          self.scene.pause();
          $("#invPanel").slideDown("slow");
          $("#status").button("disable");
        }
      });
    });

    $(document).ready(function() {
      $("#controls").controlgroup();
      $("#controlButtons").controlgroup();
      $("#charInv").tabs();
      $("#diagOpts").tabs();
    })


    $(function() {
      $("#dialogContainer").dialog({
          autoOpen: false,
          buttons: [{
              id: "bcYes",
              text: "Yes",
              click: function() {
                self.resp = "yes";
                $(this).dialog("close");
              }
            },
            {
              id: "bcNo",
              text: "No",
              click: function() {
                self.resp = "no";
                $(this).dialog("close");
              }
            },
            {
              id: "bcOK",
              text: "Ok",
              click: function() {
                self.resp = "no";
                $(this).dialog("close");
              }
            }
          ],
          resizable: false,
          position: {
            my: "center",
            at: "center",
            of: "#phaserblock"
          }
        })
        .on('dialogclose', function(event) {
          self.catchResponse(self.resp);
        });
    });

    $(function() {
      $("#npcDialogPanel").dialog({
          autoOpen: false,
          buttons: [{
              id: "bnAccept",
              text: "Accept",
              click: function() {
                $("#npcDiagText").prepend("<p>" + self.resp.text + "</p>");
                self.driver.stepOn(self, self.resp);
              }
            },
            {
              id: "bnCancel",
              text: "Cancel",
              click: function() {
                self.resp = "no";
                $(this).dialog("close");
              }
            },
            {
              id: "bnOK",
              text: "Ok",
              click: function() {
                if (self.stopFlag) {
                  $(this).dialog("close");
                } else {
                  self.driver.stepOn(self, self.resp);
                }
              }
            }
          ],
          resizable: false,
          title: "Encounter",
          position: {
            my: "center",
            at: "top",
            of: "#phaserblock"
          },
          width: 790
        })
        .on('dialogclose', function(event) {
          self.catchResponse(self.resp);
        });
    });

  }

  catchResponse(resp) {

    if (this.stopFlag)
      this.emitter.emit(this.driver.type, this.driver);
    else
      this.driver.stepOn(this, resp);
  }

  displayYesNo(prompt, driver) {
    this.resp = "no";
    this.stopFlag = false;
    this.driver = driver;
    $("#bcOK").hide();
    $("#bcYes").show();
    $("#bcNo").show();
    $("#dialogContainer").dialog("option", "title", "Choose Option");
    $("#dialogText").html(prompt);
    $("#dialogContainer").dialog("open");

  }

  displayAsk(opts, gifts, textAssets, stage, npcName) {
    //
    // Clear out any left over text
    //
    let id = null;
    this.resp = "no";
    if (stage < 3) $("#npcDiagText").empty();

    $(".dTbody").empty();
    $("#npcDiagText").hide();
    $("#diagOpts").show();

    //
    // Iniitialise buttons
    //
    $("#bnOK").hide();
    $("#bnAccept").hide();
    $("#bnCancel").show();
    //
    // Load up data
    //
    $("#drow").append(opts.dialog);
    $("#arow").append(opts.actions);
    $("#grow").append(gifts);

    let self = this;

    $(".d-clickable-row").click(function() {
      let row = $(this).closest('tr');
      $(".d-clickable-row").removeClass("highlight");
      $(".a-clickable-row").removeClass("highlight");
      $(".g-clickable-row").removeClass("highlight");
      if (self.resp.id == $(row).find(".id").html() && self.resp.choice == "say") {
        self.resp = "no";
        $("#bnAccept").hide();
        id = null
      } else {
        id = $(row).find(".id").html();
        $(row).addClass("highlight");
        self.resp = {
          choice: "say",
          text: $(row).find(".dText").html(),
          id: textAssets.playerDialog.find(rw => rw.id == id)
        };
        $("#bnAccept").show();
      }
    });

    $(".a-clickable-row").click(function() {
      let row = $(this).closest('tr');
      $(".d-clickable-row").removeClass("highlight");
      $(".a-clickable-row").removeClass("highlight");
      $(".g-clickable-row").removeClass("highlight");
      if (self.resp.id == $(row).find(".id").html() && self.resp.choice == "action") {
        self.resp = "no";
        $("#bnAccept").hide();
        id = null
      } else {
        id = $(row).find(".id").html();
        $(row).addClass("highlight");
        self.resp = {
          choice: "action",
          text: $(row).find(".dText").html(),
          id: textAssets.playerAction.find(rw => rw.id == id)
        };
        $("#bnAccept").show();
      }
    });

    $(".g-clickable-row").click(function() {
      let row = $(this).closest('tr');
      $(".d-clickable-row").removeClass("highlight");
      $(".a-clickable-row").removeClass("highlight");
      $(".g-clickable-row").removeClass("highlight");
      if (self.resp.id == $(row).find(".gText1").html() && self.resp.choice == "give") {
        self.resp = "no";
        $("#bnAccept").hide();
        id = null
      } else {
        id = $(row).find(".gText1").html();
        $(row).addClass("highlight");
        self.resp = {
          choice: "give",
          text: "You give " + npcName + " the " + $(row).find(".gText1").html(),
          id: id
        };
        $("#bnAccept").show();
      }
    });

    $("#npcDialogPanel").dialog("open");
  }

  displayResult(resp) {
    //
    // This is called from the driver to display the response and expects the ask
    // dialog to be active.
    //
    $("#bnOK").show();
    $("#bnAccept").hide();
    $("#bnCancel").hide();
    $("#diagOpts").hide();
    if (resp.score == -1) {
      this.resp = "no";
      this.stopFlag = true;
    } else {
      this.resp = "yes";
      this.stopFlag = false;
    }
    let msgClass = "npcResp";
    if (this.stopFlag) msgClass = "finResp"

    $("#npcDiagText").prepend("<p class='" + msgClass + "'>" + resp.text + "</p>").show();
  }

  updateStats(player) {
    // updates the inventory Panel
    $('#playerName').html(player.name);
    $('#playerLevel').html(player.level);

    let tmp = player.sed.toString() + _buildstr(player.sedp);
    $('#playerSed').html(tmp);

    tmp = player.skill.toString() + _buildstr(player.skillp);
    $('#playerSkill').html(tmp);

    function _buildstr(mod) {
      let tmp = mod.toString();
      let str = "";
      if (mod !== 0) {
        str = " (";
        if (mod < 0)
          str = str + "-";
        else str = str + "+";
        str = str + Math.abs(mod).toString() + ")";
      }
      return str;
    }

  }

  addObject(obj, name) {
    let tmp = "<tr><td>" + name + "</td><td>";
    tmp = tmp + obj.properties.Description + "</td></tr>";
    switch (obj.properties.Class) {
      case "Buff": {
        $("#buffs tbody").append(tmp);
        break;
      }
      case "Enchantment": {
        $("#enchantments tbody").append(tmp);
        break;
      }
      case "Gift": {
        $("#gifts tbody").append(tmp);
        break;
      }
      case "Key": {
        $("#keys tbody").append(tmp);
        break;
      }
      case "Aid": {
        $("#aids tbody").append(tmp);
        break;
      }
    }

  }
  //TODO display the title dialogue
  displayTitles() {

    _displayTitles(titles.titles);

    function _displayTitles(titles) {

      $('#titles').titleSequence([

        {
          content: titles[0],
          class: 'title',
          css: {
            left: '66px',
            top: '180px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 900
        },

        {
          content: titles[1],
          class: 'title',
          css: {
            left: '65px',
            top: '220px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 900
        },

        {
          content: titles[2],
          class: 'title',
          css: {
            left: '65px',
            top: '240px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 2700
        },

        function(seq) {
          $('.title').remove();
          seq.next_cue();
        },

        {
          content: titles[4],
          class: 'title',
          css: {
            left: '66px',
            top: '180px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 900
        },

        {
          content: titles[5],
          class: 'title',
          css: {
            left: '66px',
            top: '220px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 900
        },

        {
          content: titles[6],
          class: 'title',
          css: {
            left: '66px',
            top: '240px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 2700
        },

        function(seq) {
          $('.title').remove();
          seq.next_cue();
        },
        {
          content: titles[7],
          class: 'title',
          css: {
            left: '66px',
            top: '180px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 900
        },
        {
          content: titles[8],
          class: 'title',
          css: {
            left: '66px',
            top: '220px',
            width: '670px',
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          duration: 1800,
          pause: 900
        }

      ]).click(function() {
        $('#titles').hide();
      });

      $(document).on("keydown", function(event) {
        if (event.which == 27) {
          $("#titles").empty().hide();
        }

      });

    }
  }
  //TODO display menu (new, load, save (?), opts (?))
  displayMainMenu() {}

  displayEndDialogue(prompt, driver) {
    this.driver = driver;
    this.stopFlag = true;
    $("#bcOK").show();
    $("#bcYes").hide();
    $("#bcNo").hide();

    $("#dialogContainer").dialog("option", "title", "Confirm");
    $("#dialogText").html(prompt);
    $("#dialogContainer").dialog("open");

  }
  displaynPCDialogPlayer(player) {
    let turn = (player.dialogStage + 1) / 2;
    if (!(player.dialogStage % 2)) turn -= 0.5;
    const playerText = "Name: " + player.name + "<br><br>" +
      "Turn: " + turn + "<br>" +
      "Score: " + player.score;
    $("#dplayerstats").html(playerText);
  }

  displaynPCDialogNPC(npc,textAssets){
    let stats = npc.getStats(textAssets);
    $("#dnpcstats").html(stats);
  }

}
