import kaboom from "kaboom";

const k = kaboom();

k.loadSprite("bean", "sprites/bean.png");

k.onClick(() => k.addKaboom(k.mousePos()));
// simple rpg style walk and talk

kaboom({
  background: [255, 64, 0],
  scale: 0.5, // Adjust this value to zoom out (less than 1) or zoom in (greater than 1)
});

loadSprite("bag", "/sprites/bag.png");
loadSprite("btfly", "/sprites/btfly.png");
loadSprite("table", "/sprites/table.png");
loadSprite("apple", "/sprites/apple.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("brick", "/sprites/brick.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("door", "/sprites/door.png");
loadSprite("key", "/sprites/key.png");
loadSprite("bean", "/sprites/bean.png");

const API_URL = "http://localhost:3000";

export async function fetchHumans() {
  try {
    const response = await fetch(`${API_URL}/humans`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    throw new Error("Failed to fetch characters");
  } catch (error) {
    console.error("Error fetching characters:", error);
    return [];
  }
}

scene("main", async (levelIdx) => {
  const SPEED = 1020;

  // Fetch characters from the server
  const charactersList = await fetchHumans();

  // Convert characters array to the format your game expects
  const characters = {};

  charactersList.forEach((char) => {
    characters[char.char] = {
      id: char.id,
      name: char.name,
      sprite: char.sprite,
      msg: "Hi Bean! You should get that key!",
    };
  });

  // level layouts
  const levels = [
    [
      "=======================================",
      "|         =     = =        =          =",
      "=    =       c             =          =",
      "================      ==   ==  ========",
      "= -- = -- = -- =      ==              =",
      "=    =    =    =                 =   -=",
      "=    =    =    =         b       =  --=",
      "===  ===  ===  ===         ============",
      "=                =                    =",
      "=                ====  e     ---------=",
      "=------  ---     ====                 =",
      "=                            ---------=",
      "=--  -------                          =",
      "=              =                      =",
      "=------  ---   =                      =",
      "=              =      =       =    d  =",
      "=--  -------   =-     =       =--     =",
      "=              =- c   =   --  =---$   =",
      "===================   =================",
      "                    @                  ",
    ],
    [
      "==========================================",
      "=-----------       =                     =",
      "=                  =                     =",
      "=-----------       =               =     =",
      "=                  =               =     =",
      "=-----------       ==========      =     =",
      "=   $              =        =      =======",
      "=             c    =        =      =======",
      "=                  ==========      =     =",
      "=======                            =     =",
      "=                                        =",
      "=       =          =                  ---=",
      "=       =          ======                =",
      "=       =         @ ==========        ---=",
      "=================|========================",
    ],
  ];

  const level = addLevel(levels[levelIdx], {
    tileWidth: 64,
    tileHeight: 64,
    pos: vec2(64, 64),
    tiles: {
      "=": () => [
        sprite("brick"),
        area(),
        body({ isStatic: true }),
        anchor("center"),
      ],
      "-": () => [
        sprite("table"),
        area(),
        body({ isStatic: true }),
        anchor("center"),
      ],
      $: () => [sprite("key"), area(), anchor("center"), "key"],
      "@": () => [sprite("bean"), area(), body(), anchor("center"), "player"],
      "|": () => [
        sprite("door"),
        area(),
        body({ isStatic: true }),
        anchor("center"),
        "door",
      ],
    },
    // any() is a special function that gets called everytime there's a
    // symbole not defined above and is supposed to return what that symbol
    // means
    wildcardTile(ch) {
      const char = characters[ch];

      if (char) {
        return [
          sprite(char.sprite),
          area(),
          body({ isStatic: true }),
          anchor("center"),
          "character",
          { msg: char.msg, name: char.name },
        ];
      }
    },
  });

  // get the player game obj by tag
  const player = level.get("player")[0];

  function addDialog() {
    const h = 160;
    const pad = 16;
    const bg = add([
      pos(0, height() - h),
      rect(width(), h),
      color(0, 0, 0),
      z(100),
    ]);
    const txt = add([
      text("", {
        width: width(),
      }),
      pos(0 + pad, height() - h + pad),
      z(100),
    ]);
    bg.hidden = true;
    txt.hidden = true;
    return {
      say(t) {
        txt.text = t;
        bg.hidden = false;
        txt.hidden = false;
      },
      dismiss() {
        if (!this.active()) {
          return;
        }
        txt.text = "";
        bg.hidden = true;
        txt.hidden = true;
      },
      active() {
        return !bg.hidden;
      },
      destroy() {
        bg.destroy();
        txt.destroy();
      },
    };
  }

  let hasKey = false;
  const dialog = addDialog();

  player.onCollide("key", (key) => {
    destroy(key);
    hasKey = true;
  });

  player.onCollide("door", () => {
    if (hasKey) {
      if (levelIdx + 1 < levels.length) {
        go("main", levelIdx + 1);
      } else {
        go("win");
      }
    } else {
      dialog.say("you got no key!");
    }
  });

  // talk on touch
  player.onCollide("character", (ch) => {
    console.log(ch);

    dialog.say(`${ch.name}: ${ch.msg}`);
  });

  const dirs = {
    left: LEFT,
    right: RIGHT,
    up: UP,
    down: DOWN,
  };

  for (const dir in dirs) {
    onKeyPress(dir, () => {
      dialog.dismiss();
    });
    onKeyDown(dir, () => {
      player.move(dirs[dir].scale(SPEED));
    });
  }
});

scene("win", () => {
  add([text("You Win!"), pos(width() / 2, height() / 2), anchor("center")]);
});

go("main", 0);
