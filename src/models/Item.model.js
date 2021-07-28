const mongoose = require('mongoose');
const slugify = require('slugify')

const ItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'todo title is required']
        },

        status: {
            type: String,
            enum: ['complete', 'pending']
        },

        dueTime: {
            type: String
        },

        description: {
            type: String,
            required: [true, 'todo description is required']
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
                ref: 'Friends'
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
    this.slug = slugify('item' + this.dueTime, {lower: true})
    next();
})

ItemSchema.methods.findByTitle = function (title){
    return this.findOne({ title: title });
}

module.exports = mongoose.model('Item', ItemSchema);