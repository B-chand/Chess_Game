// ============================================
// GAME STATE & FLOW CONTROLLER
// ============================================

const Game = {

  // Game state
  state: {
    turn: 'w', // 'w' for white, 'b' for black
    selectedpiece: '',
    highlighted: []
  },

  // Initialize the game
  init: function() {
    Board.setup();
    Game._attachEventHandlers();
  },

  // Show available moves for a selected piece
  showMoveOptions: function(selectedpiece) {
    // Clear previous highlights
    if (Game.state.highlighted.length != 0) {
      Game.toggleHighlight(Game.state.highlighted);
    }

    // Get valid moves and highlight them
    const options = Moves.getOptions(selectedpiece);
    Game.state.highlighted = options.slice(0);
    Game.toggleHighlight(options);
  },

  // Move a piece to a new position
  movePiece: function(pieceName, fromPosition, toPosition) {
    const piece = Board.pieces[pieceName];

    // Update piece position and moved status
    Board.clearCell(fromPosition);
    Board.setPiece(toPosition, pieceName);
    piece.position = toPosition;
    piece.moved = true;
  },

  // Capture an opponent piece
  capturePiece: function(capturedPieceName, targetPosition, attackingPieceName, attackingPosition) {
    // Move attacking piece to target
    Board.clearCell(attackingPosition);
    Board.setPiece(targetPosition, attackingPieceName);
    Board.pieces[attackingPieceName].position = targetPosition;
    Board.pieces[attackingPieceName].moved = true;

    // Mark captured piece
    Board.pieces[capturedPieceName].captured = true;
  },

  // Handle castling move
  castle: function(kingName, kingFrom, kingTo, rookName, rookFrom, rookTo) {
    // Move king
    Board.clearCell(kingFrom);
    Board.setPiece(kingTo, kingName);
    Board.pieces[kingName].position = kingTo;
    Board.pieces[kingName].moved = true;

    // Move rook
    Board.clearCell(rookFrom);
    Board.setPiece(rookTo, rookName);
    Board.pieces[rookName].position = rookTo;
    Board.pieces[rookName].moved = true;
  },

  // End current turn and switch to other player
  endTurn: function() {
    // Toggle highlighted coordinates
    Game.toggleHighlight(Game.state.highlighted);
    Game.state.highlighted.length = 0;
    Game.state.selectedpiece = '';

    // Switch turn
    if (Game.state.turn == 'w') {
      Game.state.turn = 'b';
      Game._updateTurnDisplay("It's Blacks Turn");
    } else if (Game.state.turn == 'b') {
      Game.state.turn = 'w';
      Game._updateTurnDisplay("It's Whites Turn");
    }
  },

  // Toggle highlight class on coordinates
  toggleHighlight: function(options) {
    options.forEach(function(element) {
      $('#' + element).toggleClass("green shake-little neongreen_txt");
    });
  },

  // Update turn display with animation
  _updateTurnDisplay: function(message) {
    $('#turn').html(message);
    $('#turn').addClass('turnhighlight');
    window.setTimeout(function() {
      $('#turn').removeClass('turnhighlight');
    }, 1500);
  },

  // Attach click handlers to game board
  _attachEventHandlers: function() {
    $('.gamecell').click(function(e) {
      Game._handleCellClick(e);
    });

    // Disable right-click context menu
    $('body').contextmenu(function(e) {
      e.preventDefault();
    });
  },

  // Handle cell click event
  _handleCellClick: function(e) {
    const clickedCell = e.target.id;
    const clickedPiece = $(e.target).attr('chess');

    // Case 1: Select a piece to move
    if (Game.state.selectedpiece == '' && clickedPiece.slice(0, 1) == Game.state.turn) {
      Game.state.selectedpiece = clickedCell;
      Game.showMoveOptions(clickedPiece);
    }

    // Case 2: Move selected piece to empty cell
    else if (Game.state.selectedpiece != '' && clickedPiece == 'null') {
      Game._handleMoveOrCastle(clickedCell);
    }

    // Case 3: Capture opponent piece
    else if (Game.state.selectedpiece != '' && 
             clickedPiece != 'null' && 
             clickedCell != Game.state.selectedpiece && 
             Utils.getPieceColor(Game._getSelectedPieceName()) != Utils.getPieceColor(clickedPiece)) {
      Game._handleCapture(clickedCell, clickedPiece);
    }

    // Case 4: Select different piece of same color
    else if (Game.state.selectedpiece != '' && 
             clickedPiece != 'null' && 
             clickedCell != Game.state.selectedpiece && 
             Utils.getPieceColor(Game._getSelectedPieceName()) == Utils.getPieceColor(clickedPiece)) {
      Game.toggleHighlight(Game.state.highlighted);
      Game.state.highlighted.length = 0;
      Game.state.selectedpiece = clickedCell;
      Game.showMoveOptions(clickedPiece);
    }
  },

  // Handle move or castle
  _handleMoveOrCastle: function(targetCell) {
    const selectedPieceName = Game._getSelectedPieceName();

    // Check for castling
    if (selectedPieceName == 'w_king' && targetCell == '7_1' && 
        Board.pieces['w_king'].moved == false && Board.pieces['w_rook2'].moved == false) {
      Game.castle('w_king', '5_1', '7_1', 'w_rook2', '8_1', '6_1');
      Game.endTurn();
    } else if (selectedPieceName == 'b_king' && targetCell == '7_8' && 
               Board.pieces['b_king'].moved == false && Board.pieces['b_rook2'].moved == false) {
      Game.castle('b_king', '5_8', '7_8', 'b_rook2', '8_8', '6_8');
      Game.endTurn();
    } else {
      // Regular move
      const fromPosition = Game.state.selectedpiece;
      Game.movePiece(selectedPieceName, fromPosition, targetCell);
      Game.endTurn();
    }
  },

  // Handle piece capture
  _handleCapture: function(targetCell, capturedPieceName) {
    const attackingPieceName = Game._getSelectedPieceName();
    const attackingPosition = Game.state.selectedpiece;

    // Only allow if target is in highlighted moves
    if (Game.state.highlighted.indexOf(targetCell) != (-1)) {
      Game.capturePiece(capturedPieceName, targetCell, attackingPieceName, attackingPosition);
      Game.endTurn();
    }
  },

  // Get the name of the currently selected piece
  _getSelectedPieceName: function() {
    return $('#' + Game.state.selectedpiece).attr('chess');
  }

};
