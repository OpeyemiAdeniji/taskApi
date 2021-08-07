const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const { generate } = require('../utils/random.util');

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

        todos: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Todo'
            }
        ],

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

UserSchema.pre('save', function (next) {
    this.slug = slugify('_user' + generate(6, true), {lower: true})
    next();
})

module.exports = mongoose.model('User', UserSchema);