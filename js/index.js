import Phaser from "phaser";

import DialogClass from "./dialogClass.js";
const qDialog = new DialogClass();

import {
  Container,
  Player,
  NPC
} from "./objectClasses.js";

import {
  DialogDriver,
  ContainerDriver,
  ObjectDriver,
  EnchantDriver
} from "./dialogDriver.js";

var dd = new DialogDriver();
var cd = new ContainerDriver();
var od = new ObjectDriver();
var ed = new EnchantDriver();

import setAnims from "./anims.js";

var textAssets = require("../assets/textAssets.json");
var sceneList = require("../assets/scenes.json");

// TODO: Add this bit to the header maybe and set up titles and menu

qDialog.displayTitles();
var player;
var cursors;
var nPCs;
var containers;
var inv = [];

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "phaserblock",
  pixelArt: true,
  physics: { // Required for adding sprite
    default: "arcade",
    arcade: {
      gravity: {
        y: 0
      } // Top down game, so no gravity
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let controls;
var iRun = true;
var iRest = false;
var iRestScene = false;
var restObj = null;
var restScene = null;
var sceneix = 0;
var day = 1;
var dayCycle = 0;
let objLoader = [];
let showDebug = true; // test to see if this disables the debug view

function preload() {

  // Only run preload when the game is started
  // Need to use this section to load any saved game
  // in particular to initialise sceneix

  if(iRest) {
    restObj = JSON.parse(window.localStorage.getItem('gSave'));
    const lvl = "gLevel" + sceneix;
    const txtRestScene = window.localStorage.getItem(lvl);
    if (txtRestScene) {
      iRestScene = true;
      restScene = JSON.parse(txtRestScene);
    }
  }

  if (!iRun) return;

  iRun = false;

  let self = this;

  let fi = null;
  sceneList.Scenes.forEach(obj=> {
      fi = "../assets/" + obj.TiledMap;
      self.load.tilemapTiledJSON("map"+obj.Scene, fi);
  })

  sceneList.TileSets.forEach(obj => {
    fi = "../assets/" + obj.TileSet;
    self.load.image(obj.Reference, fi);
  });

  sceneList.Objects.forEach(obj => {
    fi = "../assets/" + obj.File;
    self.load.spritesheet(obj.Key, fi, {
      frameWidth: obj.frameWidth,
      frameHeight: obj.frameHeight
    });
    let li = {
      name: obj.Name,
      key: obj.Key,
      classType: Container
    };
    objLoader.push(li);
  })

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "../assets/new_atlas.png", "assets/new_atlas.json");

  //Add the scene to the dialogue class so it can pause and resume

  qDialog.scene = this.scene;
  qDialog.enchantments = textAssets.Enchantments;

}

function create() {

  // STEP 1 : Build the map

  const mkey = "mapScene" + (sceneix + 1);
  const map = this.make.tilemap({
    key: mkey
  });

  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)

  map.tilesets.forEach(ts => {
    map.addTilesetImage(ts.name, ts.Reference );
  });

  // Extract the objects from the TileSet

  map.tilesets.forEach(function (obj, ix){
    if (obj.name == "Objects"){

      const td = obj.tileData;
      const tk = Object.keys(td);
      const tv = Object.values(td);
      const tp = obj.tileProperties;

      tk.forEach(function (ref, ix1) {
        const iref = tk[ix1];
        const iname = tv[ix1].type;
        const props = tp[iref];

        inv.push({ key: iref, name: iname , properties: props } );
      });
    }
  });


  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createLayer("Base Layer", map.tilesets, 0, 0);
  const tileObjLayer = map.createLayer("Tile Objects", map.tilesets, 0, 0);

  // TODO: Add more layers. In particular above layer

  //const textAssets = this.cache.json.get('textData');

  // Now create the various Objects. The process below creates sprites with the
  // key representing the sprite setup in the preload function.

  const objects = map.getObjectLayer("Object Layer");

  // Create containers. Each container has a key to an icon file. These could
  // be used both to animate icons and to consolidate icons into one file
  // (further params required to call)
  // classType extends sprite

  containers = map.createFromObjects("Object Layer", objLoader);

  // You need to add physics to the sprites so they can interact with the
  // player.
  let i = 0;
  containers.forEach(container => {

    // extract the additional data from the map file
    // currently this is only objects. Add additional text
    // from the text assets and enable the sprites
    container.extractData(inv);
    container.setText(sceneList);
    if (container.contentsList && iRestScene) {
      if (!restScene.containers[i].contentsList) {
        container.contentsList = "";
        container.contents = null;
      }
    }
    i++;
    this.physics.world.enable(container);
  });

  // TODO: Could use the same process above for objects if
  // objects are allowed on the map

  // Similar to containers but the NPC class type is a PathFollower
  // which is derived from a sprite. If there is more than one nPC type
  // then the statement below could still load them in one go.

  nPCs = map.createFromObjects("Object Layer", {
    name: "NPC",
    key: "none",
    classType: NPC
  });

  // Similar to containers but this time set the icon manually
  // nPCs might have a path property. If so this is extracted from a
  // polygon drawn on the map. Note some indication of the texture would
  // be needed if there are NPCs of different types.

  nPCs.forEach(nPC => {
    nPC.setTexture("atlas", "char2-front");
    nPC.extractData(iRest, restObj);
    if (nPC.npcPath) {
      nPC.buildPath(map);
    }
  });

  // TODO: Potentially add colliders for other layers

  belowLayer.setCollisionByProperty({
    collides: true
  });

  tileObjLayer.setCollisionByExclusion([-1]);
  if (iRestScene) {
    restScene.objects.forEach(function (obj){
      const t = tileObjLayer.findByIndex(obj);
      t.resetCollision(true);
      t.setVisible(false);
    });
  }


  // Get the spawn point from the map file and create the player sprite

  const spawnPoint = map.findObject("Object Layer", obj => obj.name === "Spawn Point");

  // STEP 2 : Construct the player

  player = new Player(this, spawnPoint.x, spawnPoint.y, "atlas", "char1-front");

  // If we're in restore mode, get the previous player settings

  if (iRest) player.restore(restObj.player);

  // Link up the display to the player

  qDialog.player = player;
  qDialog.updateStats(player);
  qDialog.updateControls(player);
  qDialog.updateDayCycle(day,textAssets.dayCycle[dayCycle].name);

  // Watch the player for collisions with blocking tiles, objects, containers and NPCs
  this.physics.add.collider(player, belowLayer);
  this.physics.add.collider(player, tileObjLayer, _collideObject, null, this);
  this.physics.add.overlap(player, containers, _collideContainer, null, this);
  this.physics.add.collider(player, nPCs, _collideNPC, null, this);

  // Create the walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  setAnims(this.anims);

  // STEP 3 : Set up camera
  // Phaser supports multiple cameras, but you can access the default camera like this:
  var camera = this.cameras.main;
  camera.alpha = textAssets.dayCycle[dayCycle].alpha;

  camera.startFollow(player);
  // Make sure the camera borders are aliged to the map and stop bleeding when
  // scrolling.
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels).setRoundPixels(true);

  // STEP 4 : Set up keyboard
  // Set up the arrows to control the camera
  cursors = this.input.keyboard.createCursorKeys();

  // Debug graphics
  this.input.keyboard.once("keydown-D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add
      .graphics()
      .setAlpha(0.75)
      .setDepth(20);
    belowLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });

  // set up an emitter to catch events coming back from the driver objects

  let dialogEmitter = new Phaser.Events.EventEmitter();
  qDialog.emitter = dialogEmitter;

  // Enchant dialogue doesn't have a driver, it's just part of the dialogue class
  ed.init(dialogEmitter);
  qDialog.eDriver = ed;

  dialogEmitter.addListener("finCon", _catchFin);
  dialogEmitter.addListener("finNPC", _catchNPC);
  dialogEmitter.addListener("finObj", _catchObj);
  dialogEmitter.addListener("transit", _catchTransit);
  dialogEmitter.addListener("enchant", _catchEnchant);

  function _collideContainer(player, container) {
    pauseScene(player);
    cd.init(player, container, dialogEmitter);
    cd.stepOn(qDialog, textAssets, "n");
  }

  function _catchFin(detail) {
    detail = null;
    resumeScene(player);
  }

  function _collideNPC(player, nPC) {
    // disable player and nPC
    // call plugin init (qDialog player, nPC, textAssets)
    // from here flow switches between plugin and qDialog
    nPC.pauseFollow();
    nPC.setActive(false);
    nPC.body.enable = false;
    pauseScene(player);

    dd.init(player, nPC, dialogEmitter, textAssets);
    dd.stepOn(qDialog, "n");
  }

  function _catchNPC(detail) {
    const timedEvent = detail.nPC.scene.time.delayedCall(6000, detail.nPC.onEvent, [], detail.nPC);
    detail = null;
    //  player.scene.scene.resume();
    resumeScene(player);
  }

  function _collideObject(player, tile) {
    pauseScene(player);
    od.init(player, tile, dialogEmitter);
    od.stepOn(qDialog, textAssets, "n");
  }

  function _catchObj(detail) {
    detail = null;
    resumeScene(player);
  }

  function _catchTransit(detail){
    // Need to save player, NPC, container and object details
    collectData(tileObjLayer, map.width, map.height);
    sceneix = detail.container.transit;
    iRest = true;
    restartScene(detail.container.scene.scene);
  }

  function _catchEnchant(detail){
    collectData(tileObjLayer, map.width, map.height);
    if (detail) {
      dayCycle = (dayCycle + 1) % 5;
      if (dayCycle == 0) day++;
      player.x = spawnPoint.x;
      player.y = spawnPoint.y;
      camera.alpha = textAssets.dayCycle[dayCycle].alpha;
      qDialog.updateDayCycle(day,textAssets.dayCycle[dayCycle].name);
      resumeScene(player);
    }
  }

}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();

  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("char1-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("char1-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("char1-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("char1-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "char1-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "char1-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "char1-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "char1-front");
  }

  nPCs.forEach(nPC => {
    nPC.animate();
  });
}

