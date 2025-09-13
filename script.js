document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const messageBox = document.getElementById('message');
    const fullSong = document.getElementById('full-song');
    const pianoElement = document.querySelector('.piano');
    const instructionsElement = document.getElementById('instructions');
    const puzzleContainer = document.getElementById('puzzle-game');
    const puzzleSolvedSound = new Audio('sounds/puzzle_solved.mp3');
    const puzzleWrongSound = new Audio('sounds/puzzle_wrong.mp3');

    const happyBirthdaySequence = ['c4', 'c4', 'd4', 'c4', 'f4', 'e4'];
    let userSequence = [];
    let game1Completed = false;

    const candleContainer = document.getElementById('candle-game');
    const qrContainer = document.getElementById('video-qr-container');
    const cakeImage = document.getElementById('cake-image');
    let candlesBlownOut = 0; // Thêm biến đếm số lần thổi nến

    // --- LOGIC TRÒ CHƠI KÉO THẢ (Đã tối ưu cho cả chuột và cảm ứng) ---
    let draggedPiece = null;
    let offsetX, offsetY;

    // Sự kiện chuột
    document.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('puzzle-piece') && !e.target.classList.contains('solved')) {
            draggedPiece = e.target;
            offsetX = e.clientX - draggedPiece.getBoundingClientRect().left;
            offsetY = e.clientY - draggedPiece.getBoundingClientRect().top;
            draggedPiece.style.zIndex = '100';
            draggedPiece.style.transition = 'none'; 
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (draggedPiece) {
            const containerRect = puzzleContainer.getBoundingClientRect();
            draggedPiece.style.left = `${e.clientX - offsetX - containerRect.left}px`;
            draggedPiece.style.top = `${e.clientY - offsetY - containerRect.top}px`;
        }
    });

    // Sự kiện cảm ứng (cho điện thoại)
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('puzzle-piece') && !e.target.classList.contains('solved')) {
            e.preventDefault(); // Ngăn trình duyệt cuộn trang
            draggedPiece = e.target;
            offsetX = e.touches[0].clientX - draggedPiece.getBoundingClientRect().left;
            offsetY = e.touches[0].clientY - draggedPiece.getBoundingClientRect().top;
            draggedPiece.style.zIndex = '100';
            draggedPiece.style.transition = 'none';
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (draggedPiece) {
            const containerRect = puzzleContainer.getBoundingClientRect();
            draggedPiece.style.left = `${e.touches[0].clientX - offsetX - containerRect.left}px`;
            draggedPiece.style.top = `${e.touches[0].clientY - offsetY - containerRect.top}px`;
        }
    });

    // Sự kiện kết thúc (dùng chung cho cả chuột và cảm ứng)
    document.addEventListener('mouseup', handleDrop);
    document.addEventListener('touchend', handleDrop);
    document.addEventListener('touchcancel', handleDrop);

    function handleDrop() {
        if (draggedPiece) {
            draggedPiece.style.zIndex = '1';
            draggedPiece.style.transition = '';
            
            const pieceData = puzzlePieces.find(p => p.id === parseInt(draggedPiece.dataset.id));
            const rect = draggedPiece.getBoundingClientRect();
            const correctTop = puzzleContainer.getBoundingClientRect().top + pieceData.top;
            const correctLeft = puzzleContainer.getBoundingClientRect().left + pieceData.left;
            
            if (Math.abs(rect.top - correctTop) < 30 && Math.abs(rect.left - correctLeft) < 30 && !draggedPiece.classList.contains('solved')) {
                draggedPiece.style.top = `${pieceData.top}px`;
                draggedPiece.style.left = `${pieceData.left}px`;
                draggedPiece.classList.add('solved');
                puzzleSolvedSound.currentTime = 0;
                puzzleSolvedSound.play();
            } else {
                puzzleWrongSound.currentTime = 0;
                puzzleWrongSound.play();
            }
            
            const totalSolvedPieces = document.querySelectorAll('.puzzle-piece.solved').length;
            if (totalSolvedPieces === puzzlePieces.length) {
                // Kích hoạt GIAI ĐOẠN MỚI: Thổi nến
                setTimeout(() => {
                    puzzleContainer.style.display = 'none';
                    candleContainer.style.display = 'block';
                }, 500);
            }
            draggedPiece = null;
        }
    }
    
    // --- LOGIC TRÒ CHƠI CHUNG ---
    const puzzlePieces = [
        { id: 1, top: 0, left: 0, backgroundPosition: '0 0' },
        { id: 2, top: 0, left: 200, backgroundPosition: '-200px 0' },
        { id: 3, top: 0, left: 400, backgroundPosition: '-400px 0' },
        { id: 4, top: 200, left: 0, backgroundPosition: '0 -200px' },
        { id: 5, top: 200, left: 200, backgroundPosition: '-200px -200px' },
        { id: 6, top: 200, left: 400, backgroundPosition: '-400px -200px' },
    ];

    function createPuzzlePieces() {
        puzzleContainer.innerHTML = '';
        puzzlePieces.forEach(pieceData => {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.id = pieceData.id;
            
            piece.style.top = `${Math.random() * 150}px`;
            piece.style.left = `${Math.random() * 300}px`;
            
            piece.style.backgroundPosition = pieceData.backgroundPosition;
            puzzleContainer.appendChild(piece);
        });
    }

    keys.forEach(key => {
        // Sự kiện cho máy tính
        key.addEventListener('click', (e) => {
            handleKeyPress(e.target.closest('.key'));
        });
    
        // Sự kiện cho điện thoại (khắc phục độ trễ)
        key.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Ngăn trình duyệt phóng to/thu nhỏ
            handleKeyPress(e.target.closest('.key'));
        });
    });

    function handleKeyPress(key) {
        if (!key) return; // Đảm bảo phím được chọn là hợp lệ

        const note = key.getAttribute('data-note');
        if (!game1Completed) {
            const audio = document.getElementById(note.replace('#', '-sharp') + '-sound');
            if (audio) {
                audio.currentTime = 0;
                audio.play();
            }

            userSequence.push(note);
        
            if (userSequence.length === happyBirthdaySequence.length) {
                const isCorrect = userSequence.every((value, index) => value === happyBirthdaySequence[index]);
            
                if (isCorrect) {
                    fullSong.play();
                    messageBox.style.display = 'block';
                    instructionsElement.style.display = 'none';
                    game1Completed = true;
                } else {
                    alert('Có dị cx sai. Dì mà kém thía !');
                    userSequence = [];
                }
            }
        } else {
            if (note === 'c4' || note === 'd4') {
                pianoElement.style.display = 'none';
                messageBox.style.display = 'none';
                puzzleContainer.style.display = 'block';
                createPuzzlePieces();
            }
        }
    }
    // --- LOGIC TRÒ CHƠI THỔI NẾN (có thêm tỉ lệ thành công) ---
    let isFirstBlow = true; // Biến mới để kiểm tra lần thổi đầu tiên
    candleContainer.addEventListener('click', () => {
        // Hiển thị thông báo lần đầu tiên
        if (isFirstBlow) {
            alert('Thổi tắt đủ 20 cây nến thì mới có quà nha!');
            isFirstBlow = false;
        }

        // Tỉ lệ thổi nến thành công (80%)
        const successRate = 0.8;
        const isSuccess = Math.random() < successRate;

        if (isSuccess) {
            candlesBlownOut++;
            if (candlesBlownOut < 20) {
                alert(`Bà thổi được ${candlesBlownOut} cây gòi nè. Típ i típ i!`);
            } else {
                alert('YEEEEEEE! Nến tắt hết ròi nè! Mau quét mã lấy quà đi nà!');
                candleContainer.style.display = 'none';
                qrContainer.style.display = 'block';
            }
        } else {
            alert('Ôi không! Gió quá mạnh, nến vẫn chưa tắt. Hãy thử lại!');
        }
    });
});
