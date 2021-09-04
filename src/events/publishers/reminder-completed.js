const { Publisher, Subjects } = require('@nijisog/todo_common');

class ReminderCompletedPublisher extends Publisher{

    subject = Subjects.ReminderCompleted;

    constructor(client){
        super(client)
    }
}

module.exports = ReminderCompletedPublisher;
