const timerDisplay = document.querySelector('.display__time-left');
const endTime = document.querySelector('.display__end-time');
const pomoTurn = document.querySelector('.display__pomo');
const buttons = document.querySelectorAll('[data-time]');
const pomodoroButton = document.querySelector('.pomodoro');
let countdown;
let pomo = false;
let bellSound = new Audio("Assets/Bell.mp3");

//Creating an event emmiter for pomodoro
class EventEmitter {
    constructor() {
        this.listeners = {};
    }


    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach(l => l(message, payload));
        }
    }
    clear() {
        this.listeners = {};
    }
}

let eventEmitter = new EventEmitter();



function timer(seconds) {
    clearInterval(countdown);
    const now = Date.now();
    const then = now + seconds * 1000;

    displayTimeLeft(seconds);
    displayEndTime(then)

    countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000);
        if (secondsLeft < 0) {
            clearInterval(countdown);
            if (pomo && seconds === 1500) { //25 mins
                eventEmitter.emit("FINISHED25");
            }
            if (pomo && seconds === 30) { //5 mins
                eventEmitter.emit("FINISHED5")
            }
            if (pomo && seconds === 1800) {//30 mins
                eventEmitter.emit("FINISHED30");
            }
            return;
        }
        if (secondsLeft === 0 && pomo == false) bellSound.play();
        displayTimeLeft(secondsLeft);
    }, 1000);
}

function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    timerDisplay.textContent = display;
    document.title = display;
}


function displayEndTime(timestamp) {
    const end = new Date(timestamp);
    const hour = end.getHours();
    const minutes = end.getMinutes();
    endTime.textContent = `Be back at ${hour}:${minutes < 10 ? '0' : ''}${minutes}`
}

function startTimer() {
    pomo = false;
    pomoTurn.textContent = '';
    const seconds = parseInt(this.dataset.time);
    timer(seconds)
}

async function startPomodoro() {
    pomo = true
    timer(1500); //25 mins
    let i = 1;
    pomoTurn.textContent = i + ' Pomodoro';
    eventEmitter.on("FINISHED25", () => {
        pomoTurn.textContent += ' - BREAK';
        bellSound.play();
        timer(300) //5 mins
    });
    eventEmitter.on("FINISHED5", () => {
        i++;
        pomoTurn.textContent = i + ' Pomodoro';
        if (i === 4) {
            timer(1800) //30 mins
            bellSound.play();
        }
        else {
            timer(1500) //1500
            bellSound.play();
        } //25 mins
    });
    eventEmitter.on("FINISHED30", () => {
        pomo = false;
        bellSound.play();
        pomoTurn.textContent = "Pomodoro Finished"
        return;
    })
}

buttons.forEach(button => button.addEventListener('click', startTimer));
document.customForm.addEventListener('submit', function (e) {
    pomo = false;
    pomoTurn.textContent = '';
    e.preventDefault();
    const mins = parseFloat(this.minutes.value);
    timer(mins * 60)
    this.reset();
})
pomodoroButton.addEventListener('click', startPomodoro)
