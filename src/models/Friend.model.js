const mongoose = require('mongoose');
const slugify = require('slugify');

const FriendSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'name is required']
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: [true, 'Email already exist'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'a valid email is required',
            ],
        },

        password: {
            type: String,
            required: [true, 'password is required'],
            minLength: 8,
            select: false,
            match: [
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
                'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
            ]
        },

        user: {
            type: mongoose.Schema.ObjectId
        },

        reminder: {
            type: mongoose.Schema.ObjectId,
            ref: 'Reminder'
        },

        item: {
            type: mongoose.Schema.ObjectId,
            ref: 'Item'
        },

    },
    {
        timestamps: true,
        versionKey: '_version',
        toJSON: {
            transform(doc, ret){
                ret.id = ret._id
            }
        }
    }
)

FriendSchema.set('toJSON', { getters: true, virtuals: true })

FriendSchema.pre('save', function (next){
    this.slug = slugify(this.name, {lower: true})

    next();
})

FriendSchema.methods.findByName = function (email){
    return this.findOne({ email: email })
}

module.exports = mongoose.model('Friend', FriendSchema); 