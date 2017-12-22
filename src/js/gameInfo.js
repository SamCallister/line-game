'use strict';

const $ = require('jquery');

function setText(text) {
	$('.game-info-container').text(text);
} 

function changeTurn(player) {
	if(player === 'one') {
		setText('Player One\'s Turn');
	} else {
		setText('Player Two\'s Turn');
	}
}

function showWinner(playerName) {
	setText(`Player ${playerName} wins!!!`);
}

module.exports = {
	changeTurn,
	showWinner
};