// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Generate a unique task ID
function generateTaskId() {
  return nextId++;
}

// Create a task card
function createTaskCard(task) {
  const { id, title, description, dueDate, status } = task;

  // Determine card color based on due date
  const now = dayjs();
  const deadline = dayjs(dueDate);
  let cardColor = "bg-light";
  if (now.isAfter(deadline)) {
    cardColor = "bg-danger text-white"; // Red for overdue
  } else if (now.isAfter(deadline.subtract(1, "day"))) {
    cardColor = "bg-warning"; // Yellow if within a day
  }

  // Create task card elements
  const card = $(`
    <div class="card task-card mb-2 ${cardColor}" data-id="${id}">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description}</p>
        <p class="card-text"><small>Due: ${dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);

  return card;
}

// Render task list and make cards draggable
function renderTaskList() {
  // Clear current tasks
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    if (task.status === "to-do") {
      $("#todo-cards").append(card);
    } else if (task.status === "in-progress") {
      $("#in-progress-cards").append(card);
    } else if (task.status === "done") {
      $("#done-cards").append(card);
    }
  });

  // Make cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone"
  });

  // Add delete task event listeners
  $(".delete-task").on("click", handleDeleteTask);
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#task-title").val();
  const description = $("#task-description").val();
  const dueDate = $("#task-due-date").val();

  if (title && description && dueDate) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: "to-do"
    };

    taskList.push(newTask);
    saveTasks();
    renderTaskList();

    // Reset form and close modal
    $("#task-form")[0].reset();
    $("#formModal").modal("hide");
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest(".task-card");
  const taskId = card.data("id");

  // Remove task from task list
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasks();
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const card = ui.draggable;
  const taskId = card.data("id");

  const newStatus = $(this).attr("id").replace("-cards", "");
  const task = taskList.find(task => task.id === taskId);
  if (task) {
    task.status = newStatus;
    saveTasks();
    renderTaskList();
  }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Render initial task list
  renderTaskList();

  // Add task form submit event
  $("#task-form").on("submit", handleAddTask);

  // Make lanes droppable
  $("#todo-cards, #in-progress-cards, #done-cards").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Make due date a date picker
  $("#task-due-date").datepicker({
    dateFormat: "yy-mm-dd"
  });
});
