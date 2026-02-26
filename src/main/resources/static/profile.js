function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = '/log';
}

// Получаем email из localStorage для отправки запросов
function getUserEmail() {
    return localStorage.getItem('userEmail');
}

function goToProfilePage() {
    const email = getUserEmail();
    if (email) {
        window.location.href = '/profile?email=' + encodeURIComponent(email);
    } else {
        window.location.href = '/log';
    }
}

// Загрузка вопросов (загружаем только когда нужно)
let allQuestions = null;
let questionsLoading = false;

async function loadQuestionsIfNeeded() {
    if (allQuestions !== null) {
        return allQuestions; // Уже загружены
    }

    if (questionsLoading) {
        // Ждём пока загружаются
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (allQuestions !== null) {
                    clearInterval(checkInterval);
                    resolve(allQuestions);
                }
            }, 100);
        });
    }

    questionsLoading = true;
    try {
        const response = await fetch('/questions');
        allQuestions = await response.json();
        console.log('Вопросы загружены:', allQuestions.length);
        questionsLoading = false;
        return allQuestions;
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        questionsLoading = false;
        return [];
    }
}

// Показать детали теста
async function showTestDetails(card) {
    const answersJson = card.getAttribute('data-answers');
    const personality = card.getAttribute('data-personality');
    const date = card.getAttribute('data-date');

    if (!answersJson) {
        alert('Детали теста недоступны');
        return;
    }

    // Показываем модальное окно сразу с индикатором загрузки
    document.getElementById('modalTitle').textContent = personality;
    document.getElementById('modalDate').textContent = `Пройден: ${date}`;
    document.getElementById('testDetailsContent').innerHTML = '<div style="text-align: center; padding: 40px; color: #a78bfa;">Загрузка вопросов...</div>';
    document.getElementById('testDetailsModal').classList.add('active');

    // Загружаем вопросы если ещё не загружены
    const questions = await loadQuestionsIfNeeded();

    try {
        const answers = JSON.parse(answersJson);

        const content = document.getElementById('testDetailsContent');
        content.innerHTML = '';

        // Показываем вопросы и ответы
        Object.keys(answers).forEach((questionIndex, index) => {
            const userAnswer = answers[questionIndex];
            const question = questions[parseInt(questionIndex)];

            if (question) {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question-detail';

                let html = `<div class="question-text"><strong>Вопрос ${index + 1}:</strong> ${question.question}</div>`;

                // Показываем все варианты ответов
                Object.keys(question.options).forEach(optionKey => {
                    const option = question.options[optionKey];
                    const isSelected = optionKey === userAnswer;
                    html += `<div class="answer-option ${isSelected ? 'selected' : ''}">
                        ${isSelected ? '✓ ' : ''}${optionKey}: ${option.text}
                    </div>`;
                });

                questionDiv.innerHTML = html;
                content.appendChild(questionDiv);
            }
        });
    } catch (error) {
        console.error('Ошибка парсинга ответов:', error);
        document.getElementById('testDetailsContent').innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Не удалось загрузить детали теста</div>';
    }
}

// Закрыть модальное окно
function closeTestDetailsModal() {
    document.getElementById('testDetailsModal').classList.remove('active');
}

function toggleAllResults() {
    const allResultsGrid = document.getElementById('allResultsGrid');
    const toggleBtn = document.getElementById('toggleResultsBtn');
    if (!allResultsGrid || !toggleBtn) {
        return;
    }

    const isHidden = allResultsGrid.classList.contains('hidden');
    if (isHidden) {
        allResultsGrid.classList.remove('hidden');
        toggleBtn.textContent = 'Свернуть';
        allResultsGrid.scrollTop = 0;
    } else {
        allResultsGrid.classList.add('hidden');
        toggleBtn.textContent = 'Просмотреть все';
        // Возвращаем пользователя к началу блока результатов
        toggleBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function toggleTermsInfo() {
    const content = document.getElementById('termsContent');
    const icon = document.getElementById('termsToggleIcon');
    if (!content || !icon) {
        return;
    }

    const isHidden = content.classList.contains('hidden');
    if (isHidden) {
        content.classList.remove('hidden');
        icon.textContent = '▲';
    } else {
        content.classList.add('hidden');
        icon.textContent = '▼';
    }
}

// Проверяем авторизацию и перенаправляем на профиль с email
document.addEventListener('DOMContentLoaded', function() {
    const email = getUserEmail();
    if (!email) {
        window.location.href = '/log';
    } else {
        // Добавляем email к URL если его нет
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('email')) {
            window.location.href = '/profile?email=' + email;
        }
    }

    // НЕ загружаем вопросы сразу - загрузим при клике на карточку
    
    // Анимация графиков при загрузке
    const chartBars = document.querySelectorAll('.chart-bar-fill');
    chartBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
});

