let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    taskCard.setAttribute('data-task-id', task.id);
    taskCard.draggable = true;

    const title = document.createElement('h3');
    title.textContent = task.title;
    taskCard.appendChild(title);

    const description = document.createElement('p');
    description.textContent = task.description;
    taskCard.appendChild(description);

    const dueDate = document.createElement('p');
    dueDate.textContent = `Due: ${task.dueDate}`;
    taskCard.appendChild(dueDate);

    if (task.status === 'todo') {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.setAttribute('data-task-id', task.id);
        taskCard.appendChild(deleteBtn);
    }

    // Color coding
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate);
    if (now.isSame(taskDueDate, 'day')) {
        taskCard.classList.add('due-soon');
    } else if (now.isAfter(taskDueDate)) {
        taskCard.classList.add('overdue');
    }

    return taskCard;
}

function renderTaskList() {
    const todoList = document.getElementById('todo-list');
    const inProgressList = document.getElementById('in-progress-list');
    const doneList = document.getElementById('done-list');

    todoList.innerHTML = '';
    inProgressList.innerHTML = '';
    doneList.innerHTML = '';

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

    setupDragAndDrop();
}

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

function handleDeleteTask(event) {
    if (event.target.classList.contains('delete-btn')) {
        const taskId = parseInt(event.target.getAttribute('data-task-id'));
        taskList = taskList.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

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
            const taskId = parseInt(document.querySelector('.dragging').getAttribute('data-task-id'));
            const newStatus = lane.id.replace('-cards', '');
            updateTaskStatus(taskId, newStatus);
        });
    });
}

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

function updateTaskStatus(taskId, newStatus) {
    const task = taskList.find(task => task.id === taskId);
    if (task) {
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(taskList));
        renderTaskList();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderTaskList();
    document.getElementById('newTaskForm').addEventListener('submit', handleAddTask);
    document.getElementById('todo-list').addEventListener('click', handleDeleteTask);
});