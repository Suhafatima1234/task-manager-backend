const BASE_URL = window.location.origin;

// ---------- REGISTER ----------
async function register() {
  const res = await fetch(BASE_URL + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const msg = await res.text();
  document.getElementById("status").innerText = msg;

  if (res.ok) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
}

// ---------- LOGIN (WITH ERROR HANDLING) ----------
async function login() {
  const res = await fetch(BASE_URL + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  // ❌ wrong credentials
  if (!res.ok) {
    const errorMsg = await res.text();
    document.getElementById("status").innerText = errorMsg;
    return;
  }

  // ✅ correct credentials
  const data = await res.json();
  localStorage.setItem("token", data.token);
  window.location.href = "dashboard.html";
}

// ---------- LOGOUT ----------
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ---------- ALERT SYSTEM ----------
function showAlert(message) {
  const alertBox = document.getElementById("alertBox");
  if (!alertBox) return;

  alertBox.innerText = message;
  alertBox.classList.add("show");

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 2500);
}

// ---------- TASKS ----------
async function addTask() {
  await fetch(BASE_URL + "/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      title: taskTitle.value,
      done: false
    })
  });

  taskTitle.value = "";
  showAlert("Task added successfully ✅");
  loadTasks();
}

async function loadTasks() {
  const res = await fetch(BASE_URL + "/tasks", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });

  const tasks = await res.json();
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach(t => {
  const li = document.createElement("li");
  li.className = "task-row";

  li.innerHTML = `
  <div class="task-left">
    <input type="checkbox"
      ${t.done ? "checked" : ""}
      onchange="toggleTask('${t._id}', ${!t.done})">

    <span class="task-title ${t.done ? "done" : ""}"
      id="title-${t._id}">
      ${t.title}
    </span>

    <input class="edit-input"
      id="edit-${t._id}"
      value="${t.title}"
      style="display:none"
      onkeydown="handleEditKey(event, '${t._id}')">
  </div>

  <div class="task-actions">
    <button class="icon-btn"
      onclick="enableEdit('${t._id}')">✏️</button>

    <button class="icon-btn success"
      style="display:none"
      id="save-${t._id}"
      onclick="saveEdit('${t._id}')">✔</button>

    <button class="icon-btn danger"
      onclick="deleteTask('${t._id}')">🗑️</button>
  </div>
`;


  taskList.appendChild(li);
});

}

// ---------- TOGGLE DONE ----------
async function toggleTask(id, newStatus) {
  await fetch(BASE_URL + "/tasks/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ done: newStatus })
  });

  showAlert(
    newStatus
      ? "Task marked as completed ✅"
      : "Task marked as pending ⏳"
  );

  loadTasks();
}

function enableEdit(id) {
  document.getElementById(`title-${id}`).style.display = "none";
  document.getElementById(`edit-${id}`).style.display = "inline-block";
  document.getElementById(`save-${id}`).style.display = "inline-block";

  document.getElementById(`edit-${id}`).focus();
}

function handleEditKey(event, id) {
  if (event.key === "Enter") {
    saveEdit(id);
  }
}

async function saveEdit(id) {
  const input = document.getElementById(`edit-${id}`);
  const newTitle = input.value.trim();

  if (!newTitle) return;

  await fetch(BASE_URL + "/tasks/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ title: newTitle })
  });

  showAlert("Task updated successfully ✏️");
  loadTasks();
}

// ---------- EDIT TASK ----------
async function editTask(id, oldTitle) {
  const newTitle = prompt("Edit task title:", oldTitle);
 if (!newTitle || newTitle.trim() === oldTitle) return;


  await fetch(BASE_URL + "/tasks/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ title: newTitle })
  });

  showAlert("Task updated successfully ✏️");
  loadTasks();
}

// ---------- DELETE TASK ----------
async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  await fetch(BASE_URL + "/tasks/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });

  showAlert("Task deleted successfully 🗑️");
  loadTasks();
}

function togglePassword(id, eyeElement) {
  const input = document.getElementById(id);
  const icon = eyeElement.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("bi-eye");
    icon.classList.add("bi-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  }
}


