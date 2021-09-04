const { Publisher, Subjects } = require('@nijisog/todo_common');

class ItemAbandonedPublisher extends Publisher{

    subject = Subjects.ItemAbandoned;

    constructor(client){
        super(client)
    }
}

module.exports = ItemAbandonedPublisher;
