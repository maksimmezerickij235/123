/* ========================================
   Chess Master - Game Logic
   ======================================== */

// ========================================
// Глобальные переменные
// ========================================

const PIECES = {
    WHITE_KING: '♔', WHITE_QUEEN: '♕', WHITE_ROOK: '♖',
    WHITE_BISHOP: '♗', WHITE_KNIGHT: '♘', WHITE_PAWN: '♙',
    BLACK_KING: '♚', BLACK_QUEEN: '♛', BLACK_ROOK: '♜',
    BLACK_BISHOP: '♝', BLACK_KNIGHT: '♞', BLACK_PAWN: '♟'
};

const INITIAL_BOARD = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

let board = [];
let selectedSquare = null;
let validMoves = [];
let currentTurn = 'white';
let gameMode = 'pvp'; // 'pvp' или 'bot'
let botDifficulty = 'easy';
let gameOver = false;
let moveHistory = [];
let capturedWhite = [];
let capturedBlack = [];
let castlingRights = {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true
};
let enPassantTarget = null;
let lastMove = null;

// ========================================
// Инициализация игры
// ========================================

function initGame() {
    board = INITIAL_BOARD.map(row => [...row]);
    selectedSquare = null;
    validMoves = [];
    currentTurn = 'white';
    gameOver = false;
    moveHistory = [];
    capturedWhite = [];
    capturedBlack = [];
    castlingRights = {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true
    };
    enPassantTarget = null;
    lastMove = null;
    
    renderBoard();
    updateGameInfo();
    document.getElementById('game-status').textContent = '';
    document.getElementById('moves-list').innerHTML = '';
    document.getElementById('captured-white').innerHTML = '';
    document.getElementById('captured-black').innerHTML = '';
}

function startGame(mode, difficulty = 'easy') {
    gameMode = mode;
    botDifficulty = difficulty;
    showScreen('game-screen');
    initGame();
}

function resetGame() {
    closeModal('game-over-modal');
    initGame();
}

function endGame() {
    showScreen('main-menu');
}

// ========================================
// Навигация по экранам
// ========================================

function showScreen(screenId) {
    document.querySelectorAll('.menu-screen, .game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showLeaderboard() {
    showScreen('leaderboard-screen');
    renderLeaderboard();
    updatePlayerStats();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ========================================
// Рендеринг доски
// ========================================

function renderBoard() {
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            // Подсветка выбранной клетки
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }
            
            // Подсветка возможных ходов
            const isValidMove = validMoves.some(m => m.row === row && m.col === col);
            if (isValidMove) {
                if (board[row][col]) {
                    square.classList.add('valid-move-capture');
                } else {
                    square.classList.add('valid-move');
                }
            }
            
            // Подсветка последнего хода
            if (lastMove) {
                if ((lastMove.from.row === row && lastMove.from.col === col) ||
                    (lastMove.to.row === row && lastMove.to.col === col)) {
                    square.classList.add('last-move');
                }
            }
            
            // Подсветка шаха
            const piece = board[row][col];
            if (piece === PIECES.WHITE_KING && isKingInCheck('white')) {
                square.classList.add('check');
            } else if (piece === PIECES.BLACK_KING && isKingInCheck('black')) {
                square.classList.add('check');
            }
            
            // Добавление фигуры
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.className = `piece ${isWhitePiece(piece) ? 'white' : 'black'}`;
                pieceElement.textContent = piece;
                pieceElement.draggable = true;
                
                // События для drag-and-drop
                pieceElement.addEventListener('dragstart', handleDragStart);
                pieceElement.addEventListener('dragend', handleDragEnd);
                
                square.appendChild(pieceElement);
            }
            
            // События для кликов
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            // События для drop
            square.addEventListener('dragover', handleDragOver);
            square.addEventListener('drop', handleDrop);
            
            boardElement.appendChild(square);
        }
    }
}

// ========================================
// Обработка взаимодействий
// ========================================

