const { Listener, Subjects } = require('@nijisog/todo_common');
const QueueGroupName = require('../groupName');


const User = require('../../models/User.model');

class UserCreatedListener extends Listener {

    subject = Subjects.UserCreated;
    queueGroupName = QueueGroupName.Auth;

    constructor(client){
        super(client)
    }

    async onMessage(data, msg){

        const { _id, email } = data

        const u = await User.findOne({ email: email})

        if(!u){

            const user = await User.create({
                _id: _id,
                email: email,   
                userId: _id
            });
        }

         msg.ack();

    }

}

module.exports = UserCreatedListener;