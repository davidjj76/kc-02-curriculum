$(document).ready(function() {

	var API_URL = 'http://localhost:8000/api/';
	var tasks = [];
	var newTaskNameInput = $('#newTaskName'); 
	var tasksLists = {
		true: $('#doneTasksList'),
		false: $('#todoTasksList')
	}

	var getTasksByState = function(completed) {
		return $.grep(tasks, function(task) {
			return task.completed == completed;
		});
	};

	var getTaskById = function(id) {
		return $.grep(tasks, function(task) {
			return task.id == id;
		})[0];
	};

	var removeTaskById = function(id) {
		return $.grep(tasks, function(task) {
			return task.id != id;
		});
	};

	var renderTask = function(task) {
		var taskListItem = '<li class="task-item" data-task-id="' + task.id + '">';
		taskListItem += '<input type="checkbox" id="deleteTask-' + task.id + '" class="complete-task" '
		taskListItem += (task.completed == 'true' ? 'checked' : '') + '/>';
		taskListItem += '<label for="deleteTask-' + task.id + '"';
		if (task.completed == 'true') {
			taskListItem += ' class="completed">';
			taskListItem += '<i class="fa fa-check fa-2x" aria-hidden="true"></i>';
		} else {
			taskListItem += '>';
		}
		taskListItem += '</label>';
		taskListItem += '<span>';
		taskListItem += task.name;
		taskListItem += '</span>';
		taskListItem += '<button class="delete-task">';
		taskListItem += '<i class="fa fa-trash fa-2x" aria-hidden="true"></i>';
		taskListItem += '</button>';
		taskListItem += '</li>';
		return taskListItem;
	};

	var drawNoTasks = function(tasksList) {
		var taskListItem = '<li class="task-item">';
		taskListItem += 'No tengo tareas pendientes';
		taskListItem += '</li>';
		tasksList.append(taskListItem);
	};

	var drawTasksList = function(completed) {
		var tasks = getTasksByState(completed);
		var tasksList = tasksLists[completed];
		var tasksListItems = '';
		tasksList.empty();
		if (tasks.length == 0) {
			drawNoTasks(tasksList);
		} else {
			for (var i = 0; i < tasks.length; i++) {
				tasksListItems += renderTask(tasks[i]);
			}
			tasksList.append(tasksListItems);
		}
	};

	var searchPreviousTaskItem = function(tasksList, taskId) {
		var previousTaskItem;
		tasksListItems = tasksList.children('li');
		for(var i = 0; i < tasksListItems.length; i++) {
			var itemTaskId = $(tasksListItems[i]).data('taskId');
			if (taskId > itemTaskId) {
				previousTaskItem = $(tasksListItems[i]);
			} 
		}
		return previousTaskItem;
	};

	var insertTask = function(tasksList, task) {
		var previousTaskItem = searchPreviousTaskItem(tasksList, task.id); 
		if (previousTaskItem) {
			previousTaskItem.after(renderTask(task));
		} else {
			tasksList.prepend(renderTask(task));
		}
	};

	var drawTaskItem = function(newTask) {
		var tasksList = tasksLists[newTask.completed];
		if (getTasksByState(newTask.completed).length == 1) {
			tasksList.empty();
		}
		insertTask(tasksList, newTask);
	};

	var removeTaskItem = function(deletedTask, previousCompleted) {
		var taskItem = $('li.task-item[data-task-id=' + deletedTask.id + ']');
		if (taskItem) {
			taskItem.remove();
			var taskCompleted = previousCompleted || deletedTask.completed;
			if (getTasksByState(taskCompleted).length == 0) {
				drawNoTasks(tasksLists[taskCompleted]);
			}
		}
	};

	var getTasks = function() {
		$.ajax({
			type: 'GET',
			url: API_URL + 'tasks'
		})
		.done(function(data, textStatus, jqXHR) {
			tasks = data;
			drawTasksList('true');
			drawTasksList('false');
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
		});
	};

	var createTask = function(name) {
		$.ajax({
			type: 'POST',
			url: API_URL + 'tasks',
			data: { name: name, completed: false }
		})
		.done(function(data, textStatus, jqXHR) {
			newTaskNameInput.val('');			
			tasks.push(data);
			drawTaskItem(data);
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
		});
	};

	var updateTask = function(id, name, completed) {
		$.ajax({
			type: 'PUT',
			url: API_URL + 'tasks/' + id,
			data: { name: name, completed: completed }
		})
		.done(function(data, textStatus, jqXHR) {
			var storedTask = getTaskById(id);
			var storedCompleted = storedTask.completed;
			tasks[tasks.indexOf(storedTask)] = data;
			if (storedCompleted != data.completed) {
				removeTaskItem(data, storedCompleted);
				drawTaskItem(data);
			} else {
				// TODO: Modificaciones del texto de la tarea
			}
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
		});
	};

	var deleteTask = function(id) {
		$.ajax({
			type: 'DELETE',
			url: API_URL + 'tasks/' + id
		})
		.done(function(data, textStatus, jqXHR) {
			var deletedTask = getTaskById(id); 
			tasks = removeTaskById(id);
			removeTaskItem(deletedTask);
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
		});
	};

	$('#createTask').click(function(event) {
		event.preventDefault();
		if (newTaskNameInput.val() != '') {
			createTask(newTaskNameInput.val());
		}
	});

	$(document).on('click', 'button.delete-task', function(event) {
		var taskId = $(this).parent('li.task-item').data('taskId');
		deleteTask(taskId);
	});

	$(document).on('change', 'input.complete-task', function(event) {
		var taskId = $(this).parent('li.task-item').data('taskId');
		var task = getTaskById(taskId);
		updateTask(taskId, task.name, $(this).prop('checked'));
	});

	getTasks();

});