function handleSquareClick(row, col) {
    if (gameOver) return;
    if (gameMode === 'bot' && currentTurn === 'black') return;
    
    const piece = board[row][col];
    
    // Если клетка уже выбрана
    if (selectedSquare) {
        const isValidMove = validMoves.some(m => m.row === row && m.col === col);
        
        if (isValidMove) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            return;
        }
        
        // Если кликнули на свою фигуру - перевыбрать
        if (piece && isOwnPiece(piece)) {
            selectedSquare = { row, col };
            validMoves = getValidMoves(row, col);
            renderBoard();
            return;
        }
        
        // Снять выделение
        selectedSquare = null;
        validMoves = [];
        renderBoard();
        return;
    }
    
    // Выбор фигуры
    if (piece && isOwnPiece(piece)) {
        selectedSquare = { row, col };
        validMoves = getValidMoves(row, col);
        renderBoard();
    }
}

function handleDragStart(e) {
    if (gameOver) {
        e.preventDefault();
        return;
    }
    if (gameMode === 'bot' && currentTurn === 'black') {
        e.preventDefault();
        return;
    }
    
    const piece = e.target;
    if (!isOwnPiece(piece.textContent)) {
        e.preventDefault();
        return;
    }
    
    piece.classList.add('dragging');
    const square = piece.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    selectedSquare = { row, col };
    validMoves = getValidMoves(row, col);
    renderBoard();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    
    if (gameOver) return;
    if (gameMode === 'bot' && currentTurn === 'black') return;
    
    const square = e.target.closest('.square');
    if (!square) return;
    
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    const isValidMove = validMoves.some(m => m.row === row && m.col === col);
    if (isValidMove) {
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
    }
}

// ========================================
// Логика ходов
// ========================================

function isWhitePiece(piece) {
    return '♔♕♖♗♘♙'.includes(piece);
}

function isBlackPiece(piece) {
    return '♚♛♜♝♞♟'.includes(piece);
}

function isOwnPiece(piece) {
    if (!piece) return false;
    return currentTurn === 'white' ? isWhitePiece(piece) : isBlackPiece(piece);
}

function isEnemyPiece(piece) {
    if (!piece) return false;
    return currentTurn === 'white' ? isBlackPiece(piece) : isWhitePiece(piece);
}

function getValidMoves(row, col, checkKingSafety = true) {
    const piece = board[row][col];
    if (!piece) return [];
    
    let moves = [];
    
    switch (piece) {
        case PIECES.WHITE_PAWN:
        case PIECES.BLACK_PAWN:
            moves = getPawnMoves(row, col, piece);
            break;
        case PIECES.WHITE_ROOK:
        case PIECES.BLACK_ROOK:
            moves = getRookMoves(row, col, piece);
            break;
        case PIECES.WHITE_KNIGHT:
        case PIECES.BLACK_KNIGHT:
            moves = getKnightMoves(row, col, piece);
            break;
        case PIECES.WHITE_BISHOP:
        case PIECES.BLACK_BISHOP:
            moves = getBishopMoves(row, col, piece);
            break;
        case PIECES.WHITE_QUEEN:
        case PIECES.BLACK_QUEEN:
            moves = getQueenMoves(row, col, piece);
            break;
        case PIECES.WHITE_KING:
        case PIECES.BLACK_KING:
            moves = getKingMoves(row, col, piece, checkKingSafety);
            break;
    }
    
    // Фильтрация ходов, которые оставляют короля под шахом
    if (checkKingSafety) {
        moves = moves.filter(move => {
            return !wouldBeInCheck(row, col, move.row, move.col, currentTurn);
        });
    }
    
    return moves;
}

