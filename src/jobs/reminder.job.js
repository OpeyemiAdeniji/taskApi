const User = require('../models/User.model');
const Reminder = require('../models/Reminder.model');
const Item = require('../models/Item.model');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { sendGrid } = require('../utils/email.util');

const nats = require('../events/nats');
const ReminderSend = require('../events/publishers/reminder-send');
const ReminderCompleted = require('../events/publishers/reminder-completed');

const remindItem = async (remId, userId, itemId) => {

    console.log('started running reminder.job to send email when item reminder is due');

    const _rem = await Reminder.findById(remId);
    const user = await User.findById(userId);
    const item = await Item.findById(itemId);

    if(_rem && _rem.isEnabled && user){

        let emailData = {
            template: 'welcome',
            email: user.email,
            preheaderText: 'check reminder',
            emailTitle: `Reminder - ${item.title}`,
            emailSalute: 'Hi Champ',
            bodyOne: `your todo item ${item.title} is due by ${item.dueDate} ${item.dueTime}`,
            fromName: 'Todo'
        }

        await sendGrid(emailData);

        const rem = await Reminder.findById(_rem._id).populate([ { path: 'item' } ]);

        await new ReminderSend(nats.client).publish(rem);

        console.log(`sent reminder to ${user.email} on item: ${item.title}`);

    }else{
        console.log('cannot send reminder');
    }
}

const completeRem = async (remId, userId, itemId) => {

    console.log('started running reminder.job to complete reminder');

    const _rem = await Reminder.findById(remId);
    const user = await User.findById(userId);
    const item = await Item.findById(itemId);

    if(_rem && _rem.isEnabled){

        _rem.isDue = true;
        _rem.isEnabled = false;
        await _rem.save();

        let emailData = {
            template: 'welcome',
            email: user.email,
            preheaderText: 'check reminder',
            emailTitle: `Reminder - ${item.title}`,
            emailSalute: 'Hi Champ',
            bodyOne: `your todo item ${item.title} is due by ${item.dueDate} ${item.dueTime}`,
            fromName: 'Todo'
        }
            await sendGrid(emailData);

            const rem = await Reminder.findById(_rem._id).populate([ { path: 'item' } ]);

            await new ReminderCompleted(nats.client).publish(rem);

            console.log(`sent reminder to ${user.email} on item: ${item.title}`);

    }else(
        console.log('cannot send reminder')
    )
}
 
module.exports = { remindItem, completeRem }