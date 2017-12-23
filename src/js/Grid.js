'use strict';

const paper = require('paper');
const _ = require('lodash');

function Grid(dimensions, spaceInfo, numberLines) {
    const self = this;

    self.d = dimensions;
    self.numberLines = numberLines;
    self.spaceInfo = spaceInfo;

    return self;
}

Grid.prototype.draw = function(state, toggleTurn, canMakeWall) {

    function segEvent(entity, position, value) {

        function clickEvent() {

            position.value = value;
            if (!canMakeWall(position)) {
                return;
            }

            if (value === 'b') {
                state[position.row][position.col].b = 1;
                state[position.row + 1][position.col].t = 1;
            }

            if (value === 'r') {
                state[position.row][position.col].r = 1;
                state[position.row][position.col + 1].l = 1;
            }
            entity.strokeColor = 'brown';
            entity.strokeWidth = 10;
            entity.off('click', clickEvent);
            toggleTurn();
        }

        entity.on('click', clickEvent);
    }

    function drawHorizontalLine(yNumber, index, list) {

        function addPoint(startPoint, xNumber) {
            const nextPoint = new paper.Point(xNumber * self.spaceInfo.xSpace, height);
            const newLine = new paper.Path.Line(startPoint, nextPoint);
            newLine.strokeColor = 'lightGreen';
            newLine.strokeWidth = 5;
            lines.push(newLine);

            const position = {
                row: yNumber - 1,
                col: xNumber - 1,
            };
            segEvent(newLine, position, 'b')
            return nextPoint;
        }

        if (yNumber === 1 || yNumber === self.numberLines) {
            return;
        }

        const height = yNumber * self.spaceInfo.ySpace;
        const lines = [];

        _.reduce(list.slice(1), addPoint, new paper.Point(self.spaceInfo.xSpace, height));
    }

    function drawVerticalLine(xNumber, index, list) {

        function addPoint(startPoint, yNumber) {
            const nextPoint = new paper.Point(width, yNumber * self.spaceInfo.ySpace);
            const newLine = new paper.Path.Line(startPoint, nextPoint);
            newLine.strokeColor = color;
            newLine.strokeWidth = 5;
            lines.push(newLine);

            const position = {
                row: yNumber - 1,
                col: xNumber - 1
            };

            if (addEvents) {
                segEvent(newLine, position, 'r');
            }

            return nextPoint;
        }

        const width = xNumber * self.spaceInfo.xSpace;
        const lines = [];
        let color = 'lightGreen'
        let addEvents = true;
        if (xNumber === 1 || xNumber === self.numberLines) {
            color = 'black';
            addEvents = false;
        }

        _.reduce(list.slice(1), addPoint, new paper.Point(width, self.spaceInfo.ySpace));
    }

    const self = this;

    _.each(_.range(1, self.numberLines + 1), drawHorizontalLine);
    _.each(_.range(1, self.numberLines + 1), drawVerticalLine);
}

module.exports = Grid;