function pauseScene(player) {
  player.body.enable = false;
  player.scene.scene.pause();
}

function resumeScene(player) {
  player.scene.scene.resume();
  player.body.setVelocity(0);
  player.body.enable = true;
}

function restartScene(scene){
  scene.restart();
}

function collectData(otiles, wid, hgt){

  // Store all the game data in local localStorage
  // There's one key for the general data and one for the Level

  let saveObj = {day: day, dayCycle: dayCycle, scene: {id: sceneix}};
  saveObj.player = player.collectData();
  saveObj.nPCs = [];
  nPCs.forEach(nPC => {
    nPC.collectData(saveObj.nPCs);
  });

  let saveSceneObj ={}
  saveSceneObj.scene = sceneix;
  saveSceneObj.containers = [];
  containers.forEach(container => {
    container.collectData(saveSceneObj.containers);
  });
  saveSceneObj.objects = [];

  otiles.forEachTile(_chkTile, this, 0, 0, wid, hgt,{isNotEmpty: true});

  function _chkTile(t) {
    if(!t.visible) saveSceneObj.objects.push(t.index);
  }

  window.localStorage.setItem('gSave', JSON.stringify(saveObj));
  const lvl = "gLevel" + sceneix;
  window.localStorage.setItem(lvl, JSON.stringify(saveSceneObj));

}
