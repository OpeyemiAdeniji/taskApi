const User = require('../models/User.model');
const moment = require('moment');

const unlockAccount = async (user) => {

    console.log('started running user-job to unlock user account every 24 hours')
    const _user = await User.findById(user._id);

    if(_user.isLocked){

        console.log('user account is already locked. trying to determine when to unlock it.')

        // const then = moment(user.lockedTime).toDate();
        // const now = moment().toDate(); 

        // const diff = now.getMinutes() - then.getMinutes();

        // console.log(diff, 'locked difference');

        // if(diff >= 1){


        // }else{
            
            _user.isLocked = false;
            _user.loginLimit = 0;
            await _user.save();

            console.log('user-job: user account unlocked');
        

    }else{
        console.log('user account is not locked yet')
    }
}

module.exports = { unlockAccount };