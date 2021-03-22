const $ = require("jquery");
window.$ = window.jQuery = $;
require("jquery-ui-bundle");
require("../staticjs/jquery.titlesequence.js");

export default class DialogClass {
  constructor() {
    //Add controls to the drop-down panel

    this.status = false;
    this.inventory = false;
    this.resp = "no";
    this.driver = null;
    this.stopFlag = true;

    const self = this;

    // Status button
    $(document).ready(function() {
      $("#status").click(function() {
        if (this.status) {
          this.status = false;
          $("#panel").slideUp("slow");
          $("#inventory").button("enable");
        } else {
          this.status = true;
          $("#panel").slideDown("slow");
          $("#inventory").button("disable");
        }
      });
    });
    $(document).ready(function() {
      $("#inventory").click(function() {
        if (this.inventory) {
          this.inventory = false;
          $("#invPanel").slideUp("slow");
          $("#status").button("enable");
        } else {
          this.inventory = true;
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
          buttons: [ {
            id: "bYes",
            text: "Yes",
            click: function() {
              self.resp = "yes";
              $(this).dialog("close");
            }},
            {
            id: "bNo",
            text: "No",
            click: function() {
              self.resp = "no";
              $(this).dialog("close");
            }},
            {
            id: "bOK",
            text: "Ok",
            click: function() {
            self.resp = "no";
              $(this).dialog("close");
            }}
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
            buttons: [ {
              id: "bAccept",
              text: "Accept",
              click: function() {
                self.resp = "yes";
                $(this).dialog("close");
              }},
              {
              id: "bCancel",
              text: "Cancel",
              click: function() {
                self.resp = "no";
                $(this).dialog("close");
              }}
            ],
            resizable: false,
            title: "Encounter",
            position: {
              my: "center",
              at: "top",
              of: "#phaserblock"
            },
            width:790
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
    this.resp="no";
    this.stopFlag = false;
    this.driver = driver;
    $("#bOK").hide();
    $("#bYes").show();
    $("#bNo").show();
    $("#dialogContainer").dialog("option", "title", "Choose Option");
    $("#dialogText").html(prompt);
    $("#dialogContainer").dialog("open");

  }

  displayAsk(opts, stats, player){
    $("#dnpcstats").html(stats);
    $("#dplayerstats").html(player);
    $("#drow").append(opts.dialog);
    $("#arow").append(opts.actions);
    $("#npcDialogPanel").dialog("open");
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

  addEnchantments(inv) {
    let tmp = "<tr><td>" + inv.name + "</td><td>";
    tmp = tmp + inv.description + "</td></tr>";
    $("#enchantments tbody").append(tmp);
  }

  //TODO display the title dialogue
  displayTitles() {
    $.getJSON("assets/dialogs.json", function(json) {
      _displayTitles(json.titles);
    }).fail(function() {
      console.log("Cannot Read titles JSON File");
    });

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
    $("#bOK").show();
    $("#bYes").hide();
    $("#bNo").hide();

    $("#dialogContainer").dialog("option", "title", "Confirm");
    $("#dialogText").html(prompt);
    $("#dialogContainer").dialog("open");

  }

}
