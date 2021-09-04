const mongoose = require('mongoose');
const slugify = require('slugify');

const ReminderSchema = new mongoose.Schema(
    {
        dueTime: {
            type: String,
            required: [true, 'dueTime is required']
        },

        dueDate: {
            type: String,
            required: [true, 'dueDate is required']
        },

        isDue: {
            type: Boolean,
            default: false
        },

        isEnabled: {
            type: Boolean,
            default: false
        },

        todo: {
            type: mongoose.Schema.ObjectId,
            ref: 'Todo'
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
    this.slug = slugify('reminder' + this.dueDate, { lower:  true })
    next();
})

module.exports = mongoose.model('Reminder', ReminderSchema);

