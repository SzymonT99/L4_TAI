let question = document.querySelector('.question');
let answers = document.querySelectorAll('.list-group-item');

let pointsElem = document.querySelector('.score');
let restart = document.querySelector('.restart');
let report = document.querySelector('.report');

let counter = document.querySelector('#counter');
let maxQuantity = document.querySelector('#maxQuantity');
let category = document.querySelector('#category');

let userScorePoint = document.querySelector('.userScorePoint');
let userScorePercent = document.querySelector('.userScorePercent');
let average = document.querySelector('.average');
let averagePercent = document.querySelector('.averagePercent');

let list = document.querySelector('.list');
let results = document.querySelector('.results');
let rememberedAnswers = document.querySelector('.rememberedAnswers')

let progressBar = document.querySelector('#myProgressBar');
let timerContainer = document.querySelector('#timer');
let stateAnswers = document.querySelector('#stateAnswers');
let currentTime = document.querySelector('#currentTime');
let header = document.querySelector('.header')

let index = 0;
let points = 0;
counter.innerText = index + 1;
let time = 20;
let quizTimer = null;
let storedAnswers = [];
let storedReport = "";

fetch('https://quiztai.herokuapp.com/api/quiz')
    .then(resp => resp.json())
    .then(resp => {
        let preQuestions = resp;

        setQuestion(0);
        setCategory();
        maxQuantity.innerText = preQuestions.length;
        generateAnswerStates();
        setAnswerState(index + 1);
        startTimer();
        manageQuiz();
        activateAnswers()

        function setQuestion(index) {
            //clearClass();
            question.innerHTML = preQuestions[index].question;

            answers[0].innerHTML = preQuestions[index].answers[0];
            answers[1].innerHTML = preQuestions[index].answers[1];

            if (preQuestions[index].answers.length === 2) {
                answers[2].style.display = 'none';
                answers[3].style.display = 'none';
            }
            else {
                answers[2].style.display = 'block';
                answers[3].style.display = 'block';
            }

            answers[2].innerHTML = preQuestions[index].answers[2];
            answers[3].innerHTML = preQuestions[index].answers[3];
        }

        function goNextQuestion() {
            time = 20;
            index++;
            storedReport += '<div>' + list.innerHTML + '</div>';
            if (index >= preQuestions.length) {
                stopTimer();
                progressBar.style.width = '100%'
                rememberedAnswers.innerHTML = '<h1>Your answers</h1>' + storedReport;
                list.style.display = 'none';
                timerContainer.style.display = 'none';
                header.style.display = 'none';
                document.querySelector('.currentResult').style.display = 'none';
                stateAnswers.style.display = 'none'
                results.style.display = 'block';
                userScorePoint.innerHTML = points;
                userScorePercent.innerHTML = ((points * 100) / preQuestions.length).toString() + "%"
                if (localStorage.getItem("averageResult") !== null) {
                    localStorage.setItem("numberGames", parseInt(localStorage.getItem("numberGames")) + 1)
                    let averageResult = Math.round(((parseInt(localStorage.getItem("sumResults")) + points) / parseInt(localStorage.getItem("numberGames"))) * 100) / 100
                    average.innerHTML = averageResult;
                    averagePercent.innerHTML = ((averageResult * 100) / preQuestions.length).toString() + "%"
                    localStorage.setItem("sumResults", parseInt(localStorage.getItem("sumResults")) + points)
                    localStorage.setItem("averageResult", averageResult);
                }
                else {
                    localStorage.setItem("sumResults", points)
                    localStorage.setItem("averageResult", points);
                    average.innerHTML = points;
                    userScorePercent.innerHTML = ((points * 100) / preQuestions.length).toString() + "%"
                    localStorage.setItem("numberGames", 1);
                }
            }
            else {
                makeDefaultProgresBar();
                setAnswerState(index);
                removeSelection();
                setQuestion(index);
                setCategory();
                activateAnswers();
                counter.innerHTML = index + 1;
            }
        }

        function activateAnswers() {
            for (let i = 0; i < answers.length; i++) {
                answers[i].addEventListener('click', doAction);
            }
        }

        function disableAnswers() {
            for (let i = 0; i < answers.length; i++) {
                answers[i].removeEventListener('click', doAction);
            }
        }

        function markCorrect(elem) {
            elem.classList.add('correct');
        }

        function markInCorrect(elem) {
            elem.classList.add('incorrect');
        }

        function removeSelection() {
            for (let i = 0; i < answers.length; i++) {
                answers[i].classList.remove('correct');
                answers[i].classList.remove('incorrect');
            }
        }

        function setCategory() {
            category.innerHTML = preQuestions[index].category;
        }

        function doAction(event) {
            //event.target - Zwraca referencję do elementu, do którego zdarzenie zostało pierwotnie wysłane.
            if (event.target.innerHTML === preQuestions[index].correct_answer) {
                points++;
                pointsElem.innerHTML = points;
                markCorrect(event.target);
                storedAnswers.push(true)
            }
            else {
                markInCorrect(event.target);
                storedAnswers.push(false)
                for (let i = 0; i < preQuestions[index].answers.length; i++) {
                    if (preQuestions[index].correct_answer === answers[i].textContent) {
                        setTimeout(() => markCorrect(answers[i]), 500)
                    }
                }
            }
            disableAnswers();
            setTimeout(goNextQuestion, 2000);
        }

        restart.addEventListener('click', function (event) {
            event.preventDefault();
            removeSelection();
            startTimer();
            index = 0;
            points = 0;
            storedAnswers = [];
            let userScorePoint = document.querySelector('.score');
            userScorePoint.innerHTML = points;
            counter.innerHTML = index + 1;
            setQuestion(index);
            activateAnswers();
            generateAnswerStates();
            setAnswerState(index + 1);
            list.style.display = 'block';
            timerContainer.style.display = 'block';
            document.querySelector('.currentResult').style.display = 'block';
            header.style.display = 'block';
            stateAnswers.style.display = 'flex'
            results.style.display = 'none';
            rememberedAnswers.innerHTML = "";
            storedReport = "";
            rememberedAnswers.style.display = 'none';
        });

        report.addEventListener('click', function () {
            if (rememberedAnswers.style.display === 'none') {
                rememberedAnswers.style.display = 'block'
            }
            else {
                rememberedAnswers.style.display = 'none'
            }
        })

        function startTimer() {
            quizTimer = setInterval(manageQuiz, 1000)
        }

        function stopTimer() {
            clearInterval(quizTimer);
        }

        function reduceTime() {
            progressBar.style.width = ((time * 100) / 20).toString() + "%"
            if (time > 17 && time < 21) {
                progressBar.classList.add('bg-secondary');
            }
            if (time > 8 && time < 17) {
                progressBar.classList.add('bg-success');
            }
            if (time > 4 && time < 8) {
                progressBar.classList.add('bg-warning');
            }
            if (time < 4) {
                progressBar.classList.add('bg-danger');
            }
            time--;
        }

        function makeDefaultProgresBar() {
            if (progressBar.classList.contains('bg-danger')) progressBar.classList.remove('bg-danger');
            if (progressBar.classList.contains('bg-warning')) progressBar.classList.remove('bg-warning');
            if (progressBar.classList.contains('bg-success')) progressBar.classList.remove('bg-success');
        }

        function manageQuiz() {
            if (time > 0) {
                currentTime.innerHTML = time;
                reduceTime();
            }
            else {
                time = 20;
                currentTime.innerHTML = time;
                makeDefaultProgresBar();
                storedAnswers.push(null);
                goNextQuestion();
                reduceTime();
            }
        }

        function generateAnswerStates() {
            let divContent = ""
            for (let i = 0; i < preQuestions.length; i++) {
                divContent += '<div class="answer" id="a' + (i + 1).toString() + '"></div>';
                if ((i + 1) === preQuestions.length) {
                    divContent += '<div style="margin-right: 1px;"></div>';
                }
            }
            document.getElementById("stateAnswers").innerHTML = divContent;
        }

        function setAnswerState(id) {
            let answerStatus = document.getElementById('a' + id);
            if (storedAnswers.length !== 0) {
                let state = storedAnswers.pop();
                if (state === true) {
                    answerStatus.style.backgroundColor = '#47914A';
                    answerStatus.style.borderColor = '#316F3D';
                }
                if (state === false) {
                    answerStatus.style.backgroundColor = '#B33322';
                    answerStatus.style.borderColor = '#892C26';
                }
                if (state === null) {
                    answerStatus.style.backgroundColor = 'black';
                    answerStatus.style.borderColor = 'black';
                }
                let nextId = ++id;
                document.getElementById('a' + nextId).style.backgroundColor = '#D68F14';
                document.getElementById('a' + nextId).style.backgroundColor = '#D68F14';
            }
            else {
                answerStatus.style.backgroundColor = '#D68F14';
                answerStatus.style.borderColor = '#855B14';
            }
        }

    });
