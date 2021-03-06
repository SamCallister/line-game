'use strict';

const paper = require('paper');
const _ = require('lodash');
const gameInfo = require('./gameInfo');
const NUMBER_FRAMES = 20;

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

    const centerPoint = self.getPoint(row, col);
    const toAdd = new paper.Path.Circle(centerPoint, self.radius);
    toAdd.fillColor = color;

    return toAdd;
};

Player.prototype.getPoint = function(row, col) {
    const self = this;

    return new paper.Point(
        (col * self.spaceInfo.xSpace) + (self.spaceInfo.xSpace / 2),
        (row * self.spaceInfo.ySpace) + (self.spaceInfo.ySpace / 2)
    );
};

Player.prototype.getPossibleMoves = function(state, gridSize, otherPlayerPosition, canMakeMove) {

    function equalsOtherPlayerPos(row, col) {
        return row === otherPlayerPosition.row &&
            col === otherPlayerPosition.col;
    }

    const self = this;
    const points = [];
    const currentState = state[self.position.row][self.position.col];

    if (self.position.col + 1 <= gridSize && !currentState['r'] && !equalsOtherPlayerPos(self.position.row, self.position.col + 1) &&
        canMakeMove({ col: self.position.col + 1, row: self.position.row })) {
        points.push({
            point: new paper.Point(self.position.col + 1, self.position.row),
            col: self.position.col + 1,
            row: self.position.row
        });
    }
    if (self.position.col - 1 >= 1 && !currentState['l'] && !equalsOtherPlayerPos(self.position.row, self.position.col - 1) &&
        canMakeMove({ col: self.position.col - 1, row: self.position.row })) {
        points.push({
            point: new paper.Point(self.position.col - 1, self.position.row),
            col: self.position.col - 1,
            row: self.position.row
        });
    }
    if (self.position.row + 1 <= gridSize && !currentState['b'] && !equalsOtherPlayerPos(self.position.row + 1, self.position.col) &&
        canMakeMove({ col: self.position.col, row: self.position.row + 1 })) {
        points.push({
            point: new paper.Point(self.position.col, self.position.row + 1),
            col: self.position.col,
            row: self.position.row + 1
        });
    }

    if (self.position.row - 1 >= 1 && !currentState['t'] && !equalsOtherPlayerPos(self.position.row - 1, self.position.col) &&
        canMakeMove({ col: self.position.col, row: self.position.row - 1 })) {
        points.push({
            point: new paper.Point(self.position.col, self.position.row - 1),
            col: self.position.col,
            row: self.position.row - 1
        });
    }
    return points;
}

Player.prototype.drawPossibleMoves = function(state, gridSize, position, canMakeMove) {

    function callDrawPlayerAndSetEvent(position) {
        const circle = self.drawPlayerCircle(position.row, position.col, self.colorInfo.movement);
        setMoveEvent(circle, position.row, position.col);
        return circle;
    }

    function animateMove(entity, endPoint) {

        const vector = endPoint.subtract(entity.position).divide(NUMBER_FRAMES);
        let count = 0;

        function animate() {
            if (count === NUMBER_FRAMES) {
                entity.off('frame', animate);
                return;
            }

            entity.position = entity.position.add(vector);
            count += 1;
        }

        entity.on('frame', animate);
    }

    function setMoveEvent(circle, newRow, newCol) {
        circle.onClick = function() {

            const endPoint = self.getPoint(newRow, newCol);
            animateMove(self.playerCircle, endPoint);

            // self.playerCircle = self.drawPlayerCircle(newRow, newCol, self.colorInfo.player);
            self.position = {
                row: newRow,
                col: newCol
            };

            if (newRow === self.endRow) {
                self.removeMoves();
                gameInfo.showWinner(self.playerName);
                return;
            }
            self.toggleTurn();
        };
    }

    const self = this;
    const moves = self.getPossibleMoves(state, gridSize, position, canMakeMove);

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