export default function setAnims(anims) {
  anims.create({
    key: "char1-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char1-left-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char1-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char1-right-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char1-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char1-front-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char1-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char1-back-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char2-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char2-left-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char2-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char2-right-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char2-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char2-front-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "char2-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "char2-back-walk.",
      start: 0,
      end: 5,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
}
