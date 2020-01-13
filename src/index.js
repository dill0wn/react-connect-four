import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    return (
        <button
            className={`square ${props.highlight ? props.value : ''}`}
            onClick={props.onClick}
        >
            <Dot value={props.value} />
        </button>
    );
}

function Dot(props) {
    return (
        <span className={`dot ${props.value ? props.value : ''}`}></span>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        const highlights = this.props.highlights || [];
        return <Square key={`square-${i}`}
            value={this.props.squares[i]}
            highlight={highlights.indexOf(i) > -1}
            onClick={() => this.props.onClick(i)}
        />;
    }

    render() {
        const grid = Array(height);
        for (let r = 0, i = 0; r < height; r++) {
            const row = Array(width);
            for (let c = 0; c < width; c++ , i++) {
                row[c] = this.renderSquare(i);
            }
            grid[r] =
                <div className="board-row" key={`row-${r}`}>
                    {row}
                </div>;
        }
        return (
            <div>
                {grid}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            history: [{
                squares: Array(width * height).fill(null),
                position: null
            }],
            ascending: true,
            stepNumber: 0,
            blueIsNext: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        // don't allow a move if game is already won
        if (calculateWinner(squares)) {
            return;
        }

        const index = calculateLowestOpenColumnPosition(squares, i);
        // don't allow move if column already full
        if (index === null) {
            return;
        }

        squares[index] = this.state.blueIsNext ? 'blue' : 'red';

        this.setState({
            history: history.concat([{
                squares: squares,
                position: index
            }]),
            stepNumber: history.length,
            blueIsNext: !this.state.blueIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            blueIsNext: (step % 2) === 0
        })
    }

    toggleAscending() {
        this.setState({
            ascending: !this.state.ascending
        })
    }

    render() {
        // map the history to include the index; 
        // my rationale for doing it this way is: the index is redundant info
        // to be stored in the model, and it is only needed for rendering
        // the data model implicitly has order and index in the array
        const history = this.state.history.map((h, i) => {
            return { ...h, move: i };
        });
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = (this.state.ascending ? history : history.reverse())
            .map((step) => {
                const move = step.move;
                const col = calculateCol(step.position);
                const row = calculateRow(step.position);
                const value = move % 2 === 1 ? 'blue' : 'red';
                const desc = move ?
                    'Go to move #' + move + ' ' + value + '@( ' + col + ', ' + row + ' )' :
                    'Go to game start';
                return (
                    <li key={move}>
                        <button
                            className={move === this.state.stepNumber ? 'currentStep' : ''}
                            onClick={() => this.jumpTo(move)}
                        >
                            {desc}
                        </button>
                    </li>
                )
            });

        let status;
        let line;
        if (winner) {
            status = 'Winner: ' + winner.team.toUpperCase();
            line = winner.line;
        } else if (current.squares.filter(s => s === null).length === 0) {
            status = 'Draw!';
        } else {
            status = 'Next player: ' + (this.state.blueIsNext ? 'Blue' : 'Red');
        }

        // button to toggle whether history is ascending/descending
        const ascending =
            <button
                onClick={() => this.toggleAscending()}
            >
                {this.state.ascending ? 'Ascending' : 'Descending'}
            </button>;

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        highlights={line}
                        onClick={(i) => this.handleClick(i)} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{ascending}</div>
                    <div>{moves}</div>
                </div>
            </div>
        );
    }
}

function calculateCol(i) {
    return i % width;
}

function calculateRow(i) {
    return Math.floor(i / width);
}

const width = 7;
const height = 6;

function checkDir(squares, i, getNext, history) {
    history = history || [];
    if (squares[i] === null) return history;
    history.push(i);
    var next = getNext(i);
    if (squares[next] === squares[i]) {
        checkDir(squares, next, getNext, history)
    }
    return history;
}

function getNeighborUp(i) {
    const next = i - width;
    if (next < 0) {
        return null;
    }
    return next;
}

function getNeighborDown(i) {
    const next = i + width;
    if (next >= width * height) {
        return null;
    }
    return next;
}


function getNeighborUpRight(i) {
    const next = i - width + 1;
    if (next < 0) {
        return null;
    }
    if (next % width === 0) {
        return null;
    }
    return next;
}

function getNeighborRight(i) {
    const next = (i + 1)
    if (next % width === 0) {
        return null;
    }
    return next;
}

function getNeighborDownRight(i) {
    const next = i + width + 1;
    if (next >= height * width) {
        return null;
    }
    if (next % width === 0) {
        return null;
    }
    return next;
}

const neighbors = [getNeighborUp,
    getNeighborUpRight,
    getNeighborRight,
    getNeighborDownRight];

function calculateWinner(squares) {

    for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < neighbors.length; j++) {
            const neighborFunc = neighbors[j];
            const line = checkDir(squares, i, neighborFunc);
            if (line.length >= 4) {
                return {
                    line: line,
                    team: squares[line[0]]
                };
            }
        }
    }

    return null;
}

function calculateLowestOpenColumnPosition(squares, i) {
    let bottom = (width * (height - 1)) + i % width;
    for (; bottom >= 0; bottom -= width) {
        if (squares[bottom] === null) {
            return bottom;
        }
    }

    return null;
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
)