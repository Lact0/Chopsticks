window.onresize = changeWindow;

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  overlay = document.getElementById("overlay");
  text = document.getElementById("topText");
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  lineHeight = parseInt(height / 6);
  oppStart = parseInt(height / 10);
  sameStart = height - lineHeight - oppStart;
  space = width / 50;
  ctx.clearRect(0, 0, width, height);
  game.state.draw();
  drawSelected();
}

function startGame(turn = 0) {
  //Set to "block" to turn on
  text.style.display = 'block';
  overlay.style.display = "none";
  player = turn;
  ai = (turn + 1) % 2;
  game = new Game();
}

function reset() {
  text.style.display = 'none';
  overlay.style.display = "block";
  game = null;
}

function aiDecide(board, maxPlayer, depth = 5) {
  const moves = board.getMoves();
  if(board.checkWin() || moves.length == 0 || depth == 0) {
    return [false, board.val];
  }
  let ext;
  let bestMove;
  for(let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const newBoard = board.makeMove(move);
    const outcome = aiDecide(newBoard, !maxPlayer, depth - 1);
    if(ext == null) {
      bestMove = move;
      ext = outcome[1];
    }
    if(maxPlayer) {
      if(outcome[1] > ext) {
        bestMove = move;
        ext = outcome[1];
      }
    } else {
      if(outcome[1] < ext) {
        bestMove = move;
        ext = outcome[1];
      }
    }
  }
  return [bestMove, ext];
}

function keyPress(key) {
  if(key.keyCode != 32) {
    return;
  }
}

function drawSelected() {
  const color = 'rgba(255,255,255,.2)';
  ctx.fillStyle = color;
  ctx.fillRect(selected[0] * width / 2, height / 2, width / 2, height / 2);
  ctx.fillRect(selected[1] * width / 2, 0, width / 2, height / 2);
}

function leftClick() {
  if(game == null || game.toMove != player) {
    return;
  }
  let x = event.clientX;
  let y = event.clientY;
  x = parseInt(x / (width / 2));
  y = parseInt(y / (height / 2));
  selected[(y + 1) % 2] = x;
  if(selected[0] >= 0 && selected[1] >= 0 && game.state.arr[0][selected[0]] != 0 && game.state.arr[1][selected[1]] != 0) {
    console.log(selected);
    game.makeMove(selected);
  } else {
    ctx.clearRect(0, 0, width, height);
    game.state.draw();
    drawSelected();
  }
}
