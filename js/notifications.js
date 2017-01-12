function sendNotification(data) {

    notificationData = formatNotification(data);
    var notification = Notification || mozNotification || webkitNotification;

    if (typeof(notification) === 'undefined') {
        alert(notificationData.message + '\n' + notificationData.options.body);
    } else {
        notification.requestPermission(function(permission) {
            if (permission === 'granted') {
                var notification = new Notification(notificationData.message, notificationData.options);
            }
        });
    } 
}

function formatNotification(data) {
    return {
        message: 'Hola, ' + data.name,
        options: {
            body: 'He recibido tu mensaje y en breve te contestaré a ' + data.email
        }
    }
}
