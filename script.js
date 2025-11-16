const taskForm = document.getElementById('new-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskDueDateInput = document.getElementById('task-due');
const taskPriorityInput = document.getElementById('task-priority');
const submitBtn = document.getElementById('submit-btn');
const formTitle = document.getElementById('form-title');

const taskListContainer = document.getElementById('task-list-container');
const searchBar = document.getElementById('search-bar');
const filterPriority = document.getElementById('filter-priority');


let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let isEditMode = false;
let currentEditTaskId = null;


taskForm.addEventListener('submit', handleFormSubmit);
taskListContainer.addEventListener('click', handleTaskListClick);
taskListContainer.addEventListener('change', handleTaskStatusChange);
searchBar.addEventListener('input', renderTasks);
filterPriority.addEventListener('change', renderTasks);



function handleFormSubmit(e) {
    e.preventDefault();

    const title = taskTitleInput.value;
    const description = taskDescInput.value;
    const dueDate = taskDueDateInput.value;
    const priority = taskPriorityInput.value;

    if (title.trim() === '') {
        alert('Please enter a task title.');
        return;
    }

    if (isEditMode) {
        
        tasks = tasks.map(task => 
            task.id === currentEditTaskId 
                ? { ...task, title, description, dueDate, priority } 
                : task
        );
        alert('Task updated successfully!');
    } else {
        
        const newTask = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            status: 'To Do'
        };
        tasks.push(newTask);
    }

    resetForm();
    saveTasks();
    renderTasks();
}


function renderTasks() {
    
    const searchTerm = searchBar.value.toLowerCase();
    const priorityFilter = filterPriority.value;

    
    let filteredTasks = tasks.filter(task => {
        
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        
        
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesPriority;
    });

    
    taskListContainer.innerHTML = '';

    
    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = '<p class="text-center text-muted">No tasks found. Try adding one!</p>';
        return;
    }

    
    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `card task-card shadow-sm ${task.status === 'Completed' ? 'task-completed' : ''}`;
        taskCard.setAttribute('data-task-id', task.id);
        taskCard.setAttribute('data-priority', task.priority);

        taskCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    
                    <div>
                        <h5 class="card-title">${task.title}</h5>
                        <p class="card-text mb-1">${task.description || ''}</p>
                        <small class="text-muted">Due: ${task.dueDate || 'N/A'}</small>
                    </div>
                    
                    
                    <div class="text-end" style="min-width: 120px;">
                        <span class="badge ${getPriorityClass(task.priority)} mb-2">${task.priority}</span>
                        <select class="form-select form-select-sm status-select" data-task-id="${task.id}">
                            <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                </div>

                
                <div class="mt-3 text-end task-actions">
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-task-id="${task.id}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-task-id="${task.id}">Delete</button>
                </div>
            </div>
        `;
        taskListContainer.appendChild(taskCard);
    });
}


function handleTaskListClick(e) {
    const clickedElement = e.target;
    
    
    if (clickedElement.classList.contains('delete-btn')) {
        const taskId = Number(clickedElement.dataset.taskId);
        deleteTask(taskId);
    }

    
    if (clickedElement.classList.contains('edit-btn')) {
        const taskId = Number(clickedElement.dataset.taskId);
        startEditTask(taskId);
    }
}


function handleTaskStatusChange(e) {
    const changedElement = e.target;

    
    if (changedElement.classList.contains('status-select')) {
        const taskId = Number(changedElement.dataset.taskId);
        const newStatus = changedElement.value;
        updateTaskStatus(taskId, newStatus);
    }
}


function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}


function startEditTask(taskId) {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (!taskToEdit) return;

    
    isEditMode = true;
    currentEditTaskId = taskId;

    
    taskTitleInput.value = taskToEdit.title;
    taskDescInput.value = taskToEdit.description;
    taskDueDateInput.value = taskToEdit.dueDate;
    taskPriorityInput.value = taskToEdit.priority;

    
    formTitle.innerText = 'Edit Task';
    submitBtn.innerText = 'Save Changes';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('btn-success');
    window.scrollTo(0, 0); 
}


function updateTaskStatus(taskId, newStatus) {
    tasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
    );
    saveTasks();
    renderTasks(); 
}


function resetForm() {
    isEditMode = false;
    currentEditTaskId = null;
    taskForm.reset();
    formTitle.innerText = 'Add New Task';
    submitBtn.innerText = 'Add Task';
    submitBtn.classList.add('btn-primary');
    submitBtn.classList.remove('btn-success');
}


function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function getPriorityClass(priority) {
    if (priority === 'High') return 'bg-danger';
    if (priority === 'Medium') return 'bg-warning';
    return 'bg-info'; 
}


renderTasks();