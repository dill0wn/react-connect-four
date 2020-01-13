import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    const classNames = [
        'square',
        (props.highlight ? 'highlight' : '')
    ];
    return (
        <button className={classNames.join(' ')} onClick={props.onClick} >
            {props.value}
        </button>
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
        const width = 3;
        const height = 3;
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
                squares: Array(9).fill(null),
                position: null
            }],
            ascending: true,
            stepNumber: 0,
            xIsNext: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                position: i
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
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
                const value = move % 2 === 1 ? 'X' : '0';
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
            status = 'Winner: ' + winner.team;
            line = winner.line;
        // } else if (history.length > 9){
        } else if (current.squares.filter(s => s === null).length === 0) {
            status = 'Draw!';
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

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
    return i % 3;
}

function calculateRow(i) {
    return Math.floor(i / 3);
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                team: squares[a],
                line: [a, b, c]
            };
        }
    }
    return null;
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
)