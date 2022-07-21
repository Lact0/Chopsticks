//Constants
let width = window.innerWidth;
let height = window.innerHeight;
const emptyHandWeight = 7;
const poss = [[0, 0], [0, 1], [1, 0], [1, 1]];
let lineHeight = parseInt(height / 6);
let oppStart = parseInt(height / 10);
let sameStart = height - lineHeight - oppStart;
let space = width / 50;
let selected = [-1, -1];
let player = 0;
let ai = 1;
let canvas;
let ctx;
let game;
let overlay;
let text;

//Useful Functions
function max(n1, n2) {
  if(n1 > n2) {
    return n1;
  }
  return n2;
}

function min(n1, n2) {
  if(n1 < n2) {
    return n1;
  }
  return n2;
}

function randColor() {
  return 'rgba(' + rand(0,255) + ',' + rand(0,255) + ',' + rand(0,255) + ')';
}

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function radToDeg(rad) {
  return rad / Math.PI * 180;
}

function equals(arr1, arr2) {
  if(arr1.length != arr2.length) {
    return false;
  }
  for(let i = 0; i < arr1.length; i++) {
    if(arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

function copy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function drawLine(x1, y1, x2, y2, style = 'white', r = 1) {
  ctx.strokeStyle = style;
  ctx.lineWidth = r;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

//Classes
class Vector {
  constructor(x = 0, y = 0, x0 = 0, y0 = 0) {
    this.x = x - x0;
    this.y = y - y0;
    this.getMag();
  }

  getMag() {
    this.mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    this.x /= this.mag;
    this.y /= this.mag;
    this.getMag();
  }

  setMag(mag) {
    this.normalize();
    this.x *= mag;
    this.y *= mag;
    this.mag = mag;
  }

  limit(mag) {
    if(this.mag > mag) {
      this.setMag(mag);
    }
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.getMag();
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.getMag();
  }
}

class Board {
  constructor(inp = false) {
    if(!inp) {
      this.arr = [[1, 1], [1, 1]] //Chopsticks arr;
      this.toMove = player;
    } else {
      const oldBoard = inp[0];
      const move = inp[1];
      this.player = oldBoard.player;
      this.toMove = (oldBoard.toMove + 1) % 2;
      this.arr = copy(oldBoard.arr);
      //NEW MOVE MECHANISM
      if(move[0] == 2) {
        this.arr[oldBoard.toMove] = move[1];
      } else {
        this.arr[this.toMove][move[1]] += this.arr[oldBoard.toMove][move[0]];
        this.arr[this.toMove][move[1]] %= 5;
      }
    }
    this.generateVal();
  }

  draw() {
    ctx.clearRect(0, 0, width, height);
    drawLine(parseInt(width / 2), 0, parseInt(width / 2), height, 'white', 5);
    for(let i = 0; i < this.arr[0][0]; i++) {
      const xpos = parseInt(width / 2) - i * space - space * 2;
      drawLine(xpos, sameStart, xpos, sameStart + lineHeight, 'white', 2);
    }
    for(let i = 0; i < this.arr[0][1]; i++) {
      const xpos = parseInt(width / 2) + i * space + space * 2;
      drawLine(xpos, sameStart, xpos, sameStart + lineHeight, 'white', 2);
    }
    for(let i = 0; i < this.arr[1][0]; i++) {
      const xpos = parseInt(width / 2) - i * space - space * 2;
      drawLine(xpos, oppStart, xpos, oppStart + lineHeight, 'white', 2);
    }
    for(let i = 0; i < this.arr[1][1]; i++) {
      const xpos = parseInt(width / 2) + i * space + space * 2;
      drawLine(xpos, oppStart, xpos, oppStart + lineHeight, 'white', 2);
    }
  }

  getMoves() {
    let moves = [];
    for(const move of poss) {
      if(this.arr[this.toMove][move[0]] != 0 && this.arr[this.toMove][move[1]] != 0) {
        moves.push(move);
      }
    }
    let playerr = copy(this.arr[this.toMove]);
    const unsorted = copy(this.arr[this.toMove]);
    const z = playerr[0];
    playerr[0] = playerr[1];
    playerr[1] = z;
    const sum = playerr[0] + playerr[1];
    for(let i = 0; i <= sum; i++) {
      const newMove = [2, [(i) % 5, (sum - i) % 5]];
      if(!equals(newMove[1], playerr) && !equals(newMove[1], unsorted)) {
        moves.push(newMove);
      }
    }
    return moves;
  }

  makeMove(move) {
    const newBoard = new Board([this, move]);
    return newBoard;
  }

  checkWin() {
    const p1 = this.arr[0];
    const p2 = this.arr[1];
    if(p1[0] == 0 && p1[1] == 0) {
      return 2;
    }
    if(p2[0] == 0 && p2[1] == 0) {
      return 1;
    }
    return false;
  }

  generateVal() {
    const winner = this.checkWin();
    this.val = 0;
    if(winner == 1) {
      this.val = 100;
    } else if(winner == 2) {
      this.val = -100;
    } else {
      this.val += this.arr[0][0] + this.arr[0][1];
      this.val -= this.arr[1][0] + this.arr[1][1];
      if(this.arr[0][0] == 0 || this.arr[0][1] == 0) {
        this.val -= emptyHandWeight;
      }
      if(this.arr[1][0] == 0 || this.arr[1][1] == 0) {
        this.val += emptyHandWeight;
      }
    }
  }

}

class Game {
  constructor(turn = 0) {
    this.state = new Board();
    this.toMove = 0;
    this.state.draw();
    this.ended = false;
    if(player == 1) {
      text.innerHTML = 'Ai Turn';
      let _this = this;
      setTimeout(function() {
        _this.aiMove();
      }, 1000);
    } else {
      text.innerHTML = 'Player Turn';
    }
  }

  makeMove(move, isPlayer = true) {
    selected = [-1, -1];
    if(this.ended) {
      return;
    }
    if((isPlayer && player == this.toMove) || !isPlayer) {
      const newState = this.state.makeMove(move);
      if(newState) {
        this.state = newState;
        this.toMove = (this.toMove + 1) % 2;
        this.state.draw();
        if(this.toMove != player) {
          text.innerHTML = 'Ai Turn';

        } else {
          text.innerHTML = 'Player Turn';
        }
        this.checkEnd();
        if(this.toMove != player) {
          let _this = this;
          setTimeout(function() {
            _this.aiMove();
          }, 1000);
        }
      }
    }
  }

  checkEnd() {
    if(this.state.checkWin()) {
      if(this.state.checkWin() == 0) {
        text.innerHTML = 'You Win!';
      } else {
        text.innerHTML = 'You Lose!';
      }
      this.ended = true;
      setTimeout(reset, 1000);
    }
  }

  aiMove() {
    console.log(this.state.getMoves());
    // this.makeMove(this.state.getMoves()[0], false);
    // return;
    let move;
    //GIVE IN THE BOARD, NOT THE GAME STATE
    move = aiDecide(this.state, false);
    if(!move[0]) {
      return;
    }
    move = move[0];
    this.makeMove(move, false);
  }
}