function getPawnMoves(row, col, piece) {
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    
    // Ход вперёд на 1 клетку
    const newRow = row + direction;
    if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
        moves.push({ row: newRow, col });
        
        // Ход вперёд на 2 клетки
        if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }
    
    // Взятие по диагонали
    const captureCols = [col - 1, col + 1];
    for (const captureCol of captureCols) {
        if (captureCol >= 0 && captureCol < 8 && newRow >= 0 && newRow < 8) {
            const targetPiece = board[newRow][captureCol];
            if (isEnemyPiece(targetPiece)) {
                moves.push({ row: newRow, col: captureCol });
            }
            
            // Взятие на проходе
            if (enPassantTarget && 
                enPassantTarget.row === newRow && 
                enPassantTarget.col === captureCol) {
                moves.push({ row: newRow, col: captureCol, enPassant: true });
            }
        }
    }
    
    return moves;
}

function getRookMoves(row, col, piece) {
    return getSlidingMoves(row, col, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
}

function getBishopMoves(row, col, piece) {
    return getSlidingMoves(row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
}

function getQueenMoves(row, col, piece) {
    return getSlidingMoves(row, col, [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]);
}

function getSlidingMoves(row, col, directions) {
    const moves = [];
    
    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;
        
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            
            if (!targetPiece) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (isEnemyPiece(targetPiece)) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            
            newRow += dr;
            newCol += dc;
        }
    }
    
    return moves;
}

function getKnightMoves(row, col, piece) {
    const moves = [];
    const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dr, dc] of knightOffsets) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || isEnemyPiece(targetPiece)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    return moves;
}

function getKingMoves(row, col, piece, checkCastling = true) {
    const moves = [];
    const kingOffsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    
    for (const [dr, dc] of kingOffsets) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetPiece = board[newRow][newCol];
            if (!targetPiece || isEnemyPiece(targetPiece)) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    // Рокировка
    if (checkCastling && !isKingInCheck(currentTurn)) {
        const isWhite = currentTurn === 'white';
        const kingRow = isWhite ? 7 : 0;
        
        if (row === kingRow && col === 4) {
            // Королевский фланг
            const kingSideRights = isWhite ? castlingRights.whiteKingSide : castlingRights.blackKingSide;
            if (kingSideRights && !board[kingRow][5] && !board[kingRow][6]) {
                if (!isSquareAttacked(kingRow, 5, currentTurn) && 
                    !isSquareAttacked(kingRow, 6, currentTurn)) {
                    moves.push({ row: kingRow, col: 6, castling: 'kingSide' });
                }
            }
            
            // Ферзевый фланг
            const queenSideRights = isWhite ? castlingRights.whiteQueenSide : castlingRights.blackQueenSide;
            if (queenSideRights && !board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1]) {
                if (!isSquareAttacked(kingRow, 3, currentTurn) && 
                    !isSquareAttacked(kingRow, 2, currentTurn)) {
                    moves.push({ row: kingRow, col: 2, castling: 'queenSide' });
                }
            }
        }
    }
    
    return moves;
}

function isSquareAttacked(row, col, byColor) {
    const enemyColor = byColor === 'white' ? 'black' : 'white';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            
            const isEnemy = enemyColor === 'white' ? isWhitePiece(piece) : isBlackPiece(piece);
            if (!isEnemy) continue;
            
            const moves = getValidMoves(r, c, false);
            if (moves.some(m => m.row === row && m.col === col)) {
                return true;
            }
        }
    }
    
    return false;
}

function findKing(color) {
    const kingPiece = color === 'white' ? PIECES.WHITE_KING : PIECES.BLACK_KING;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === kingPiece) {
                return { row: r, col: c };
            }
        }
    }
    
    return null;
}

function isKingInCheck(color) {
    const kingPos = findKing(color);
    if (!kingPos) return false;
    
    return isSquareAttacked(kingPos.row, kingPos.col, color);
}

function wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
    // Сохраняем состояние
    const savedBoard = board.map(row => [...row]);
    const savedEnPassant = enPassantTarget;
    
    // Делаем ход
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';
    
    // Обработка взятия на проходе
    if (savedEnPassant && toRow === savedEnPassant.row && toCol === savedEnPassant.col) {
        const capturedPawnRow = color === 'white' ? toRow + 1 : toRow - 1;
        board[capturedPawnRow][toCol] = '';
    }
    
    const inCheck = isKingInCheck(color);
    
    // Восстанавливаем состояние
    board = savedBoard;
    enPassantTarget = savedEnPassant;
    
    return inCheck;
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    const move = validMoves.find(m => m.row === toRow && m.col === toCol);
    
    if (!move) return;
    
    // Сохраняем информацию о ходе
    const moveInfo = {
        piece,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        captured: capturedPiece,
        notation: getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, move)
    };
    
    // Взятие на проходе
    if (move.enPassant) {
        const capturedPawnRow = currentTurn === 'white' ? toRow + 1 : toRow - 1;
        const capturedPawn = board[capturedPawnRow][toCol];
        moveInfo.captured = capturedPawn;
        board[capturedPawnRow][toCol] = '';
        
        if (currentTurn === 'white') {
            capturedWhite.push(capturedPawn);
        } else {
            capturedBlack.push(capturedPawn);
        }
    }
    
    // Рокировка
    if (move.castling) {
        const rookRow = fromRow;
        if (move.castling === 'kingSide') {
            board[rookRow][5] = board[rookRow][7];
            board[rookRow][7] = '';
            moveInfo.notation = 'O-O';
        } else {
            board[rookRow][3] = board[rookRow][0];
            board[rookRow][0] = '';
            moveInfo.notation = 'O-O-O';
        }
    }
    
    // Обновление доски
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = '';
    
    // Превращение пешки
    if (piece === PIECES.WHITE_PAWN && toRow === 0) {
        board[toRow][toCol] = PIECES.WHITE_QUEEN;
        moveInfo.notation += '=Q';
    } else if (piece === PIECES.BLACK_PAWN && toRow === 7) {
        board[toRow][toCol] = PIECES.BLACK_QUEEN;
        moveInfo.notation += '=Q';
    }
    
    // Обновление прав на рокировку
    updateCastlingRights(piece, fromRow, fromCol);
    
    // Обновление en passant
    if ((piece === PIECES.WHITE_PAWN || piece === PIECES.BLACK_PAWN) && 
        Math.abs(toRow - fromRow) === 2) {
        enPassantTarget = {
            row: (fromRow + toRow) / 2,
            col: fromCol
        };
    } else {
        enPassantTarget = null;
    }
    
    // Сохранение захваченных фигур
    if (capturedPiece && !move.enPassant) {
        if (currentTurn === 'white') {
            capturedWhite.push(capturedPiece);
        } else {
            capturedBlack.push(capturedPiece);
        }
    }
    
    // Сохранение последнего хода
    lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
    
    // Добавление в историю
    moveHistory.push(moveInfo);
    
    // Смена хода
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    selectedSquare = null;
    validMoves = [];
    
    // Обновление интерфейса
    renderBoard();
    updateGameInfo();
    updateMoveHistory();
    updateCapturedPieces();
    
    // Проверка на мат/пат
    checkGameEnd();
    
    // Ход бота
    if (gameMode === 'bot' && currentTurn === 'black' && !gameOver) {
        setTimeout(makeBotMove, 500);
    }
}

function updateCastlingRights(piece, fromRow, fromCol) {
    // Если король походил
    if (piece === PIECES.WHITE_KING) {
        castlingRights.whiteKingSide = false;
        castlingRights.whiteQueenSide = false;
    } else if (piece === PIECES.BLACK_KING) {
        castlingRights.blackKingSide = false;
        castlingRights.blackQueenSide = false;
    }
    
    // Если ладья походила или взята
    if (piece === PIECES.WHITE_ROOK || piece === PIECES.BLACK_ROOK) {
        if (fromRow === 0 && fromCol === 0) castlingRights.blackQueenSide = false;
        if (fromRow === 0 && fromCol === 7) castlingRights.blackKingSide = false;
        if (fromRow === 7 && fromCol === 0) castlingRights.whiteQueenSide = false;
        if (fromRow === 7 && fromCol === 7) castlingRights.whiteKingSide = false;
    }
}

