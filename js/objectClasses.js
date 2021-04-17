export class Container extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.description = "";
    this.search = "";
    this.contentsList = null;
    this.contents = null;
  }

  extractData(inv) {

    if (this.contentsList) {
      const lst = this.contentsList.split(",");
      this.contents = [];
      let j = 0;
      for (j = 0; j < lst.length; j++) {
        const k = j;
        const invDets = inv.find(o => o.key == lst[k]);
        this.contents.push(invDets);
      }
    }
  }

  setText(sceneList) {
    let contDets = sceneList.Containers.find(o => o.name == this.name);
    this.description = contDets.description;
    this.search = contDets.search;
  }
}

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.setInteractive();

    scene.physics.add.existing(this);

    this.body.setSize(28, 32)
      .setOffset(0, 0)
      .setCollideWorldBounds(true);

    this.name = "Test Name";
    this.inventory = [];
    this.level = 1;
    this.sed = 0;
    this.sedp = 0;
    this.skill = 0;
    this.skillp = 0;
    this.dialogStage = 0;
    this.score = 0;
  }


  addObject(objData, name)
  {
    console.log(objData);
    let tmp = {
      name: name,
      properties: objData.properties
    }
    this.inventory.push(tmp);
    if (objData.properties.Class == "Buff")
    {
      if (objData.properties.Sed) this.sedp += objData.Sed;
      if (objData.properties.Skill) this.skill += objData.Skill;
     }
  }

  getGifts() {
    let grow = "";
    const self = this;
    this.inventory.filter(obj => obj.properties.Class == "Gift").forEach( function(obj) {
        grow = grow + "<tr class='g-clickable-row'><td class='gText1'>"+ obj.name+ "</td><td class='gText2'>" +
        obj.properties.Description + "</td></tr>";

    });
    return grow;
  }
}

export class NPC extends Phaser.GameObjects.PathFollower {
  constructor(scene, path, x, y, texture, frame) {
    super(scene, path, x, y, texture, frame);
    scene.add.existing(this);

    scene.physics.add.existing(this);

    this.body.setSize(28, 32)
      .setOffset(0, 0)
      .setCollideWorldBounds(true);

    this.collided = false;
  }

  extractData() {
    let self = this;
    this.data.each(function(parent, key, value) {
      self[key] = value;
    });
  }

  buildPath(map) {
    const nPCPath = map.findObject("Object Layer", obj => obj.name === this.npcPath);
    this.x = nPCPath.x;
    this.y = nPCPath.y;
    let path = new Phaser.Curves.Path(this.x, this.y);

    let lYoyo = false;
    const x = this.x;
    const y = this.y;
    if (nPCPath.polygon) {
      nPCPath.polygon.forEach(function(val, ix) {
        if (ix > 0) {
          path.lineTo(x + val.x, y + val.y);

        }
      });
      path.closePath();
    }

    if (nPCPath.polyline) {
      nPCPath.polyline.forEach(function(val, ix) {
        if (ix > 0) {
          path.lineTo(x + val.x, y + val.y);
        }
      });
      lYoyo = true;
    }

    this.setPath(path);
    this.startFollow({
      positionOnPath: true,
      duration: 6000,
      yoyo: lYoyo,
      repeat: -1,
      rotateToPath: false,
      verticalAdjust: false
    });
  }

