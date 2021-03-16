export class Container extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.description = "";
    this.search = "";
    this.contentsList = null;
    this.contents=null;
  }

  extractData(textAssets) {

    if (this.contentsList) {
      const lst = this.contentsList.split(",");
      this.contents=[];
      let j = 0;
      for (j = 0; j < lst.length; j++) {
        const k = j;
        const invDets = textAssets.inventory.find(o => o.key == lst[k]);
        this.contents.push(invDets);
      }
    }
  }

  setText(textAssets) {
    let contDets = textAssets.containers.find(o => o.name == this.name);
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
  }

  addInventory(inv)
  // adds inventory
  {
    this.inventory.push(inv);
    this.sedp = this.sedp + inv.sed;
    this.skillp = this.skillp + inv.skill;
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

    let dir = "left";
    if (this.pathDelta) {
      let x = this.pathDelta.x;
      let y = this.pathDelta.y;

      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0) dir = "right";
        else if (x < 0) dir = "left";
      } else {
        if (y > 0) dir = "down";
        else if (y < 0) dir = "up";
      }
    }
    if (dir == "left") {
      this.anims.play("char2-left-walk", true);
    } else if (dir == "right") {
      this.anims.play("char2-right-walk", true);
    } else if (dir == "up") {
      this.anims.play("char2-back-walk", true);
    } else if (dir == "down") {
      this.anims.play("char2-front-walk", true);
    } else {
      this.anims.stop();

    }

  }
  onEvent() {
    this.body.enable = true;
    this.resumeFollow();
  }

  getPreAmble(textAssets) {
    let prompt = "You approach " + textAssets.Level[this.npcLevel] + " " + this.npcName + ".<br>";
    prompt = prompt + "She " + textAssets.nPCAspect[this.npcRel] + ". " + textAssets.nPCPreamble[this.nPCRel] + ".<br>";
    prompt = prompt + "Relationship: " + textAssets.nPCRelationship[this.npcRel] + "<br>";
    prompt = prompt + "Attitude: " + textAssets.nPCLst[this.npcLst] + "<br>";
    prompt = prompt + "Corruption: " + textAssets.nPCCor[this.npcCor];
    return prompt;
  }

  getOpts(textAssets) {
    let drow = "";
    textAssets.playerDialog.forEach(function(entry) {
      if (entry.phase == this.npcLst || entry.phase - 1 == this.npcLst) {
        const nText = entry.text.replace("+n", this.npcName);
        drow = drow + "<tr><td>" + entry.text + "</td><td>" + entry.effect + "</td><td>" + entry.respSet + "</td></tr>";
      }
    });

    let arow = "";
    textAssets.playerActions.forEach(function(entry) {
      if (entry.phase == this.npcLst || entry.phase - 1 == this.npcLst) {
        const nText = entry.text.replace("+n", this.npcName);
        arow = arow + "<tr><td>" + entry.text + "</td><td>" + entry.effect + "</td><td>" + entry.respSet + "</td></tr>";
      }
    });
    return {
      dialog: drow,
      actions: arow
    };
    //TODO: Retrieve gift entries
  }

  getResult(success) {
    //TODO:Retrieve appropriate response
  }

  handleFailure() {
    //TODO: Update nPC stats on failure
  }


}