function getMoveNotation(fromRow, fromCol, toRow, toCol, piece, captured, move) {
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    if (move.castling) {
        return move.castling === 'kingSide' ? 'O-O' : 'O-O-O';
    }
    
    let notation = '';
    
    // Тип фигуры
    const pieceSymbols = {
        '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': '',
        '♚': 'K', '♛': 'Q', '♜': 'R', '♝': 'B', '♞': 'N', '♟': ''
    };
    notation += pieceSymbols[piece] || '';
    
    // Взятие
    if (captured || move.enPassant) {
        if (piece === PIECES.WHITE_PAWN || piece === PIECES.BLACK_PAWN) {
            notation += files[fromCol];
        }
        notation += 'x';
    }
    
    // Клетка назначения
    notation += files[toCol] + ranks[toRow];
    
    return notation;
}

function checkGameEnd() {
    const hasValidMoves = getAllValidMoves(currentTurn).length > 0;
    const inCheck = isKingInCheck(currentTurn);
    
    const statusElement = document.getElementById('game-status');
    
    if (!hasValidMoves) {
        gameOver = true;
        
        if (inCheck) {
            // Мат
            statusElement.textContent = 'МАТ!';
            statusElement.className = 'game-status checkmate';
            
            const winner = currentTurn === 'white' ? 'Чёрные' : 'Белые';
            showGameOver('Игра окончена', `Мат! Победили ${winner}`);
            
            // Обновление статистики
            if (gameMode === 'bot') {
                if (currentTurn === 'black') {
                    updatePlayerStats(true);
                } else {
                    updatePlayerStats(false);
                }
            }
        } else {
            // Пат
            statusElement.textContent = 'ПАТ! Ничья';
            statusElement.className = 'game-status stalemate';
            showGameOver('Игра окончена', 'Пат! Ничья');
        }
    } else if (inCheck) {
        statusElement.textContent = 'ШАХ!';
        statusElement.className = 'game-status check';
    } else {
        statusElement.textContent = '';
        statusElement.className = 'game-status';
    }
}

function getAllValidMoves(color) {
    const moves = [];
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            
            const isWhite = isWhitePiece(piece);
            if ((color === 'white' && !isWhite) || (color === 'black' && isWhite)) {
                continue;
            }
            
            const savedTurn = currentTurn;
            currentTurn = color;
            const pieceMoves = getValidMoves(r, c);
            currentTurn = savedTurn;
            
            for (const move of pieceMoves) {
                moves.push({
                    from: { row: r, col: c },
                    to: move
                });
            }
        }
    }
    
    return moves;
}

// ========================================
// Бот (Minimax алгоритм)
// ========================================

const PIECE_VALUES = {
    '♔': 10000, '♕': 900, '♖': 500, '♗': 330, '♘': 320, '♙': 100,
    '♚': -10000, '♛': -900, '♜': -500, '♝': -330, '♞': -320, '♟': -100
};

// Позиционные таблицы для оценки
const PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE_MIDDLE = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

function makeBotMove() {
    if (gameOver) return;
    
    let depth;
    switch (botDifficulty) {
        case 'easy':
            depth = 1;
            break;
        case 'medium':
            depth = 2;
            break;
        case 'hard':
            depth = 3;
            break;
        default:
            depth = 1;
    }
    
    const bestMove = getBestMove(depth);
    
    if (bestMove) {
        selectedSquare = bestMove.from;
        validMoves = getValidMoves(bestMove.from.row, bestMove.from.col);
        makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
    }
}

