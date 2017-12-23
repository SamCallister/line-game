'use strict';

require('../css/style.css');
const paper = require('paper');
const Game = require('./Game');

// Only executed our code once the DOM is ready.
window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('game');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    const dimensions = {
        width: 800,
        height: 600
    };
    const numberCols = 10;

    const game = new Game(dimensions, numberCols);
    game.start();
};