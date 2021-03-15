let next = document.querySelector('.next');
let previous = document.querySelector('.previous');

let question = document.querySelector('.question');
let answers = document.querySelectorAll('.list-group-item');

let pointsElem = document.querySelector('.score');
let restart = document.querySelector('.restart');

let counter = document.querySelector('#counter');
let maxQuantity = document.querySelector('#maxQuantity');
let category = document.querySelector('#category');

let userScorePoint = document.querySelector('.userScorePoint');
let average = document.querySelector('.average');

let list = document.querySelector('.list');
let results = document.querySelector('.results');

let index = 0;
let points = 0;
counter.innerText = index + 1;



fetch('https://quiztai.herokuapp.com/api/quiz')
    .then(resp => resp.json())
    .then(resp => {
        preQuestions = resp;
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

        setQuestion(0);
        setCategory();
        maxQuantity.innerText = preQuestions.length;

        next.addEventListener('click', function () {
            index++;
            if (index >= preQuestions.length) {
                list.style.display = 'none';
                results.style.display = 'block';
                userScorePoint.innerHTML = points;
                if (localStorage.getItem("averageResult") !== null) {
                    localStorage.setItem("numberGames", parseInt(localStorage.getItem("numberGames")) + 1)
                    let averageResult = Math.round(((parseInt(localStorage.getItem("sumResults")) + points) / parseInt(localStorage.getItem("numberGames"))) * 100) / 100
                    average.innerText = averageResult;
                    localStorage.setItem("sumResults", parseInt(localStorage.getItem("sumResults")) + points)
                    localStorage.setItem("averageResult", averageResult);
                }
                else {
                    localStorage.setItem("sumResults", points)
                    localStorage.setItem("averageResult", points);
                    average.innerText = points;
                    localStorage.setItem("numberGames", 1);
                }
            }
            else {
                setQuestion(index);
                setCategory();
                activateAnswers();
                counter.innerText = index + 1;
                removeSelection();
            }
        });

        previous.addEventListener('click', function () {
            if (index > 0) {
                index--;
                setQuestion(index);
                counter.innerText = index + 1;
            }
            disableAnswers();
            removeSelection();
        });

        function activateAnswers() {
            for (let i = 0; i < answers.length; i++) {
                answers[i].addEventListener('click', doAction);
            }
        }

        activateAnswers()

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
            category.innerText = preQuestions[index].category;
        }

        function doAction(event) {
            //event.target - Zwraca referencję do elementu, do którego zdarzenie zostało pierwotnie wysłane.
            if (event.target.innerHTML === preQuestions[index].correct_answer) {
                points++;
                pointsElem.innerText = points;
                markCorrect(event.target);
            }
            else {
                markInCorrect(event.target);
            }
            disableAnswers();
        }

        restart.addEventListener('click', function (event) {
            event.preventDefault();
            removeSelection();
            index = 0;
            points = 0;
            let userScorePoint = document.querySelector('.score');
            userScorePoint.innerHTML = points;
            counter.innerText = index + 1;
            setQuestion(index);
            activateAnswers();
            list.style.display = 'block';
            results.style.display = 'none';
        });

    });
