document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const messageBox = document.getElementById('message');
    const fullSong = document.getElementById('full-song');

    // Chú ý: Chuỗi nốt nhạc bạn cung cấp là C C D C F E
    const happyBirthdaySequence = ['c4', 'c4', 'd4', 'c4', 'f4', 'e4'];
    let userSequence = [];

    keys.forEach(key => {
        key.addEventListener('click', () => {
            const note = key.getAttribute('data-note');
            
            // Phát âm thanh của nốt nhạc
            const audio = document.getElementById(note.replace('#', '-sharp') + '-sound');
            if (audio) {
                audio.currentTime = 0; // Đặt lại thời gian về 0 để có thể phát lại ngay lập tức
                audio.play();
            }

            userSequence.push(note);
            
            // Kiểm tra chuỗi người dùng nhập
            if (userSequence.length === happyBirthdaySequence.length) {
                const isCorrect = userSequence.every((value, index) => value === happyBirthdaySequence[index]);
                
                if (isCorrect) {
                    fullSong.play();
                    messageBox.style.display = 'block';
                } else {
                    alert('Sai rồi! Thử lại nhé.');
                }
                
                userSequence = [];
            }
        });
    });
});