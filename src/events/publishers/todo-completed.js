const { Publisher, Subjects } = require('@nijisog/todo_common');

class TodoCompletedPublisher extends Publisher{

    subject = Subjects.TodoCompleted;

    constructor(client){
        super(client)
    }
}

module.exports = TodoCompletedPublisher;
