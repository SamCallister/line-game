'use strict';

const Grid = require('./Grid');
const Player = require('./Player');
const paper = require('paper');
const gameInfo = require('./gameInfo');
const _ = require('lodash');

function getSpaceBetweenLines(value, numberLines) {
    return value / (numberLines + 1);
    // return (value - (value % numberCols)) / numberCols;
}

function initState(gridSize) {

    function setRow(row, index, indexList) {

        function setCol(col) {
            state[row][col] = {
                t: 0,
                b: 0,
                l: 0,
                r: 0
            };
        }
        state[row] = {};
        _.each(indexList, setCol);
    }

    const state = {};
    _.each(_.range(1, gridSize + 1), setRow);

    return state;
}

function Game(dimensions, gridSize) {
    const self = this;
    self.d = dimensions;
    self.gridSize = gridSize;
    self.numberLines = gridSize + 1;
    self.spaceInfo = {
        xSpace: getSpaceBetweenLines(dimensions.width, self.numberLines),
        ySpace: getSpaceBetweenLines(dimensions.height, self.numberLines)
    };
    self.state = initState(gridSize);
    self.currentTurn = 'playerOne';

    return self;
}

Game.prototype.canMakeWall = function(wallInfo) {

    function pointsAreEqual(pointOne, pointTwo) {
        return pointOne.row === pointTwo.row &&
            pointOne.col === pointTwo.col;
    }

    function testPlayer(startPoint, endRow, state, otherPlayerPoint) {
        // check position within grid
        if (startPoint.row < 1 || startPoint.row > self.gridSize ||
            startPoint.col < 1 || startPoint.col > self.gridSize ||
            pointsAreEqual(startPoint, otherPlayerPoint)) {
            return false;
        }

        if (startPoint.row === endRow) {
            return true;
        }

        const current = state[startPoint.row][startPoint.col];

        if (current.visited) {
            return false;
        }

        current.visited = true;

        let top, bottom, right, left = false;
        // attempt to recurse up down left right
        if (!current['t']) {
            top = testPlayer({ row: startPoint.row - 1, col: startPoint.col }, endRow, state, otherPlayerPoint);
        }
        if (!current['b']) {
            bottom = testPlayer({ row: startPoint.row + 1, col: startPoint.col }, endRow, state, otherPlayerPoint);
        }
        if (!current['r']) {
            right = testPlayer({ row: startPoint.row, col: startPoint.col + 1 }, endRow, state, otherPlayerPoint);
        }
        if (!current['l']) {
            left = testPlayer({ row: startPoint.row, col: startPoint.col - 1 }, endRow, state, otherPlayerPoint);
        }

        return top || bottom || right || left;
    }

    const self = this;
    const stateCopy = _.cloneDeep(self.state);
    stateCopy[wallInfo.row][wallInfo.col][wallInfo.value] = 1;

    if (wallInfo.value === 'b' && _.has(stateCopy, _.toString(wallInfo.row + 1))) {
        stateCopy[wallInfo.row + 1][wallInfo.col]['t'] = 1;
    } else if (_.has(stateCopy[wallInfo.row], _.toString(wallInfo.col + 1))) {
        stateCopy[wallInfo.row][wallInfo.col + 1]['l'] = 1;
    }

    return testPlayer(self.playerOne.position, 1, _.cloneDeep(stateCopy), self.playerTwo.position) &&
        testPlayer(self.playerTwo.position, self.gridSize, stateCopy, self.playerOne.position);
};

Game.prototype.start = function() {
    const self = this;
    const grid = new Grid(self.d, self.spaceInfo, self.numberLines);
    grid.draw(self.state, self.toggleTurn.bind(self), self.canMakeWall.bind(self));

    const playerOneColor = {
        player: 'red',
        movement: '#ffb3b3'
    };
    self.playerOne = new Player(
        Math.ceil(self.gridSize / 2),
        self.gridSize,
        self.spaceInfo,
        self.toggleTurn.bind(self),
        playerOneColor,
        1,
        'One'
    );
    self.playerOne.drawInitialCircle();

    const playerTwoColor = {
        player: 'blue',
        movement: '#b3b3ff'
    };
    self.playerTwo = new Player(
        Math.ceil(self.gridSize / 2),
        1,
        self.spaceInfo,
        self.toggleTurn.bind(self),
        playerTwoColor,
        self.gridSize,
        'Two'
    );
    self.playerTwo.drawInitialCircle();

    self.playerOne.drawPossibleMoves(self.state, self.gridSize, self.playerTwo.position);

    paper.view.draw();
}

Game.prototype.toggleTurn = function() {
    const self = this;

    if (self.currentTurn === 'playerOne') {
        self.playerOne.removeMoves();
        self.playerTwo.drawPossibleMoves(self.state, self.gridSize, self.playerOne.position);
        self.currentTurn = 'playerTwo';
        gameInfo.changeTurn('two');
    } else {
        self.playerTwo.removeMoves();
        self.playerOne.drawPossibleMoves(self.state, self.gridSize, self.playerTwo.position);
        self.currentTurn = 'playerOne';
        gameInfo.changeTurn('one');
    }
    paper.view.draw();
}

module.exports = Game;