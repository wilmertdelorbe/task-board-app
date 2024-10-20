// Initialize task list and next ID from localStorage or set default values
let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

// Function to create a task card DOM element
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    taskCard.setAttribute('data-task-id', task.id);
    taskCard.draggable = true;

    // Create and append title element
    const title = document.createElement('h3');
    title.textContent = task.title;
    taskCard.appendChild(title);

    // Create and append description element
    const description = document.createElement('p');
    description.textContent = task.description;
    taskCard.appendChild(description);

    // Create and append due date element
    const dueDate = document.createElement('p');
    dueDate.textContent = `Due: ${task.dueDate}`;
    taskCard.appendChild(dueDate);

    // Add delete button for all tasks
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.setAttribute('data-task-id', task.id);
    taskCard.appendChild(deleteBtn);

    // Color coding based on due date
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate);
    if (now.isSame(taskDueDate, 'day')) {
        taskCard.classList.add('due-soon');
    } else if (now.isAfter(taskDueDate)) {
        taskCard.classList.add('overdue');
    }

    return taskCard;
}

// Function to render all tasks in their respective lanes
function renderTaskList() {
    const todoList = document.querySelector('#todo-cards');
    const inProgressList = document.querySelector('#in-progress-cards');
    const doneList = document.querySelector('#done-cards');

    // Clear existing tasks
    todoList.innerHTML = '<h2>To Do</h2>';
    inProgressList.innerHTML = '<h2>In Progress</h2>';
    doneList.innerHTML = '<h2>Done</h2>';

    // Render tasks in appropriate lanes
    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        if (task.status === 'todo') {
            todoList.appendChild(taskCard);
        } else if (task.status === 'in-progress') {
            inProgressList.appendChild(taskCard);
        } else if (task.status === 'done') {
            doneList.appendChild(taskCard);
        }
    });

    // Set up drag and drop functionality
    setupDragAndDrop();
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const task = {
        id: nextId++,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        dueDate: document.getElementById('taskDueDate').value,
        status: 'todo',
    };

    taskList.push(task);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', nextId);
    renderTaskList();
    document.getElementById('newTaskForm').reset();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    if (event.target.classList.contains('delete-btn')) {
        const taskId = parseInt(event.target.getAttribute('data-task-id'));
        taskList = taskList.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

// Function to set up drag and drop functionality
function setupDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const lanes = document.querySelectorAll('.lane');

    taskCards.forEach(card => {
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    lanes.forEach(lane => {
        lane.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(lane, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                lane.appendChild(draggable);
            } else {
                lane.insertBefore(draggable, afterElement);
            }
        });

        lane.addEventListener('drop', e => {
            e.preventDefault();
            const taskId = parseInt(document.querySelector('.dragging').getAttribute('data-task-id'));
            const newStatus = lane.id.replace('-cards', '');
            updateTaskStatus(taskId, newStatus);
        });
    });
}

// Helper function to determine where to insert dragged element
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Function to update task status after drag and drop
function updateTaskStatus(taskId, newStatus) {
    const task = taskList.find(task => task.id === taskId);
    if (task) {
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    renderTaskList();
    document.getElementById('newTaskForm').addEventListener('submit', handleAddTask);
    document.querySelectorAll('.lane').forEach(lane => {
        lane.addEventListener('click', handleDeleteTask);
    });
});