function getBestMove(depth) {
    const moves = getAllValidMoves('black');
    
    if (moves.length === 0) return null;
    
    // Перемешиваем ходы для разнообразия
    shuffleArray(moves);
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of moves) {
        const savedBoard = board.map(row => [...row]);
        const savedEnPassant = enPassantTarget;
        const savedCastling = { ...castlingRights };
        
        // Делаем ход
        board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
        board[move.from.row][move.from.col] = '';
        
        // Превращение пешки
        if (board[move.to.row][move.to.col] === PIECES.BLACK_PAWN && move.to.row === 7) {
            board[move.to.row][move.to.col] = PIECES.BLACK_QUEEN;
        }
        
        const score = minimax(depth - 1, -Infinity, Infinity, false);
        
        // Восстанавливаем доску
        board = savedBoard;
        enPassantTarget = savedEnPassant;
        castlingRights = savedCastling;
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
        return evaluateBoard();
    }
    
    const color = isMaximizing ? 'black' : 'white';
    const moves = getAllValidMoves(color);
    
    if (moves.length === 0) {
        if (isKingInCheck(color)) {
            return isMaximizing ? -100000 : 100000;
        }
        return 0; // Пат
    }
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        for (const move of moves) {
            const savedBoard = board.map(row => [...row]);
            const savedEnPassant = enPassantTarget;
            const savedCastling = { ...castlingRights };
            
            board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
            board[move.from.row][move.from.col] = '';
            
            if (board[move.to.row][move.to.col] === PIECES.BLACK_PAWN && move.to.row === 7) {
                board[move.to.row][move.to.col] = PIECES.BLACK_QUEEN;
            }
            
            const score = minimax(depth - 1, alpha, beta, false);
            
            board = savedBoard;
            enPassantTarget = savedEnPassant;
            castlingRights = savedCastling;
            
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            
            if (beta <= alpha) break;
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (const move of moves) {
            const savedBoard = board.map(row => [...row]);
            const savedEnPassant = enPassantTarget;
            const savedCastling = { ...castlingRights };
            
            board[move.to.row][move.to.col] = board[move.from.row][move.from.col];
            board[move.from.row][move.from.col] = '';
            
            if (board[move.to.row][move.to.col] === PIECES.WHITE_PAWN && move.to.row === 0) {
                board[move.to.row][move.to.col] = PIECES.WHITE_QUEEN;
            }
            
            const score = minimax(depth - 1, alpha, beta, true);
            
            board = savedBoard;
            enPassantTarget = savedEnPassant;
            castlingRights = savedCastling;
            
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            
            if (beta <= alpha) break;
        }
        return minScore;
    }
}

function evaluateBoard() {
    let score = 0;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            
            const pieceValue = PIECE_VALUES[piece];
            const positionalValue = getPositionalValue(piece, r, c);
            
            score += pieceValue + positionalValue;
        }
    }
    
    return score;
}

