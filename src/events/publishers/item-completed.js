const { Publisher, Subjects } = require('@nijisog/todo_common');

class ItemCompletedPublisher extends Publisher{

    subject = Subjects.ItemCompleted;

    constructor(client){
        super(client)
    }
}

module.exports = ItemCompletedPublisher;;
