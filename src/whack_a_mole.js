window.initGame = (React) => {
  const { useState, useEffect } = React;

  const TETROMINOS = [
    { shape: [[1, 1], [1, 1]], color: 'yellow' }, // Square
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T-shape
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }, // Z-shape
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // S-shape
    { shape: [[1], [1], [1], [1]], color: 'cyan' }, // I-shape
  ];

  const Tetris = () => {
    const BOARD_HEIGHT = 20;
    const BOARD_WIDTH = 10;
    const FALL_INTERVAL = 500; // milliseconds
    const [currentPosition, setCurrentPosition] = useState(0);
    const [squareColumn, setSquareColumn] = useState(4);
    const [currentTetromino, setCurrentTetromino] = useState(getRandomTetromino());
    const [board, setBoard] = useState(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
    const [hasLanded, setHasLanded] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const dropNewSquare = () => {
      setSquareColumn(4);
      setCurrentPosition(0);
      setHasLanded(false);
      setCurrentTetromino(getRandomTetromino());
      if (checkCollision(0, 4)) {
        setGameOver(true);
      }
    };

    const resetGame = () => {
      setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
      setScore(0);
      setGameOver(false);
      dropNewSquare();
    };

    const getRandomTetromino = () => {
      const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
      return TETROMINOS[randomIndex];
    };

    const clearFullRows = (newBoard) => {
      const filledRows = newBoard.filter(row => row.every(cell => cell === 1)).length;
      const filteredBoard = newBoard.filter(row => row.some(cell => cell === 0));
      const emptyRows = Array.from({ length: filledRows }, () => Array(BOARD_WIDTH).fill(0));
      setScore(prev => prev + filledRows * 10);
      return [...emptyRows, ...filteredBoard];
    };

    const checkCollision = (newPosition, column, tetromino = currentTetromino) => {
      for (let i = 0; i < tetromino.shape.length; i++) {
        for (let j = 0; j < tetromino.shape[i].length; j++) {
          if (
            tetromino.shape[i][j] &&
            (newPosition + i >= BOARD_HEIGHT || // Checks if out of bounds vertically
            column + j < 0 ||
            column + j >= BOARD_WIDTH ||
            board[newPosition + i][column + j] === 1)
          ) {
            return true;
          }
        }
      }
      return false;
    };

    const rotateTetromino = () => {
      const newShape = currentTetromino.shape[0].map((_, index) =>
        currentTetromino.shape.map(row => row[index]).reverse()
      );
      const newTetromino = { ...currentTetromino, shape: newShape };
      if (!checkCollision(currentPosition, squareColumn, newTetromino)) {
        setCurrentTetromino(newTetromino);
      }
    };

    const handleKeyDown = (event) => {
      event.preventDefault();
      if (gameOver) return;
      switch (event.key) {
        case "ArrowLeft":
          if (!checkCollision(currentPosition, squareColumn - 1)) {
            setSquareColumn(prev => Math.max(0, prev - 1));
          }
          break;
        case "ArrowRight":
          if (!checkCollision(currentPosition, squareColumn + 1)) {
            setSquareColumn(prev => Math.min(BOARD_WIDTH - currentTetromino.shape[0].length, prev + 1));
          }
          break;
        case "ArrowDown":
          if (currentPosition < BOARD_HEIGHT - currentTetromino.shape.length && !checkCollision(currentPosition + 1, squareColumn)) {
            setCurrentPosition(prev => prev + 1);
          }
          break;
        case "ArrowUp":
          rotateTetromino();
          break;
        default:
          break;
      }
    };

    useEffect(() => {
      const handleInterval = setInterval(() => {
        if (!hasLanded && currentPosition < BOARD_HEIGHT - currentTetromino.shape.length && !checkCollision(currentPosition + 1, squareColumn)) {
          setCurrentPosition(prev => prev + 1);
        } else {
          const newBoard = [...board];
          currentTetromino.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (cell) {
                newBoard[currentPosition + i][squareColumn + j] = 1;
              }
            });
          });
          setBoard(clearFullRows(newBoard));
          setHasLanded(true);
          dropNewSquare();
        }
      }, FALL_INTERVAL);
      return () => clearInterval(handleInterval);
    }, [currentPosition, squareColumn, board, hasLanded, currentTetromino]);

    useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [gameOver]);

    return React.createElement(
      'div',
      { className: "tetris", tabIndex: 0, onFocus: () => dropNewSquare() },
      React.createElement('h2', null, "Simple Tetris"),
      React.createElement('h3', null, `Score: ${score}`),
      !gameOver ? (
        React.createElement(
          'div',
          { className: "game-board" },
          board.map((row, rowIndex) => {
            return React.createElement(
              'div',
              { key: rowIndex, className: "row" },
              row.map((cell, colIndex) => {
                const isActive = cell === 1 || 
                  currentTetromino.shape.some((row, i) => row.some((cell, j) => cell && rowIndex === currentPosition + i && colIndex === squareColumn + j));
                return React.createElement(
                  'div',
                  {
                    key: colIndex,
                    className: `cell ${isActive ? 'active' : ''}`,
                    style: { backgroundColor: isActive ? currentTetromino.color : undefined },
                  },
                  ''
                );
              })
            );
          })
        )
      ) : (
        React.createElement('div', null,
          React.createElement('h3', null, "Game Over!"),
          React.createElement('button', { onClick: resetGame }, "Restart Game")
        )
      )
    );
  };

  return Tetris;
};

console.log('Tetris game script loaded');