  animate() {

    let dir = "down";
    if (this.pathDelta && this.npcPath) {
      let x = this.pathDelta.x;
      let y = this.pathDelta.y;

      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) dir = "right";
        else if (x < 0) dir = "left";
      } else {
        if (y > 0) dir = "down";
        else if (y < 0) dir = "up";
      }
      if (dir == "left") {
        this.anims.play("char2-left-walk", true);
      } else if (dir == "right") {
        this.anims.play("char2-right-walk", true);
      } else if (dir == "up") {
        this.anims.play("char2-back-walk", true);
      } else if (dir == "down") {
        this.anims.play("char2-front-walk", true);
      }
    } else {
      this.anims.stop();
    }

  }
  onEvent() {
    this.body.setVelocity(0);
    this.body.enable = true;

    if (this.npcPath) this.resumeFollow();
    this.setActive(true);
  }

  getPreAmble(textAssets) {
    let prompt = "You approach " + textAssets.Level[this.npcLevel] + " " + this.npcName + ".<br>";
    prompt = prompt + "She " + textAssets.nPCAspect[this.npcRel] + ". " + textAssets.nPCPreamble[this.npcRel] + ".<br>";
    prompt = prompt + "Do you want to speak to " + this.npcName + "?";
    return prompt;
  }

  getStats(textAssets) {
    let prompt = "Name: "+ this.npcName + "<br><br>";
    prompt = prompt + "Relationship: " + textAssets.nPCRelationship[this.npcRel] + "<br>";
    prompt = prompt + "Attitude: " + textAssets.nPCLst[this.npcLst] + "<br>";
    prompt = prompt + "Corruption: " + textAssets.nPCCor[this.npcCor];
    return prompt;
  }

  getOpts(textAssets) {
    let drow = "";
    const self = this;
    textAssets.playerDialog.forEach(function(entry) {
      if (entry.phase == self.npcRel || entry.phase - 1 == self.npcRel) {
        const nText = entry.text.replace("+n", self.npcName);
        let col = _getColour(entry.effect);
        drow = drow + "<tr class='d-clickable-row'><td class='dText' style ='color:" + col + "'>" +
          nText + "</td><td style = 'display:none' class = 'id'>" + entry.id + "</td></tr>";
      }
    });

    let arow = "";
    textAssets.playerAction.forEach(function(entry) {
      if (entry.phase == self.npcRel || entry.phase - 1 == self.npcRel) {
        const nText = entry.text.replace("+n", self.npcName);
        let col = _getColour(entry.effect);
        arow = arow + "<tr class='a-clickable-row'><td class='dText' style ='color:" + col + "'>" +
          nText + "</td><td style = 'display:none' class = 'id'>" + entry.id + "</td></tr>";
      }
    });
    return {
      dialog: drow,
      actions: arow
    };

    function _getColour(id) {
      switch (id) {
        case 0:
          return "pink";
        case 1:
          return "red";
        case 2:
          return "darkred";
      }
      return "white";
    }
    //TODO: Retrieve gift entries
  }

  calculateDialogResponse(response) {
    if (response.id.effect < this.npcLst - 1) {
      return {
        res: 0,
        ix: -1
      }
    }

    const ix = 2 * (this.npcLst == response.id.effect) + (this.npcLst - 1 == response.id.effect)
    const res = (this.npcLst + 1) * (this.npcLst == response.id.effect) +
      this.npcLst * (this.npcLst - 1 == response.id.effect);

    return {
      res: res,
      ix: ix
    };
  }

  processFailure() {
    if (this.npcRel < 3) {
      this.npcRel--;
      if (this.npcRel < 0) this.npcRel = 0;
      return;
    }
    this.npcCor--;
    if (this.npcCor < 0) {
      this.npcRel--;
      this.npcCor = 0;
    }
    return;

  }

  advance(player, textAssets) {
    if (this.nPCRel < 3) {
      let success = (this.npcRel == 0 && player.score > 3) || (this.npcRel == 1 && player.score > 6)
      success = success || (this.npcRel == 2 && player.score > 9)
      if (success) {
        this.npcRel++
        if (this.npcRel == 3) {
          let nText = textAssets.diagComplete.replace("+n", this.npcName);
          return nText;
        } else {
          let nText = textAssets.diagAdvance.replace("+n", this.npcName);
          return nText;
        }
      } else {
        let nText = textAssets.diagFailure.replace("+n", this.npcName);
        return nText;
      }
    } else {
      let success = (this.npcCor < 3 && player.score > 6) || (this.npcCor < 6 && player.score > 12)
      success = success || (this.npcCor < 12 && player.score > 18)
      if (success) {
        this.npcCor = this.npcCor + player.score / 2;
        if (this.npcCor > 12) {
          let nText = textAssets.roomAdvance.replace("+n", this.npcName);
          return nText;
        } else {
          let nText = textAssets.roomComplete.replace("+n", this.npcName);
          return nText;
        }
      } else {
        let nText = textAssets.roomFailure.replace("+n", this.npcName);
        return nText;
      }
    }
  }
}
