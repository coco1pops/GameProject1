const $ = require("jquery");
window.$ = window.jQuery = $;
require("jquery-ui-bundle");
require("../staticjs/jquery.titlesequence.js");

export default class DialogClass {
  constructor() {
    //Add controls to the drop-down panel
    $(document).ready(function() {
      $("#status").click(function() {
        $("#panel").slideToggle("slow");
      });
    });
    $(document).ready(function() {
      $("#charInv").tabs();
    });
    this.emitter = null;
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

  displayYesNo(prompt, driver) {

    $("#dialogText").html(prompt);

    this.addButtons([{
        text: "Yes",
        response: "yes"
      }, {
        text: "No",
        response: "no"
      }],
      driver, false);

    $("#dialogContainer").show();
  }

  displayEndDialogue(prompt, driver) {

    const self = this;

    $("#dialogText").html(prompt);

    this.addButtons([{
        text: "Ok",
        response: "yes"
      }],
      driver, true);

    $("#dialogContainer").show();

  }

  addButtons(buttons, driver, stopFlag) {

    const self = this;

    $(".dialogButton").unbind("click");

    switch (buttons.length) {
      case 1: {
        $("#mdialogButton").prop("value", buttons[0].text).show();
        $("#mdialogButton").click(function() {
          _catchResponse(buttons[0].response, self);
        });
        $("#ldialogButton").hide();
        $("#rdialogButton").hide();
        break;
      }
      case 2: {
        $("#ldialogButton").prop("value", buttons[0].text).show();
        $("#ldialogButton").click(function() {
          _catchResponse(buttons[0].response, self);
        });
        $("#rdialogButton").prop("value", buttons[1].text).show();
        $("#rdialogButton").click(function() {
          _catchResponse(buttons[1].response, self);
        });
        $("#mdialogButton").hide();
        break;
      }
      case 3: {
        $("#ldialogButton").prop("value", buttons[0].text).show();
        $("#ldialogButton").click(function() {
          _catchResponse(buttons[0].response, self);
        });
        $("#mdialogButton").prop("value", buttons[1].text).show();
        $("#mdialogButton").click(function() {
          _catchResponse(buttons[1].response, self);
        });
        $("#rdialogButton").prop("value", buttons[2].text).show();
        $("#rdialogButton").click(function() {
          _catchResponse(buttons[2].response, self);
        });
        break;
      }
    }

    function _catchResponse(resp, self) {
      $("#dialogContainer").hide();
      if (stopFlag)
        self.emitter.emit(driver.type, driver);
      else
        driver.stepOn(self, resp);
    }
  }
}
