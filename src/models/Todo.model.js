const mongoose = require('mongoose');
const slugify = require('slugify')

const TodoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'todo title is required']
        },

        status: {
            type: String,
            enum: ['done', 'pending'],
            default: 'pending'
        },

        dueDate: {
            type: Date
        },

        dueTime: {
            type: String
        },

        slug: String,

        items: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Item'
            }
        ],

        user:
                {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User'
                }
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

TodoSchema.set('toJSON', { getters: true, virtual: true })

TodoSchema.pre('save', function (next){
    this.slug = slugify('todo' + this.dueTime, {lower: true})
    next();
})

TodoSchema.methods.findByTitle = function (title){
    return this.findOne({ title: title });
}

module.exports = mongoose.model('Todo', TodoSchema);