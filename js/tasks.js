$(document).ready(function() {

	var API_URL = 'http://localhost:8000/api/';
	var tasks = [];
	var newTaskNameInput = $('#newTaskName'); 
	var tasksContainer = $('#tasksContainer');

	var renderTask = function(task) {
		var taskListItem = '<li class="task-item" data-task-id="' + task.id + '">';
		taskListItem += task.name;
		taskListItem += '<input type="checkbox" class="completeTask" '
		taskListItem += (task.completed == 'true' ? 'checked' : '') + '/>';
		taskListItem += '<button class="deleteTask">Eliminar</button>';
		taskListItem += '</li>';
		return taskListItem;
	};

	var drawNoTasks = function() {
		tasksContainer.append('<li>No tengo tareas pendientes</li>');
	}

	var drawTasksList = function() {
		var tasksList = '';
		tasksContainer.empty();
		if (tasks.length == 0) {
			drawNoTasks();
		} else {
			for (var i = 0; i < tasks.length; i++) {
				tasksList += renderTask(tasks[i]);
			}
			tasksContainer.append(tasksList);
		}
	};

	var drawTaskItem = function(newTask) {
		if (tasks.length == 1) {
			tasksContainer.empty();
		}
		tasksContainer.append(renderTask(newTask));
	};

	var removeTaskItem = function(taskId) {
		var taskItem = $('li.task-item[data-task-id=' + taskId + ']');
		if (taskItem) {
			taskItem.slideUp(500, function() {
				$(this).remove();
			});
			if (tasks.length == 0) {
				drawNoTasks();
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
			drawTasksList();
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
			console.log('always:');
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
			console.log('always:');
		});
	};

	var updateTask = function(id, name, completed) {
		$.ajax({
			type: 'PUT',
			url: API_URL + 'tasks/' + id,
			data: { name: name, completed: completed }
		})
		.done(function(data, textStatus, jqXHR) {
			console.log('done:', data, textStatus, jqXHR);
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
			console.log('always:');
		});
	};

	var deleteTask = function(id) {
		$.ajax({
			type: 'DELETE',
			url: API_URL + 'tasks/' + id
		})
		.done(function(data, textStatus, jqXHR) {
			tasks = $.grep(tasks, function(task) {
				return task.id != id;
			});
			removeTaskItem(id);
		})
		.fail(function(jqXHR, textStatus, error) {
			console.log('fail:', jqXHR, textStatus, error);
		})
		.always(function() {
			console.log('always:');
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
		var task = $.grep(tasks, function(task) {
			return task.id == taskId;
		})[0];
		updateTask(taskId, task.name, $(this).prop('checked'));
	});

	getTasks();

});
