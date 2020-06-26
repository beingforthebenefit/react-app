import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const className = 'square' + (props.highlight ? ' highlight' : '');
  return (
    <button
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winningLine = this.props.winningLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winningLine && winningLine.includes(i)}
      />
    );
  }

  render() {
    let squares = [];
    for (let i = 0; i < 3; i++) {
      let row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(i * 3 + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
      <div>{squares}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length -1];
    // Using `slice()` to create a copy of the board state array
    const squares = current.squares.slice();
    // Skipping this method if the game is complete or square is filled already
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastSquare: i,
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const col = 1 + step.lastSquare % 3;
      const row = Math.ceil(step.lastSquare / 3);
      const desc = move ? `Go to move #${move} (${col}, ${row})` : 'Go to game start';

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}
            className={move === this.state.stepNumber ? 'active-move' : ''}
          >{desc}</button>
        </li>
      );
    });

    let status;
    if (winnerInfo.winner) {
      status = 'Winner: ' + winnerInfo.winner;
    } else if (winnerInfo.draw) {
      status = 'Cat\'s Game!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
  
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningLine={winnerInfo.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
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
        winner: squares[a],
        line: lines[i],
      };
    }
  }

  return {winner: null, line: null, draw: squares.filter(Boolean).length === 9};
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
