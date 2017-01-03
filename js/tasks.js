$(document).ready(function() {

	var API_URL = 'http://localhost:8000/api/';
	var tasks = [];
	var newTaskNameInput = $('#newTaskName'); 
	var tasksContainers = {
		true: $('#doneTasksContainer'),
		false: $('#todoTasksContainer')
	}

	var getTasksByState = function(completed) {
		return $.grep(tasks, function(task) {
			return task.completed == completed;
		});
	}

	var getTaskById = function(id) {
		return $.grep(tasks, function(task) {
			return task.id == id;
		})[0];
	}

	var renderTask = function(task) {
		var taskListItem = '<li class="task-item" data-task-id="' + task.id + '">';
		taskListItem += task.name;
		taskListItem += '<input type="checkbox" class="completeTask" '
		taskListItem += (task.completed == 'true' ? 'checked' : '') + '/>';
		taskListItem += '<button class="deleteTask">Eliminar</button>';
		taskListItem += '</li>';
		return taskListItem;
	};

	var drawNoTasks = function(tasksContainer) {
		tasksContainer.append('<li>No tengo tareas pendientes</li>');
	}

	var drawTasksList = function(completed) {
		var tasks = getTasksByState(completed);
		var tasksContainer = tasksContainers[completed];
		var tasksList = '';
		tasksContainer.empty();
		if (tasks.length == 0) {
			drawNoTasks(tasksContainer);
		} else {
			for (var i = 0; i < tasks.length; i++) {
				tasksList += renderTask(tasks[i]);
			}
			tasksContainer.append(tasksList);
		}
	};

	var searchPreviousTaskItem = function(tasksContainer, taskId) {
		var previousTaskItem;
		tasksListItems = tasksContainer.children('li');
		for(var i = 0; i < tasksListItems.length; i++) {
			var itemTaskId = $(tasksListItems[i]).data('taskId');
			if (taskId > itemTaskId) {
				previousTaskItem = $(tasksListItems[i]);
			} 
		}
		return previousTaskItem;
	};

	var insertTask = function(tasksContainer, task) {
		var previousTaskItem = searchPreviousTaskItem(tasksContainer, task.id); 
		if (previousTaskItem) {
			previousTaskItem.after(renderTask(task));
		} else {
			tasksContainer.prepend(renderTask(task));
		}
	};

	var drawTaskItem = function(newTask) {
		var tasksContainer = tasksContainers[newTask.completed];
		if (getTasksByState(newTask.completed).length == 1) {
			tasksContainer.empty();
		}
		insertTask(tasksContainer, newTask);
	};

	var removeTaskItem = function(deletedTask, previousCompleted) {
		var taskItem = $('li.task-item[data-task-id=' + deletedTask.id + ']');
		if (taskItem) {
			taskItem.slideUp(500, function() {
				$(this).remove();
			});
			var taskCompleted = previousCompleted || deletedTask.completed;
			if (getTasksByState(taskCompleted).length == 0) {
				drawNoTasks(tasksContainers[taskCompleted]);
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
				// TODO: Modificaciones del texto
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
			tasks = $.grep(tasks, function(task) {
				return task.id != id;
			});
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

	$(document).on('click', 'button.deleteTask', function(event) {
		var taskId = $(this).parent('li.task-item').data('taskId');
		deleteTask(taskId);
	});

	$(document).on('change', 'input.completeTask', function(event) {
		var taskId = $(this).parent('li.task-item').data('taskId');
		var task = getTaskById(taskId);
		updateTask(taskId, task.name, $(this).prop('checked'));
	});

	getTasks();

});
