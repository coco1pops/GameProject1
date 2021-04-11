import Phaser from "phaser";

import DialogClass from "./dialogClass.js";
const qDialog = new DialogClass();

import {Container, Player, NPC} from "./objectClasses.js";

import {DialogDriver, ContainerDriver} from "./dialogDriver.js";

import setAnims from "./anims.js";

var textAssets = require("../assets/textAssets.json");
var sceneList = require("../assets/scenes.json");

// TODO: Add this bit to the header maybe and set up titles and menu

qDialog.displayTitles();
var player;
var cursors;
var nPCs;

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
let sceneix = 0;
let objLoader = [];
let showDebug = true; // test to see if this disables the debug view

function preload() {
  let fi = "../assets/" + sceneList.Scenes[sceneix].Image;
  this.load.image("tiles", fi);
  fi = "../assets/" + sceneList.Scenes[sceneix].TiledMap;
  this.load.tilemapTiledJSON("map", fi);

  let self = this;
  let objList = sceneList.Objects.filter(obj=> obj.Scene == sceneList.Scenes[sceneix].Scene);
  objList.forEach(obj => {
    fi = "../assets/" + obj.File;
    self.load.spritesheet(obj.Key,fi, {
      frameWidth: obj.frameWidth, frameHeight: obj.frameHeight
    });
    let li = {name: obj.Name, key: obj.Key, classType: Container};
    objLoader.push(li);
  })

  // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
  // the player animations (walking left, walking right, etc.) in one image. For more info see:
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  // If you don't use an atlas, you can do the same thing with a spritesheet, see:
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  this.load.atlas("atlas", "../assets/new_atlas.png", "assets/new_atlas.json");

  //this.load.json('textData', '../assets/text_assets.json');

}

function create() {

  // STEP 1 : Build the map
  // Map is 50 tiles wide and high so 1600 x 1600 pixels


  const map = this.make.tilemap({
    key: "map"
  });

  this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tmw_desert_spacing", "tiles");

  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createStaticLayer("Base Layer", tileset, 0, 0);
  // TODO: Add more layers. In particular above layer

  //const textAssets = this.cache.json.get('textData');

  // Now create the various Objects. The process below creates sprites with the
  // key representing the sprite setup in the preload function.

  const objects = map.getObjectLayer("Object Layer");

  // Create containers. Each container has a key to an icon file. These could
  // be used both to animate icons and to consolidate icons into one file
  // (further params required to call)
  // classType extends sprite

  var containers = map.createFromObjects("Object Layer", objLoader);

  // You need to add physics to the sprites so they can interact with the
  // player.

  containers.forEach(container => {

    // extract the additional data from the map file
    // currently this is only objects. Add additional text
    // from the text assets and enable the sprites
    container.extractData(textAssets);
    container.setText(sceneList);
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
    nPC.extractData();
    if (nPC.npcPath) {
      nPC.buildPath(map);
    }
  });

  // TODO: Potentially add colliders for other layers

  belowLayer.setCollisionByProperty({
    collides: true
  });

  // Get the spawn point from the map file and create the player sprite

  const spawnPoint = map.findObject("Object Layer", obj => obj.name === "Spawn Point");

  // TODO: Other game assets might include: Doors and Exit Points. Doors would
  // get deleted if the player has a key. Exit Points would load up the next scene

  // STEP 2 : Construct the player

  player = new Player(this, spawnPoint.x, spawnPoint.y, "atlas", "char1-front");
  qDialog.updateStats(player);

  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, belowLayer);
  this.physics.add.overlap(player, containers, _collideContainer, null, this);
  this.physics.add.collider(player, nPCs, _collideNPC, null, this);

  // Create the walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  setAnims(this.anims);

  // STEP 3 : Set up camera
  // Phaser supports multiple cameras, but you can access the default camera like this:
  var camera = this.cameras.main;
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

  var dialogEmitter = new Phaser.Events.EventEmitter();
  qDialog.emitter=dialogEmitter;
  dialogEmitter.addListener("finCon", _catchFin);
  dialogEmitter.addListener("finNPC", _catchNPC);

  function _collideContainer(player, container) {
    // TODO Pause Scene might be better
    player.body.setVelocity(0);
    player.body.enable = false;
//    this.scene.pause();
    const cd = new ContainerDriver();
    cd.init(player, container, dialogEmitter);
    cd.stepOn(qDialog, textAssets, "n");
  }

  function _catchFin(detail){
    detail = null;
    player.body.enable = true;
  }

  function _catchNPC(detail){
      const timedEvent = detail.nPC.scene.time.delayedCall(6000, detail.nPC.onEvent, [], detail.nPC);
      detail = null;
    //  player.scene.scene.resume();
      player.body.enable = true;
    }


  function _collideNPC(player,nPC) {
    // disable player and nPC
    // call plugin init (qDialog player, nPC, textAssets)
    // from here flow switches between plugin and qDialog
    /* qDialog.nPCDialog(player, nPC, textAssets); */

    player.body.setVelocity(0);
    nPC.body.enable = false;
    nPC.pauseFollow();
    nPC.setActive(false);

    const dd = new DialogDriver();

    dd.init(player, nPC, dialogEmitter, textAssets);
    dd.stepOn(qDialog, "n");
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
