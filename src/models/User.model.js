const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: [true, 'Email already exist'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'a valid email is required',
            ],
        },

        userId: {
            type: mongoose.Schema.ObjectId
        },

        slug: String
    },

    {

        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id;
            }
        }

    }
);

UserSchema.set('toJSON', {getters: true, virtuals: true});

// these are the codes to encode with JWT below
UserSchema.pre('save', async function(next){ // save means is either you're creating a new record or updating an existing data

    if(!this.isModified('password')){
        return next(); // proceed to the next request
    }
    
    const salt = await bcrypt.genSalt(10); // this is used to generate 10 random numbers. this numbers will be added to the password the user entered and bcrypt will hash both together
    this.password = await bcrypt.hash(this.password, salt); // bcrypt and crypto is used to hash password
})

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, email: this.email, roles: this.roles}, // encode the id of the user which we are accesssing in our auth middleware(pass in the payload i.e everything you want to encode and pass in the secret and expire)
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE }
    )
}

UserSchema.methods.matchPassword = async function (pass) { //compares password by hashing   
    return await bcrypt.compare(pass, this.password)
}

// // increasing login limit
UserSchema.methods.increaseLoginLimit = function (code) {
    const limit = this.loginLimit + 1
    return limit;
}

// check locked status
UserSchema.methods.checkLockedStatus = function () {
    return this.isLocked;
}

// generate reset password token
UserSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString('hex') // hex will make it an hexadecimal string

    // hash the token generated
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex') // sha256 is an embedded algorithm in d crypto library

    // set the expiry time/date
    this.resetPasswordTokenExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    return resetToken;
}

UserSchema.methods.getActivationToken = function () {
    const activateToken = crypto.randomBytes(20).toString('hex')

    // hash the token generated
    this.activationToken = crypto.createHash('sha256').update(activateToken).digest('hex')

    // set the expiry time/date
    this.activationTokenExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

    return activateToken;
}

// Find out if user has a role
UserSchema.methods.hasRole = (role, roles) => {
    let flag = false;
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].toString() === role.toString()) {
        flag = true;
        break;
      }
    }
  
    return flag;
  };

UserSchema.methods.findByEmail= async (email) => {
    return await this.findOne({ email: email });
};

UserSchema.methods.getFullName = async() => {
    return this.firstName + ' ' + this.lastName
};

module.exports = mongoose.model('User', UserSchema);