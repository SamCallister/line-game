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

Game.prototype.start = function() {
    const self = this;
    const grid = new Grid(self.d, self.spaceInfo, self.numberLines);
    grid.draw(self.state, self.toggleTurn.bind(self));

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