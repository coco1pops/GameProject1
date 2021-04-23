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
    this.enchant = false;
    this.resp = "no";
    this.driver = null;
    this.stopFlag = true;
    this.scene = null;
    this.player = null;
    this.enchantments = null;

    const self = this;

    // Status button
    $(document).ready(function() {
      $("#status").click(function() {
        if (this.status) {
          this.status = false;
          self.scene.resume();
          $("#panel").slideUp("slow");
          $("#inventory").button("enable");
          $("#enchant").button("enable");
        } else {
          this.status = true;
          self.scene.pause();
          $("#panel").slideDown("slow");
          $("#inventory").button("disable");
          $("#enchant").button("disable");
        }
      });
    });

    // Inventory button
    $(document).ready(function() {
      $("#inventory").click(function() {
        if (this.inventory) {
          this.inventory = false;
          self.scene.resume();
          $("#invPanel").slideUp("slow");
          $("#status").button("enable");
          $("#enchant").button("enable");
        } else {
          this.inventory = true;
          self.scene.pause();
          $("#invPanel").slideDown("slow");
          $("#status").button("disable");
          $("#enchant").button("disable");
        }
      });
    });

    // Enchant button
    $(document).ready(function() {
      $("#enchant").click(function() {
        if (self.enchant) {
          self.enchant = false;
          self.scene.resume();
          $("#encPanel").slideUp("slow");
          $("#status").button("enable");
          $("#inventory").button("enable");
        } else {
          self.enchant = true;
          self.scene.pause();
          $("#encPanel").slideDown("slow");
          $("#status").button("disable");
          $("#inventory").button("disable");
          $('input[name="set1-radio"]').prop('checked', false).button("refresh");
          $("#encObjs").empty();
          self.resetEncObjs();
        }
      });
    });

    // Initialise panels
    $(document).ready(function() {
      $("#controls").controlgroup();
      $("#controlButtons").controlgroup();
      $("#charInv").tabs();
      $("#diagOpts").tabs();
    })

    // Container Dialogue

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

    // NPC Dialogue

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

    // Enchant Dialogue

    $(document).ready(function() {

      let eSel = "";
      let xSel = "";
      let selVal1 = "";
      let selVal2 = "";

      $("input").checkboxradio();
      $('input[name="set2-radio"]').attr('disabled', 'disabled');
      $("#encbtnOK").hide();

      $("#enchant").click(function() {
        eSel = "";
      });

      $("#encbtnCancel").click(function() {
        eSel = "";
        self.enchant = false;
        self.scene.resume();
        $("#encPanel").slideUp("slow");
        $("#status").button("enable");
        $("#inventory").button("enable");
      })

      $("#encbtnOK").click(function() {
        let eObj = self.player.inventory.find(obj => obj.name == eSel);
        let xObj = null;
        if (selVal1 == "buffs") {
          if (selVal2 == "enc") {
            // retrieve object from xSel and eSel. Update eSel with xSel
            // properties and delete xSel object from player
            xObj = self.player.inventory.find(obj => obj.name == xSel);
            console.log(xObj);
            if (xObj.properties.Sed) {
              if (eObj.properties.Sed) {
                eObj.properties.Sed += xObj.properties.Sed;
              } else {
                eObj.properties["Sed"] = xObj.properties.Sed;
              }
              self.player.sedp += xObj.properties.Sed;
            }
            if (xObj.properties.Skill) {
              if (eObj.properties.Skill) {
                eObj.properties.Skill += xObj.properties.Skill;
              } else {
                eObj.properties["Skill"] = xObj.properties.Skill;
              }
              self.player.skillp += xObj.properties.Skill;
            }
          }

          if (selVal2 == "exp") {
            xObj = self.enchantments.find(obj => obj.id == xSel);
            console.log(xObj);
            if (xObj.Mode == "Sed") {
              if (eObj.properties.Sed) {
                eObj.properties.Sed += xObj.Bonus;
              } else {
                eObj.properties["Sed"] = xObj.Bonus;
              }
              self.player.sedp += xObj.Bonus;
            }

            if (xObj.Mode == "Skill") {
              if (eObj.properties.Skill) {
                eObj.properties.Skill += xObj.Bonus;
              } else {
                eObj.properties["Skill"] = xObj.Bonus;
              }
              self.player.skillp += xObj.Bonus;
            }
          }
        }

        if (selVal1 == "gifts") {
          if (selVal2 == "enc") {
            xObj = self.player.inventory.find(obj => obj.name == xSel);
            if (xObj.properties.Lst) {
              if (eObj.properties.Lst) {
                eObj.properties.Lst += xObj.properties.Lst;
              } else {
                eObj.properties["Lst"] = xObj.properties.Lst;
              }
            }
            if (xObj.properties.Cor) {
              if (eObj.properties.Cor) {
                eObj.properties.Cor += xObj.properties.Cor;
              } else {
                eObj.properties["Cor"] = xObj.properties.Cor;
              }
            }
          }

          if (selVal2 == "exp") {
            xObj = self.enchantments.find(obj => obj.id == xSel);
            if (xObj.Mode == "Lst") {
              if (eObj.properties.Lst) {
                eObj.properties.Lst += xObj.Bonus;
              } else {
                eObj.properties["Lst"] = xObj.Bonus;
              }
            }

            if (xObj.Mode == "Cor") {
              if (eObj.properties.Cor) {
                eObj.properties.Cor += xObj.Bonus;
              } else {
                eObj.properties["Cor"] = xObj.Bonus;
              }
            }
          }
        }

        $("#encOptsTab").empty();

        let htTable = "";
        if (selVal2 == "enc") {
          let ix = self.player.inventory.findIndex(obj => obj.name == xSel);
          let del = self.player.inventory.splice(ix, 1);
          htTable = self.player.getObjsFor("Enchantment", selVal1);
          rebuildEncs();
        }
        if (selVal2 == "exp") {
          self.player.addExperience(-xObj.Experience);
          self.updateControls(self.player);
          htTable = buildEnchantments(selVal1);
        }

        $("#encOptsTab").append(htTable);

        xSel = "";
        $("#encbtnOK").hide();
        $(".x-clickable-row").removeClass("highlight");
        addXClicks();
        self.updateStats(self.player);
        console.log(self.player.inventory);

      });

      $('#rset1').change(function() {
        selVal1 = $("input[name='set1-radio']:checked").val();

        let htTable = null;
        if (selVal1 == "buffs") {
          htTable = self.player.getObjs("Buff", "e");
        }
        if (selVal1 == "gifts") {
          htTable = self.player.getObjs("Gift", "e");
        }
        self.resetEncObjs();
        $("#encObjs").empty();
        $("#encObjs").append(htTable);
        $(".e-clickable-row").click(function() {
          let row = $(this).closest('tr');
          $(".e-clickable-row").removeClass("highlight");
          $(".x-clickable-row").removeClass("highlight");
          if (eSel == $(row).find(".gText1").html()) {
            eSel = "";
            self.resetEncObjs();
          } else {
            $('input[name="set2-radio"]').removeAttr('disabled').button("refresh");
            $(row).addClass("highlight");
            eSel = $(row).find(".gText1").html();
          }
        });

      });

      $('#rset2').change(function() {
        selVal2 = $("input[name='set2-radio']:checked").val();
        let htTable = null;
        $("#encOptsTab").empty();
        if (selVal2 == "enc") {
          htTable = self.player.getObjsFor("Enchantment", selVal1);
          $("#encOptsTab").append(htTable);
        }
        if (selVal2 == "exp") {
          htTable = buildEnchantments(selVal1);
          $("#encOptsTab").append(htTable);
        }
        addXClicks();
      });

      function addXClicks() {
        $(".x-clickable-row").click(function() {
          let row = $(this).closest('tr');
          $(".x-clickable-row").removeClass("highlight");
          if (xSel == $(row).find(".gText1").html()) {
            xSel = "";
            $("#encbtnOK").hide();
          } else {
            $(row).addClass("highlight");
            xSel = $(row).find(".gText1").html();
            if (selVal2 == "exp") xSel = $(row).find(".id").html();
            $("#encbtnOK").show();
          }
        });
      }

      function buildEnchantments(sel) {
        let erow = "";
        if (sel == "gifts") {
          self.enchantments.filter(obj => (obj.Experience <= self.player.experience &&
            (obj.Mode == "Cor" || obj.Mode == "Lst"))).forEach(function(obj) {
            erow = buildrow(erow, obj);
          });
        }
        if (sel == "buffs") {
          self.enchantments.filter(obj => (obj.Experience <= self.player.experience &&
            (obj.Mode == "Sed" || obj.Mode == "Skill"))).forEach(function(obj) {
            erow = buildrow(erow, obj);
          });
        }

        function buildrow(erow, obj) {
          return erow + "<tr class='x-clickable-row'><td class='gText1'>" + obj.Name + "</td><td class='gText2'>" +
            obj.Description + "</td><td>" + obj.Experience + "</td><td style = 'display:none' class = 'id'>" + obj.id + "</td></tr>";
        }
        return erow;
      }

      function rebuildEncs() {
        $("#enchantments tbody").empty();
        self.player.inventory.filter(obj => obj.properties.Class == "Enchantment").forEach(function(obj) {
          self.addObject(obj, obj.name);
        })
      }
    });
  }

  catchResponse(resp) {

    if (this.stopFlag)
      this.emitter.emit(this.driver.type, this.driver);
    else
      this.driver.stepOn(this, resp);
  }



  resetEncObjs() {
    $('input[name="set2-radio"]').attr('disabled', 'disabled').button("refresh");
    $('input[name="set2-radio"]').prop('checked', false).button("refresh");
    $("#encOptsTab").empty();
    $("#encbtnOK").hide();
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
  displaynPCDialogPlayer(stage, score, player) {
    let turn = (stage + 1) / 2;
    if (!(stage % 2)) turn -= 0.5;
    const playerText = "Name: " + player.name + "<br><br>" +
      "Turn: " + turn + "<br>" +
      "Score: " + score;
    $("#dplayerstats").html(playerText);
  }

  displaynPCDialogNPC(npc, textAssets) {
    let stats = npc.getStats(textAssets);
    $("#dnpcstats").html(stats);
  }

  updateControls(player) {
    $("#experience").html(player.experience);
  }

}
