const { Publisher, Subjects } = require('@nijisog/todo_common');

class ReminderSendPublisher extends Publisher{

    subject = Subjects.ReminderSend;

    constructor(client){
        super(client)
    }
}

module.exports = ReminderSendPublisher;
