const { Publisher, Subjects } = require('@nijisog/todo_common');

class ItemNudgedPublisher extends Publisher{

    subject = Subjects.ItemNudged;

    constructor(client){
        super(client)
    }
}

module.exports = ItemNudgedPublisher;;