function getPositionalValue(piece, row, col) {
    const isWhite = isWhitePiece(piece);
    const r = isWhite ? row : 7 - row;
    
    const pieceType = piece.toLowerCase();
    
    switch (pieceType) {
        case '♙':
        case '♟':
            return isWhite ? PAWN_TABLE[r][col] : -PAWN_TABLE[r][col];
        case '♘':
        case '♞':
            return isWhite ? KNIGHT_TABLE[r][col] : -KNIGHT_TABLE[r][col];
        case '♗':
        case '♝':
            return isWhite ? BISHOP_TABLE[r][col] : -BISHOP_TABLE[r][col];
        case '♖':
        case '♜':
            return isWhite ? ROOK_TABLE[r][col] : -ROOK_TABLE[r][col];
        case '♕':
        case '♛':
            return isWhite ? QUEEN_TABLE[r][col] : -QUEEN_TABLE[r][col];
        case '♔':
        case '♚':
            return isWhite ? KING_TABLE_MIDDLE[r][col] : -KING_TABLE_MIDDLE[r][col];
        default:
            return 0;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ========================================
// Обновление интерфейса
// ========================================

function updateGameInfo() {
    const turnIndicator = document.getElementById('turn-indicator');
    const playerWhite = document.getElementById('player-white');
    const playerBlack = document.getElementById('player-black');
    
    if (currentTurn === 'white') {
        turnIndicator.innerHTML = '<span class="turn-icon">♔</span><span class="turn-text">Ход белых</span>';
        playerWhite.classList.add('active');
        playerBlack.classList.remove('active');
    } else {
        turnIndicator.innerHTML = '<span class="turn-icon">♚</span><span class="turn-text">Ход чёрных</span>';
        playerWhite.classList.remove('active');
        playerBlack.classList.add('active');
    }
}

function updateMoveHistory() {
    const movesList = document.getElementById('moves-list');
    movesList.innerHTML = '';
    
    for (let i = 0; i < moveHistory.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = moveHistory[i];
        const blackMove = moveHistory[i + 1];
        
        const numEntry = document.createElement('div');
        numEntry.className = 'move-entry';
        numEntry.textContent = `${moveNum}.`;
        
        const whiteEntry = document.createElement('div');
        whiteEntry.className = 'move-entry';
        whiteEntry.textContent = whiteMove.notation;
        
        const blackEntry = document.createElement('div');
        blackEntry.className = 'move-entry';
        blackEntry.textContent = blackMove ? blackMove.notation : '';
        
        movesList.appendChild(numEntry);
        movesList.appendChild(whiteEntry);
        movesList.appendChild(blackEntry);
    }
    
    movesList.scrollTop = movesList.scrollHeight;
}

function updateCapturedPieces() {
    const capturedWhiteEl = document.getElementById('captured-white');
    const capturedBlackEl = document.getElementById('captured-black');
    
    capturedWhiteEl.innerHTML = capturedWhite.map(p => 
        `<span class="captured-piece piece white">${p}</span>`
    ).join('');
    
    capturedBlackEl.innerHTML = capturedBlack.map(p => 
        `<span class="captured-piece piece black">${p}</span>`
    ).join('');
}

function showGameOver(title, message) {
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-message').textContent = message;
    document.getElementById('game-over-modal').classList.add('active');
}

// ========================================
// Таблица лидеров и статистика
// ========================================

const STORAGE_KEY = 'chess_master_stats';

function getPlayerStats() {
    const stats = localStorage.getItem(STORAGE_KEY);
    return stats ? JSON.parse(stats) : {
        wins: 0,
        losses: 0,
        rating: 1000
    };
}

function savePlayerStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function updatePlayerStats(win = null) {
    const stats = getPlayerStats();
    
    if (win === true) {
        stats.wins++;
        stats.rating += 25;
    } else if (win === false) {
        stats.losses++;
        stats.rating = Math.max(0, stats.rating - 25);
    }
    
    savePlayerStats(stats);
    
    document.getElementById('stat-wins').textContent = stats.wins;
    document.getElementById('stat-losses').textContent = stats.losses;
    document.getElementById('stat-rating').textContent = stats.rating;
    
    return stats;
}

function getLeaderboard() {
    const defaultPlayers = [
        { name: 'Magnus', wins: 150, losses: 20, rating: 2850 },
        { name: 'Hikaru', wins: 130, losses: 35, rating: 2750 },
        { name: 'Fabiano', wins: 120, losses: 40, rating: 2700 },
        { name: 'Ian', wins: 100, losses: 50, rating: 2650 },
        { name: 'Anish', wins: 90, losses: 55, rating: 2600 }
    ];
    
    const playerStats = getPlayerStats();
    const allPlayers = [...defaultPlayers, { name: 'Вы', ...playerStats }];
    
    return allPlayers.sort((a, b) => b.rating - a.rating);
}

function renderLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboard = getLeaderboard();
    
    leaderboardBody.innerHTML = leaderboard.map((player, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const isCurrentPlayer = player.name === 'Вы';
        const rowClass = isCurrentPlayer ? 'leaderboard-row current-player' : 'leaderboard-row';
        
        return `
            <div class="${rowClass}">
                <span class="${rankClass}">#${index + 1}</span>
                <span>${player.name}</span>
                <span>${player.wins}</span>
                <span>${player.losses}</span>
                <span>${player.rating}</span>
            </div>
        `;
    }).join('');
}

function resetStats() {
    if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
        savePlayerStats({ wins: 0, losses: 0, rating: 1000 });
        renderLeaderboard();
        updatePlayerStats();
    }
}

// ========================================
// Инициализация при загрузке
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    updatePlayerStats();
});
