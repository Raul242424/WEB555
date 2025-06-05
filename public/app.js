// Import Firebase SDK (dacă folosești bundler/ES Modules, altfel folosește <script> în HTML)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config din consola ta
const firebaseConfig = {
  apiKey: "AIzaSyDrzrhWbjfz_kqgurr2K1N2UO6wzy1kJ8I",
  authDomain: "todo-app-8324e.firebaseapp.com",
  projectId: "todo-app-8324e",
  storageBucket: "todo-app-8324e.appspot.com",
  messagingSenderId: "889582235093",
  appId: "1:889582235093:web:03895c3541c7abbde0a15c",
  measurementId: "G-BXEV7E28BY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let tasks = []; // array cu task-uri (locale pentru UI)
let firestoreTasks = []; // array cu task-uri din Firestore, cu id pentru update/delete

// Încarcă task-uri din Firestore
async function loadTasks() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  tasks = [];
  firestoreTasks = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    firestoreTasks.push({ id: docSnap.id, ...data });
    tasks.push({ text: data.text, completed: data.completed });
  });
  updateTasksList();
  updateStats();
}

// Salvează un task nou în Firestore
async function saveTaskToFirestore(task) {
  const docRef = await addDoc(collection(db, "tasks"), task);
  firestoreTasks.push({ id: docRef.id, ...task });
  tasks.push(task);
  updateTasksList();
  updateStats();
}

// Șterge task din Firestore și local
async function deleteTaskFirestore(index) {
  const id = firestoreTasks[index].id;
  await deleteDoc(doc(db, "tasks", id));
  firestoreTasks.splice(index, 1);
  tasks.splice(index, 1);
  updateTasksList();
  updateStats();
}

// Actualizează un task în Firestore și local
async function toggleTaskCompleteFirestore(index) {
  const id = firestoreTasks[index].id;
  const newCompleted = !tasks[index].completed;
  await updateDoc(doc(db, "tasks", id), { completed: newCompleted });
  tasks[index].completed = newCompleted;
  updateTasksList();
  updateStats();
}

// Editare task local doar (poți adapta să salvezi în Firestore dacă vrei)
function editTask(index) {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = tasks[index].text;

  // Șterge task-ul și Firestore-ul asociat
  deleteTaskFirestore(index);
}

const saveTasks = () => {
  // Nu mai folosim localStorage, salvăm în Firestore direct
};

const addTask = () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();

  if (text) {
    const newTask = { text: text, completed: false };
    taskInput.value = "";
    saveTaskToFirestore(newTask);
  }
};

const toggleTaskComplete = (index) => {
  toggleTaskCompleteFirestore(index);
};

const deleteTask = (index) => {
  deleteTaskFirestore(index);
};

const updateStats = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  const progressBar = document.getElementById("progress");

  progressBar.style.width = `${progress}%`;

  document.getElementById("numbers").innerText = `${completedTasks} / ${totalTasks}`;

  if (tasks.length && completedTasks === totalTasks) {
    blaskConfetti();
  }
};

const updateTasksList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");

    listItem.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <img src="./img/edit.png" alt="Edit" class="edit-btn" />
          <img src="./img/bin.png" alt="Delete" class="delete-btn" />
        </div>
      </div>
    `;

    const checkbox = listItem.querySelector(".checkbox");
    checkbox.addEventListener("change", () => toggleTaskComplete(index));

    const editBtn = listItem.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => editTask(index));

    const deleteBtn = listItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => deleteTask(index));

    taskList.appendChild(listItem);
  });
};

document.getElementById("newTask").addEventListener("click", function (e) {
  e.preventDefault();
  addTask();
});

const blaskConfetti = () => {
  const count = 200,
    defaults = {
      origin: { y: 0.7 },
    };

  function fire(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
      })
    );
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

const themeSwitcher = document.getElementById("themeSwitcher");

document.addEventListener("DOMContentLoaded", () => {
  loadTasks(); // încărcăm task-uri din Firestore la start

  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.classList.toggle("light", savedTheme === "light");
  themeSwitcher.checked = savedTheme === "light";
});

themeSwitcher.addEventListener("change", () => {
  const isLight = themeSwitcher.checked;
  document.documentElement.classList.toggle("light", isLight);
  localStorage.setItem("theme", isLight ? "light" : "dark");
});
