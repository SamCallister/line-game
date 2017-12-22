'use strict';

const paper = require('paper');
const _ = require('lodash');
const gameInfo = require('./gameInfo');

function Player(startCol, startRow, spaceInfo, toggleTurn, colorInfo, endRow, playerName) {
    const self = this;

    self.playerName = playerName
    self.colorInfo = colorInfo;
    self.startCol = startCol;
    self.startRow = startRow;
    self.endRow = endRow;
    self.spaceInfo = spaceInfo;
    self.radius = (self.spaceInfo.xSpace < self.spaceInfo.ySpace ?
        self.spaceInfo.xSpace : self.spaceInfo.ySpace) / 3;
    self.toggleTurn = toggleTurn;

    return self;
}

Player.prototype.drawInitialCircle = function() {
    const self = this;

    self.position = {
        row: self.startRow,
        col: self.startCol
    };

    self.playerCircle = self.drawPlayerCircle(self.startRow, self.startCol, self.colorInfo.player);
};

Player.prototype.drawPlayerCircle = function(row, col, color) {
    const self = this;

    const x = (col * self.spaceInfo.xSpace) + (self.spaceInfo.xSpace / 2);
    const y = (row * self.spaceInfo.ySpace) + (self.spaceInfo.ySpace / 2);
    const centerPoint = new paper.Point(x, y);
    const toAdd = new paper.Path.Circle(centerPoint, self.radius);
    toAdd.fillColor = color;

    return toAdd;
};

Player.prototype.getPossibleMoves = function(state, gridSize, otherPlayerPosition) {

    function equalsOtherPlayerPos(row, col) {
        return row === otherPlayerPosition.row &&
            col === otherPlayerPosition.col;
    }

    const self = this;
    const points = [];
    const currentState = state[self.position.row][self.position.col];

    if (self.position.col + 1 <= gridSize && !currentState['r'] && !equalsOtherPlayerPos(self.position.row, self.position.col + 1)) {
        points.push({
            point: new paper.Point(self.position.col + 1, self.position.row),
            col: self.position.col + 1,
            row: self.position.row
        });
    }
    if (self.position.col - 1 >= 1 && !currentState['l'] && !equalsOtherPlayerPos(self.position.row, self.position.col - 1)) {
        points.push({
            point: new paper.Point(self.position.col - 1, self.position.row),
            col: self.position.col - 1,
            row: self.position.row
        });
    }
    if (self.position.row + 1 <= gridSize && !currentState['b'] && !equalsOtherPlayerPos(self.position.row + 1, self.position.col)) {
        points.push({
            point: new paper.Point(self.position.col, self.position.row + 1),
            col: self.position.col,
            row: self.position.row + 1
        });
    }

    if (self.position.row - 1 >= 1 && !currentState['t'] && !equalsOtherPlayerPos(self.position.row - 1, self.position.col)) {
        points.push({
            point: new paper.Point(self.position.col, self.position.row - 1),
            col: self.position.col,
            row: self.position.row - 1
        });
    }
    return points;
}

Player.prototype.drawPossibleMoves = function(state, gridSize, position) {

    function callDrawPlayerAndSetEvent(position) {
        const circle = self.drawPlayerCircle(position.row, position.col, self.colorInfo.movement);
        setMoveEvent(circle, position.row, position.col);
        return circle;
    }

    function setMoveEvent(circle, newRow, newCol) {
        circle.onClick = function() {
            self.playerCircle.remove();
            self.playerCircle = self.drawPlayerCircle(newRow, newCol, self.colorInfo.player);
            self.position = {
                row: newRow,
                col: newCol
            };

            if(newRow === self.endRow) {
                self.removeMoves();
                gameInfo.showWinner(self.playerName);
                return;
            }
            self.toggleTurn();
        };
    }

    const self = this;
    const moves = self.getPossibleMoves(state, gridSize, position);

    self.moveCircles = _.map(moves, callDrawPlayerAndSetEvent);
};

Player.prototype.removeMoves = function() {
    const self = this;

    _.each(self.moveCircles, (circle) => {
        circle.remove();
    });

    self.moveCircles = [];
};

module.exports = Player;