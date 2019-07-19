const readline = require("readline");
const Game = require("./Game");

const newline = "\n";
const game = new Game(5, 5);

// console.log(newline);
// game.printIntMatrix();

console.log(newline);
game.printExtMatrix();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "\nEnter cell num (e.g. A3, B2) or Q to quit: "
});

rl.prompt();

rl.on("line", (line) => {
  const input = line.trim().toUpperCase();
  if (input === "Q") {
    console.log("\n");
    rl.close();
    process.exit(0);
  }

  if (game.openCell(input)) {
    console.log(newline);
    game.printExtMatrix();

    if (game.gameOver) {
      if (game.steppedOnMine) {
        console.log("Boom! You stepped on a mine. YOU LOSE :(");
      } else {
        console.log("Hoooray! YOU WIN :)");
      }

      console.log("\n");
      rl.close();
      process.exit(0);
    }
  } else {
    console.log("\nInvalid cell num! Try again\n");
  }
  rl.prompt();
});
