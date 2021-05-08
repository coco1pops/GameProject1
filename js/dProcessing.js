export default class DProcessing {

  // Function to return a list of options to display
  static getOpts(player, nPC, textAssets) {
    let drow = [];
    const self = this;
    textAssets.playerDialog.filter(o => o.phase == nPC.npcRel).forEach(function(entry) {
      const nText = self.formatText (entry.text, nPC);
      let col = _getColour(entry.effect);
      let dobj = {
        colour: col,
        text: nText,
        id: entry.id
      };
      drow.push(dobj);
    });

    let arow = [];
    textAssets.playerAction.filter(o => o.phase == nPC.npcRel).forEach(function(entry) {
      const nText = self.formatText(entry.text, nPC);
      let col = _getColour(entry.effect);
      let dobj = {
        colour: col,
        text: nText,
        id: entry.id
      };
      arow.push(dobj);
    });

    let gifts = player.getObjects("Gift", "g");

    return {
      dialog: drow,
      actions: arow,
      gifts: gifts
    };

    function _getColour(id) {
      let sw = Math.floor(id/7);
      switch (sw) {
        case 0:
          return "pink";
        case 1:
          return "red";
        case 2:
          return "darkred";
      }
      return "white";
    }
  }

  static getDiagResponse(opt, player, nPC, todModifier) {

    let baseScore = nPC.npcLst + nPC.npcSed + todModifier +
        player.level - nPC.npclevel;

    let failUnder = baseScore - (4 - nPC.npcLst);
    let failOver = baseScore + 3 + nPC.npcLst;
    let ix = 0;

    if (opt.effect < failUnder) return -2;
    if (opt.effect > failOver) return -1;

    if (opt.effect > failUnder && opt.effect < failOver)
    {
      if (opt.effect < (failOver - 3)) ix = 1;
      if (opt.effect == failOver - 3) ix = 2;
    }
    return ix;
  }

  static getRoomResponse(opt, player, nPC, todModifier) {

    let baseScore = nPC.npcCor + nPC.npcLst + player.skill + todModifier;

    let failUnder = baseScore - 3 * (player.skill + 1);
    let failOver = baseScore + 3 * (player.skill + 1);
    let ix = 0;

    if (opt.effect < failUnder) return -2;
    if (opt.effect > failOver) return -1;

    if (opt.effect > failUnder && opt.effect < failOver)
    {
      if (opt.effect < (baseScore - player.skill)) ix = 1;
      if (opt.effect >= (baseScore - player.skill) && opt.effect <= (baseScore + player.skill)) ix = 2;
    }
    return ix;
  }

  static getEndResult(exp, nPC) {
    return result;
  }

  static formatText(text, nPC) {
    let ret = text.replace("+n", nPC.npcName);
    return ret;
  }
}
