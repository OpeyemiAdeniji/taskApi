const User = require('../models/User.model');
const Item = require('../models/Item.model');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const nats = require('../events/nats');
const ItemNudged = require('../events/publishers/item-nudged');
const ItemAbandoned = require('../events/publishers/item-abandoned')

const { sendGrid } = require('../utils/email.util');

const nudgeItem = async (itemId, userId) => {
    console.log('started running item.job to nudge user on completing item');

    const item = await Item.findById(itemId);
    const user = await User.findById(userId);

    if(item && item.status === 'pending'){

        let emailData = {
            template: 'welcome',
            email: user.email,
            preheaderText: 'complete item',
            emailTitle: `Complete your item - ${item.title}`,
            emailSalute: 'Hi Champ',
            bodyOne: `your todo item ${item.title} is due by ${item.dueDate}  ${item.dueTime}. Please mark it completed as soon as it is due`,
            bodyTwo: `This item will be marked abandoned five minutes after the due date and time if it is not marked completed when it is due`,
            fromName: 'Todo'
        }

        await sendGrid(emailData);

        const _item = await Item.findById(item._id).populate([ { path: 'todo' } ])

        await new ItemNudged(nats.client).publish(_item);

    }else{
        console.log('could not send email to nudge user')
    }
    
}

const abandonItem = async (itemId) => {
    console.log('started running item.job to mark item abandoned');

    const item = await Item.findById(itemId);

    if(item && item.status === 'pending'){
        item.status = 'abandoned';
        item.isDue = true;
        await item.save();

        const _item = await Item.findById(item._id).populate([ { path: 'todo' } ])

        await new ItemAbandoned(nats.client).publish(_item);
    }
       
           
}

module.exports = { nudgeItem, abandonItem }