// ============================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================

// Position conversion and parsing
const Utils = {
  
  // Parse position string "5_1" into {x: 5, y: 1}
  parsePosition: function(positionString) {
    const parts = positionString.split('_');
    return {
      x: parts[0],
      y: parts[1]
    };
  },

  // Convert coordinates {x: 5, y: 1} back to "5_1"
  coordsToString: function(x, y) {
    return x + '_' + y;
  },

  // Check if coordinates are within board bounds (1-8)
  isWithinBounds: function(x, y) {
    return !(x < 1) && !(x > 8) && !(y < 1) && !(y > 8);
  },

  // Check if a position is within bounds from position string
  isPositionWithinBounds: function(positionString) {
    const pos = Utils.parsePosition(positionString);
    return Utils.isWithinBounds(parseInt(pos.x), parseInt(pos.y));
  },

  // Get piece color from piece type ('w' for white, 'b' for black)
  getPieceColor: function(pieceName) {
    return pieceName.slice(0, 1);
  },

  // Get piece type without color ('king', 'pawn', etc)
  getPieceType: function(pieceName) {
    return pieceName.slice(2);
  },

  // Check if position is empty on board
  isPositionEmpty: function(positionId) {
    return $('#' + positionId).attr('chess') == 'null';
  },

  // Get piece at position
  getPieceAtPosition: function(positionId) {
    return $('#' + positionId).attr('chess');
  },

  // Convert relative movement array to grid coordinates
  // converts [{x: 1, y: 1}, {x: 2, y: 2}] to ["6_2", "7_3"] from position "5_1"
  relativeToAbsolute: function(position, relativeCoords) {
    const pos = Utils.parsePosition(position);
    const x = parseInt(pos.x);
    const y = parseInt(pos.y);

    return relativeCoords.map(function(coord) {
      return (x + parseInt(coord.x)) + '_' + (y + parseInt(coord.y));
    });
  },

  // Filter out-of-bounds coordinates
  filterBoundsViolations: function(coordinates) {
    return coordinates.filter(function(val) {
      return Utils.isPositionWithinBounds(val);
    });
  }

};
