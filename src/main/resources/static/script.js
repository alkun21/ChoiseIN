let currentQuestion = 0;
let selectedAnswer = null;
let selectedCount = 10;
let questionIndices = [];
let answers = {}; // теперь объект, не массив!
let questions = [];
let userName = '';
let currentResults = null; // для шеринга результатов

// --- Сохраняем email из URL (после входа) ---
const urlParams = new URLSearchParams(window.location.search);
const emailFromUrl = urlParams.get('email');
if (emailFromUrl) {
    localStorage.setItem('userEmail', emailFromUrl);
    console.log('✅ Email сохранён:', emailFromUrl);
}

// Загружаем вопросы с сервера
async function loadQuestions() {
    try {
        const response = await fetch('/questions');
        questions = await response.json();
        console.log('Загружено вопросов:', questions.length);
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        alert('Ошибка загрузки вопросов. Попробуйте обновить страницу.');
    }
}

function getRandomQuestions(count) {
    const indices = [];
    const available = [...Array(questions.length).keys()];

    for (let i = 0; i < Math.min(count, questions.length); i++) {
        const randomIdx = Math.floor(Math.random() * available.length);
        indices.push(available[randomIdx]);
        available.splice(randomIdx, 1);
    }

    return indices;
}

function showWelcome() {
    showScreen('welcomeScreen');
}

function showCountSelection() {
    selectedCount = 10;
    document.getElementById('countSlider').value = 10;
    document.getElementById('sliderValue').textContent = '10';
    document.getElementById('finalCount').textContent = '10';
    document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('selected'));
    showScreen('countSelectionScreen');
}

function selectCount(count) {
    selectedCount = count;
    document.getElementById('countSlider').value = count;
    document.getElementById('sliderValue').textContent = count;
    document.getElementById('finalCount').textContent = count;

    document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function updateSliderCount(value) {
    selectedCount = value;
    document.getElementById('sliderValue').textContent = value;
    document.getElementById('finalCount').textContent = value;
    document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('selected'));
}

function startTest() {
    if (questions.length === 0) {
        alert('Вопросы еще загружаются. Пожалуйста, подождите.');
        return;
    }

    currentQuestion = 0;
    answers = {}; // сбрасываем объект
    questionIndices = getRandomQuestions(selectedCount);
    showScreen('questionScreen');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= questionIndices.length) {
        showResults();
        return;
    }

    const questionIdx = questionIndices[currentQuestion];
    const q = questions[questionIdx];

    document.getElementById('questionNumber').textContent = `Вопрос ${currentQuestion + 1} из ${selectedCount}`;
    document.getElementById('questionText').textContent = q.question;

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';

    Object.keys(q.options).forEach(letter => {
        const option = q.options[letter];
        const div = document.createElement('div');
        div.className = 'choice';
        div.onclick = () => selectChoice(div, letter);
        div.innerHTML = `<div class="choice-label">${option.text}</div>`;
        choicesDiv.appendChild(div);
    });

    document.getElementById('prevBtn').style.visibility = currentQuestion > 0 ? 'visible' : 'hidden';
    document.getElementById('nextBtn').disabled = true;
    selectedAnswer = null;

    updateProgress();
}

function selectChoice(element, letter) {
    document.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    selectedAnswer = letter;
    document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
    if (selectedAnswer === null) return;

    // сохраняем как объект { "0": "A", "1": "B" }
    answers[currentQuestion] = selectedAnswer;
    currentQuestion++;

    if (currentQuestion < selectedCount) {
        loadQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / selectedCount) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

async function showResults() {
    try {
        console.log("Отправляем ответы:", JSON.stringify(answers, null, 2)); // для проверки

        const response = await fetch('/submit-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: userName || 'Анонимный пользователь',
                userEmail: localStorage.getItem('userEmail') || null,
                answers: answers
            })
        });

        const result = await response.json();

        if (result.success) {
            displayResults(result);
        } else {
            throw new Error('Ошибка обработки результатов');
        }
    } catch (error) {
        console.error('Ошибка отправки результатов:', error);
        alert('Ошибка обработки результатов. Попробуйте еще раз.');
    }
}

