// ---------- Section switching ----------
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// ======================================================
// 🍅 POMODORO
// ======================================================
let pomodoroDuration = 25 * 60;
let pomodoroTime = pomodoroDuration;
let pomodoroInterval = null;

function updatePomodoroUI() {
  const min = Math.floor(pomodoroTime / 60);
  const sec = pomodoroTime % 60;
  document.getElementById("pomodoroTime").innerText =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startPomodoro() {
  if (pomodoroInterval) return;

  pomodoroInterval = setInterval(() => {
    pomodoroTime--;
    updatePomodoroUI();

    if (pomodoroTime <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroInterval = null;
      showAlert("Pomodoro completed 🍵 Take a break!");
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
  pomodoroTime = pomodoroDuration;
  updatePomodoroUI();
}

updatePomodoroUI();

// ======================================================
// ⏳ COUNTDOWN TIMER (USER DEFINED)
// ======================================================
let timerInterval = null;
let timerTime = 0;

function updateTimerUI() {
  const min = Math.floor(timerTime / 60);
  const sec = timerTime % 60;
  document.getElementById("timerDisplay").innerText =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval) return;

  const input = document.getElementById("timerInput").value;

  if (timerTime === 0) {
    if (!input || input <= 0) {
      showAlert("Enter valid minutes ⏱️");
      return;
    }
    timerTime = input * 60;
  }

  timerInterval = setInterval(() => {
    timerTime--;
    updateTimerUI();

    if (timerTime <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerTime = 0;
      showAlert("Timer completed ⏳");
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerTime = 0;
  updateTimerUI();
}

updateTimerUI();

// ======================================================
// ⏲ STOPWATCH
// ======================================================
let stopwatchInterval = null;
let stopwatchTime = 0;

function updateStopwatchUI() {
  const min = Math.floor(stopwatchTime / 60);
  const sec = stopwatchTime % 60;
  document.getElementById("stopwatchTime").innerText =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startStopwatch() {
  if (stopwatchInterval) return;

  stopwatchInterval = setInterval(() => {
    stopwatchTime++;
    updateStopwatchUI();
  }, 1000);
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
  stopwatchTime = 0;
  updateStopwatchUI();
}

updateStopwatchUI();
