const mongoose = require('mongoose');
const slugify = require('slugify');

const ReminderSchema = new mongoose.Schema(
    {
        dueTime: {
            type: String,
        },

        dueDate: {
            type: String
        },

        status: {
            type: String,
            enum : ['completed', 'pending']
        },

        item: {
            type: mongoose.Schema.ObjectId,
            ref: 'Item'
        },

        slug: String

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

ReminderSchema.set('toJSON', { getters: true, virtuals: true })

ReminderSchema.pre('save', function(next) {
    this.slug = slugify('reminder' + this.status, { lower:  true })
    next();
})

module.exports = mongoose.model('Reminder', ReminderSchema);