function displayResults(result) {
    currentResults = result; // Сохраняем для шеринга

    document.getElementById('profileTitle').textContent = result.personalityType;

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';

    const sortedCategories = Object.entries(result.percentages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);

    sortedCategories.forEach(([category, percentage]) => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-value">${percentage.toFixed(1)}%</div>
            <div class="stat-label">${category}</div>
        `;
        statsGrid.appendChild(statCard);
    });

    const description = document.getElementById('profileDescription');
    description.innerHTML = generateProfileDescription(result.personalityType, result.percentages);

    // Проверяем поддержку Web Share API
    if (navigator.share) {
        const webShareBtn = document.getElementById('webShareBtn');
        if (webShareBtn) {
            webShareBtn.style.display = 'flex';
        }
    }

    showScreen('resultsScreen');
}

function generateProfileDescription(personalityType, percentages) {
    const topCategories = Object.entries(percentages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    let description = `<p><strong>Ваш профиль:</strong> ${personalityType}</p>`;

    if (topCategories.length > 0) {
        const [topCategory, topPercentage] = topCategories[0];
        description += `<p>Ваша доминирующая черта — <strong>${topCategory}</strong> (${topPercentage.toFixed(1)}%). `;

        if (topCategories.length > 1) {
            const [secondCategory, secondPercentage] = topCategories[1];
            description += `Также выражены <strong>${secondCategory}</strong> (${secondPercentage.toFixed(1)}%)`;
            if (topCategories.length > 2) {
                const [thirdCategory, thirdPercentage] = topCategories[2];
                description += ` и <strong>${thirdCategory}</strong> (${thirdPercentage.toFixed(1)}%)`;
            }
            description += '.';
        }
    }

    description += '</p><p>Этот профиль отражает ваши основные моральные принципы и подход к принятию решений в сложных ситуациях.</p>';
    return description;
}

function getAccuracyLevel(count) {
    if (count >= 80) return 'Очень высокая';
    if (count >= 50) return 'Высокая';
    if (count >= 25) return 'Средняя';
    return 'Базовая';
}

function restartTest() {
    currentQuestion = 0;
    answers = {};
    selectedAnswer = null;
    showCountSelection();
}

// Открыть модальное окно шеринга
function openShareModal() {
    document.getElementById('shareModal').classList.add('active');
}

// Закрыть модальное окно
function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('shareSuccess').style.display = 'none';
    }, 300);
}

// Копировать результаты как текст
function copyResultsText() {
    if (!currentResults) return;

    const topCategories = Object.entries(currentResults.percentages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    let text = `🎯 Мой моральный профиль: ${currentResults.personalityType}\n\n`;
    text += `📊 Мои показатели:\n`;

    topCategories.forEach(([category, percentage], index) => {
        text += `${index + 1}. ${category}: ${percentage.toFixed(1)}%\n`;
    });

    text += `\n✨ Пройди тест на ChoiseIN и узнай свой моральный профиль!`;
    text += `\n🔗 ${window.location.origin}`;

    navigator.clipboard.writeText(text).then(() => {
        showShareSuccess();
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать текст');
    });
}

// Скачать результаты как картинку
async function downloadResultsImage() {
    if (!currentResults) return;

    // Проверяем наличие html2canvas
    if (typeof html2canvas === 'undefined') {
        alert('Загружаем библиотеку для создания изображения...');
        await loadHtml2Canvas();
    }

    const resultsCard = document.getElementById('resultsCard');
    const buttons = resultsCard.querySelector('.btn-group');

    // Временно скрываем кнопки
    buttons.style.display = 'none';

    try {
        const canvas = await html2canvas(resultsCard, {
            backgroundColor: null,
            scale: 2,
            logging: false
        });

        // Создаем новый canvas с градиентным фоном
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext('2d');

        // Рисуем градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, finalCanvas.width, finalCanvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Накладываем карточку с результатами
        ctx.drawImage(canvas, 0, 0);

        // Возвращаем кнопки
        buttons.style.display = 'flex';

        // Скачиваем изображение
        const link = document.createElement('a');
        link.download = `ChoiseIN-${currentResults.personalityType}.png`;
        link.href = finalCanvas.toDataURL('image/png');
        link.click();

        showShareSuccess();

    } catch (error) {
        buttons.style.display = 'flex';
        console.error('Ошибка создания изображения:', error);
        alert('Не удалось создать изображение');
    }
}

// Загрузка html2canvas библиотеки
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Поделиться через Web Share API (мобильные устройства)
function shareViaWebAPI() {
    if (!currentResults || !navigator.share) return;

    const topCategories = Object.entries(currentResults.percentages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    const topCategory = topCategories[0];

    navigator.share({
        title: `Мой моральный профиль: ${currentResults.personalityType}`,
        text: `Я прошёл тест на ChoiseIN! Моя доминирующая черта — ${topCategory[0]} (${topCategory[1].toFixed(1)}%). Узнай свой моральный профиль!`,
        url: window.location.origin
    }).then(() => {
        showShareSuccess();
    }).catch((error) => {
        if (error.name !== 'AbortError') {
            console.error('Ошибка шеринга:', error);
        }
    });
}

// Показать сообщение об успехе
function showShareSuccess() {
    const successMsg = document.getElementById('shareSuccess');
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
}

// Устаревшая функция - оставляем для совместимости
function shareResults() {
    openShareModal();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = '/log';
}

function goToProfile() {
    const email = localStorage.getItem('userEmail');
    if (email) {
        window.location.href = '/profile?email=' + email;
    } else {
        window.location.href = '/log';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    updateAuthHint(); // Показать/скрыть подсказку о регистрации
});

// Показать подсказку о регистрации только неавторизованным
function updateAuthHint() {
    const authHint = document.querySelector('.auth-hint');
    const userEmail = localStorage.getItem('userEmail');

    if (authHint) {
        if (userEmail) {
            // Пользователь авторизован - скрываем подсказку
            authHint.style.display = 'none';
        } else {
            // Пользователь НЕ авторизован - показываем подсказку
            authHint.style.display = 'block';
        }
    }

    // Обновляем навигационные кнопки
    const authButtons = document.querySelectorAll('.auth-only');
    const guestButtons = document.querySelectorAll('.guest-only');

    if (userEmail) {
        // Показываем кнопки для авторизованных
        authButtons.forEach(btn => btn.style.display = 'inline-block');
        guestButtons.forEach(btn => btn.style.display = 'none');
    } else {
        // Показываем кнопки для гостей
        authButtons.forEach(btn => btn.style.display = 'none');
        guestButtons.forEach(btn => btn.style.display = 'inline-block');
    }
}
