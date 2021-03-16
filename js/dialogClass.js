const $ = require("jquery");
window.$ = window.jQuery = $;
require("jquery-ui-bundle");
require("../staticjs/jquery.titlesequence.js");

export default class DialogClass {
  constructor() {
    //Add controls to the drop-down panel
    $(document).ready(function() {
      $("#controls").click(function() {
        $("#panel").slideToggle("slow");
      });
    });
    $(document).ready(function() {
      $("#charInv").tabs();
    });
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

  containerDialog(player, container) {
    player.body.moves = false;

    let prompt = "You approach the " + container.name +
      ". It is " + container.description.charAt(0).toLowerCase() + container.description.slice(1) +
      ". Do you want to search the " + container.name + "?";

    $("#dialogText").html(prompt);

    _addButtons([{
      text: "Yes",
      response: "yes"
    }, {
      text: "No",
      response: "no"
    }]);

    $("#dialogContainer").show();

    function _addButtons(buttons) {
      $(".dialogButton").unbind("click");

      switch (buttons.length) {
        case 1: {
          $("#mdialogButton").prop("value", buttons[0].text).show();
          $("#mdialogButton").click(function() {
            _catchResponse(buttons[0].response);
          });
          $("#ldialogButton").hide();
          $("#rdialogButton").hide();
          break;
        }
        case 2: {
          $("#ldialogButton").prop("value", buttons[0].text).show();
          $("#ldialogButton").click(function() {
            _catchResponse(buttons[0].response);
          });
          $("#rdialogButton").prop("value", buttons[1].text).show();
          $("#rdialogButton").click(function() {
            _catchResponse(buttons[1].response);
          });
          $("#mdialogButton").hide();
          break;
        }
        case 3: {
          $("#ldialogButton").prop("value", buttons[0].text).show();
          $("#ldialogButton").click(function() {
            _catchResponse(buttons[0].response);
          });
          $("#mdialogButton").prop("value", buttons[1].text).show();
          $("#mdialogButton").click(function() {
            _catchResponse(buttons[1].response);
          });
          $("#rdialogButton").prop("value", buttons[2].text).show();
          $("#rdialogButton").click(function() {
            _catchResponse(buttons[2].response);
          });
          break;
        }

        function _catchResponse(response) {
          if (response == "no") {
            $("#dialogContainer").hide();
            player.body.moves = true;
            player.dialogStage = 0;
            return;
          }

          if (player.dialogStage == 0 && container.contents) {
            let prompt = container.search;
            // There are items to collect

            prompt = prompt + ":";
            let i = 0;
            for (i = 0; i < container.contents.length; i++)
              prompt = prompt + "<br>" + container.contents[i].name +
              ", " + container.contents[i].description;

            prompt = prompt + "<br><br>Do you want to collect these items?";

            $("#dialogText").html(prompt);
            _addButtons([{
              text: "Yes",
              response: "yes"
            }, {
              text: "No",
              response: "no"
            }]);

            player.dialogStage = 1;
            return;
          }

          if (player.dialogStage == 0 && !container.contents) {

            // There are no items to collect
            prompt = container.search + " nothing.";
            $("#dialogText").html(prompt);
            player.dialogStage = 0;

            _addButtons([{
              text: "Ok",
              response: "no"
            }]);
            return;
          }

          if (player.dialogStage == 1) {
            prompt = "These items have been added to your inventory.";
            console.log(container.contents);
            container.contents.forEach(function (row) {
              player.addInventory(row);
              addEnchantments(row);
            });

            updateStats(player);
            container.contents = null;

            player.dialogStage = 0;
            $("#dialogText").html(prompt);
            _addButtons([{
              text: "Ok",
              response: "no"
            }]);
          }
        }
      }
    }
  }
  nPCDialog(player, nPC, textAssets) {
    player.body.moves = false;
    player.body.setVelocity(0);

    nPC.pauseFollow();
    nPC.body.enable = false;

    let prompt = "You approach " + textAssets.Level[nPC.npcLevel] + " " + nPC.npcName + "<br>";
    prompt = prompt + "Relationship: " + textAssets.nPCRelationship[nPC.npcRel] + "<br>";
    prompt = prompt + "Attitude: " + textAssets.nPCLst[nPC.npcLst] + "<br>";
    prompt = prompt + "Corruption: " + textAssets.nPCCor[nPC.npcCor];
    $(".dialogButton").unbind("click");
    $("#dialogText").html(prompt);
    $("#mdialogButton").prop("value", "Ok").show();
    $("#mdialogButton").click(function() {
      _catchResponse("Ok");
    });
    $("#ldialogButton").hide();
    $("#rdialogButton").hide();

    $("#dialogContainer").show();


    function _catchResponse(resp) {
      $("#dialogContainer").hide();
      player.body.moves = true;
      console.log("Setting collided flag");
      const timedEvent = nPC.scene.time.delayedCall(6000, nPC.onEvent, [], nPC);
    }
  }

  displayPreamble(nPC, prompt) {

    $(".dialogButton").unbind("click");
    $("#dialogText").html(prompt);
    $("#ldialogButton").prop("value", "Ok").show()
      .click(function() {
        _catchResponse("y");
      });
    $("#rdialogButton").prop("value", "Cancel").show()
      .click(function() {
        _catchResponse("n");
      });
    $("#mdialogButton").hide();

    $("#dialogContainer").show();

    function _catchResponse(resp) {
      $("#dialogContainer").hide();
      dialogDriver.stepDialog(resp); // call plugin step passing in response
    }
  }

  displayEndDialogue(prompt) {

    $(".dialogButton").unbind("click");
    $("#dialogText").html(prompt);
    $("#mdialogButton").prop("value", "Ok").show()
      .click(function() {
        _catchResponse("y");
      });
    $("#ldialogButton").hide();
    $("#rdialogButton").hide();

    $("#dialogContainer").show();

    function _catchResponse(resp) {
      $("#dialogContainer").hide();
      //re-enable player and nPC
    }
  }
}
