// ============================================
// MOVE CALCULATION & VALIDATION
// ============================================

const Moves = {

  // Calculate all valid move options for a selected piece
  getOptions: function(selectedpiece) {
    const position = Utils.parsePosition(Board.pieces[selectedpiece].position);
    const piecetype = Board.pieces[selectedpiece].type;
    const startpoint = Board.pieces[selectedpiece].position;

    let coordinates = [];

    switch (piecetype) {
      case 'w_king':
        coordinates = Moves._getKingOptions('w', position, startpoint);
        break;
      case 'b_king':
        coordinates = Moves._getKingOptions('b', position, startpoint);
        break;
      case 'w_queen':
        coordinates = Moves._getQueenOptions('w', position);
        break;
      case 'b_queen':
        coordinates = Moves._getQueenOptions('b', position);
        break;
      case 'w_bishop':
        coordinates = Moves._getBishopOptions('w', position);
        break;
      case 'b_bishop':
        coordinates = Moves._getBishopOptions('b', position);
        break;
      case 'w_knight':
        coordinates = Moves._getKnightOptions('w', position, startpoint);
        break;
      case 'b_knight':
        coordinates = Moves._getKnightOptions('b', position, startpoint);
        break;
      case 'w_rook':
        coordinates = Moves._getRookOptions('w', position);
        break;
      case 'b_rook':
        coordinates = Moves._getRookOptions('b', position);
        break;
      case 'w_pawn':
        coordinates = Moves._getPawnOptions('w', Board.pieces[selectedpiece], startpoint);
        break;
      case 'b_pawn':
        coordinates = Moves._getPawnOptions('b', Board.pieces[selectedpiece], startpoint);
        break;
    }

    return coordinates;
  },

  // Helper: Get king move options (1 square in any direction, with castling)
  _getKingOptions: function(color, position, startpoint) {
    const relativeCoords = [
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
      { x: 0, y: -1 },
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 }
    ];

    let coordinates = Utils.relativeToAbsolute(startpoint, relativeCoords);

    // Check castling for white king
    if (color === 'w' && 
        $('#6_1').attr('chess') == 'null' && 
        $('#7_1').attr('chess') == 'null' && 
        Board.pieces['w_king'].moved == false && 
        Board.pieces['w_rook2'].moved == false) {
      coordinates.push('7_1');
    }

    // Check castling for black king
    if (color === 'b' && 
        $('#6_8').attr('chess') == 'null' && 
        $('#7_8').attr('chess') == 'null' && 
        Board.pieces['b_king'].moved == false && 
        Board.pieces['b_rook2'].moved == false) {
      coordinates.push('7_8');
    }

    return Moves._filterByColor(coordinates, color);
  },

  // Helper: Get queen move options (bishop + rook moves)
  _getQueenOptions: function(color, position) {
    const diagonals = Moves._getDiagonalMoves(color, position);
    const straights = Moves._getStraightMoves(color, position);
    return diagonals.concat(straights);
  },

  // Helper: Get bishop move options (diagonal moves)
  _getBishopOptions: function(color, position) {
    return Moves._getDiagonalMoves(color, position);
  },

  // Helper: Get rook move options (straight moves)
  _getRookOptions: function(color, position) {
    return Moves._getStraightMoves(color, position);
  },

  // Helper: Get knight move options (L-shaped jumps)
  _getKnightOptions: function(color, position, startpoint) {
    const relativeCoords = [
      { x: -1, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: -2 },
      { x: -1, y: -2 },
      { x: 2, y: 1 },
      { x: 2, y: -1 },
      { x: -2, y: -1 },
      { x: -2, y: 1 }
    ];

    let coordinates = Utils.relativeToAbsolute(startpoint, relativeCoords);
    return Moves._filterByColor(coordinates, color);
  },

  // Helper: Get pawn move options (straight 1-2 squares, diagonal captures)
  _getPawnOptions: function(color, pieceData, startpoint) {
    let relativeCoords = [];

    if (color === 'w') {
      // White moves up (positive y)
      if (pieceData.moved == false) {
        relativeCoords = [
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 1 },
          { x: -1, y: 1 }
        ];
      } else {
        relativeCoords = [
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: -1, y: 1 }
        ];
      }
    } else {
      // Black moves down (negative y)
      if (pieceData.moved == false) {
        relativeCoords = [
          { x: 0, y: -1 },
          { x: 0, y: -2 },
          { x: 1, y: -1 },
          { x: -1, y: -1 }
        ];
      } else {
        relativeCoords = [
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: -1, y: -1 }
        ];
      }
    }

    let coordinates = Utils.relativeToAbsolute(startpoint, relativeCoords);
    return Moves._filterPawnMoves(coordinates, startpoint, color);
  },

  // Helper: Get diagonal move coordinates (with line-of-sight)
  _getDiagonalMoves: function(color, position) {
    const diagonalDirections = [
      [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 }],
      [{ x: 1, y: -1 }, { x: 2, y: -2 }, { x: 3, y: -3 }, { x: 4, y: -4 }, { x: 5, y: -5 }, { x: 6, y: -6 }, { x: 7, y: -7 }],
      [{ x: -1, y: 1 }, { x: -2, y: 2 }, { x: -3, y: 3 }, { x: -4, y: 4 }, { x: -5, y: 5 }, { x: -6, y: 6 }, { x: -7, y: 7 }],
      [{ x: -1, y: -1 }, { x: -2, y: -2 }, { x: -3, y: -3 }, { x: -4, y: -4 }, { x: -5, y: -5 }, { x: -6, y: -6 }, { x: -7, y: -7 }]
    ];

    let allMoves = [];
    for (let direction of diagonalDirections) {
      const moves = Moves._getLineOfSightMoves(position, direction, color);
      allMoves = allMoves.concat(moves);
    }
    return allMoves;
  },

  // Helper: Get straight move coordinates (with line-of-sight)
  _getStraightMoves: function(color, position) {
    const straightDirections = [
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }],
      [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 }],
      [{ x: -1, y: 0 }, { x: -2, y: 0 }, { x: -3, y: 0 }, { x: -4, y: 0 }, { x: -5, y: 0 }, { x: -6, y: 0 }, { x: -7, y: 0 }],
      [{ x: 0, y: -1 }, { x: 0, y: -2 }, { x: 0, y: -3 }, { x: 0, y: -4 }, { x: 0, y: -5 }, { x: 0, y: -6 }, { x: 0, y: -7 }]
    ];

    let allMoves = [];
    for (let direction of straightDirections) {
      const moves = Moves._getLineOfSightMoves(position, direction, color);
      allMoves = allMoves.concat(moves);
    }
    return allMoves;
  },

  // Helper: Calculate line-of-sight moves (stops at piece, can capture opponent)
  _getLineOfSightMoves: function(position, relativeCoords, color) {
    let coordinates = Utils.relativeToAbsolute(Utils.coordsToString(position.x, position.y), relativeCoords);
    
    coordinates = Utils.filterBoundsViolations(coordinates);

    let validMoves = [];
    let blocked = false;

    for (let coord of coordinates) {
      if (blocked) break;

      const cellContent = Utils.getPieceAtPosition(coord);

      if (cellContent == 'null') {
        validMoves.push(coord);
      } else {
        const pieceColor = Utils.getPieceColor(cellContent);
        if (pieceColor !== color) {
          // Opponent piece - can capture
          validMoves.push(coord);
        }
        blocked = true;
      }
    }

    return validMoves;
  },

  // Helper: Filter pawn moves (special rules for forward/capture)
  _filterPawnMoves: function(coordinates, startpoint, color) {
    const startPos = Utils.parsePosition(startpoint);
    const startX = parseInt(startPos.x);
    const startY = parseInt(startPos.y);

    return coordinates.filter(function(val) {
      const coord = Utils.parsePosition(val);
      const coordX = parseInt(coord.x);
      const coordY = parseInt(coord.y);

      // Check if moving sideways (diagonal)
      if (coordX < startX || coordX > startX) {
        // Diagonal moves only valid for captures
        const cellContent = Utils.getPieceAtPosition(val);
        const opponentColor = color === 'w' ? 'b' : 'w';
        return cellContent != 'null' && Utils.getPieceColor(cellContent) == opponentColor;
      } else {
        // Straight moves - cell must be empty
        // For 2-square first move, check if path is blocked
        if (color === 'w' && coordY == (startY + 2)) {
          const blockingCell = Utils.getPieceAtPosition(startX + '_' + (startY + 1));
          if (blockingCell != 'null') return false;
        } else if (color === 'b' && coordY == (startY - 2)) {
          const blockingCell = Utils.getPieceAtPosition(startX + '_' + (startY - 1));
          if (blockingCell != 'null') return false;
        }
        return Utils.isPositionEmpty(val);
      }
    });
  },

  // Helper: Filter coordinates by color (remove friendly pieces)
  _filterByColor: function(coordinates, color) {
    return coordinates.filter(function(val) {
      if (!Utils.isPositionWithinBounds(val)) return false;

      const cellContent = Utils.getPieceAtPosition(val);
      if (cellContent == 'null') return true;

      const pieceColor = Utils.getPieceColor(cellContent);
      return pieceColor !== color;
    });
  }

};
