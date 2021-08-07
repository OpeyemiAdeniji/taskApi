const mongoose = require('mongoose');
const slugify = require('slugify')

const ItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            maxLength: 255,
            required: [true, 'item title is required']
        },

        status: {
            type: String,
            enum: ['done', 'pending'],
            default: 'pending'
        },

        dueDate: {
            type: Date
        },

        description: {
            type: String,
        },

        slug: String,

        reminder: {
            type: mongoose.Schema.ObjectId,
            ref: 'Reminder'
        },

        todo: {
            type: mongoose.Schema.ObjectId,
            ref: 'Todo'
        },

        friends: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Friend'
            }
        ]

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
)

ItemSchema.set('toJSON', { getters: true, virtual: true })

ItemSchema.pre('save', function (next){
    this.slug = slugify('item' + this.title, {lower: true})
    next();
})

ItemSchema.methods.findByTitle = function (title){
    return this.findOne({ title: title });
}

module.exports = mongoose.model('Item', ItemSchema);