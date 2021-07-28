const mongoose = require('mongoose')
const colors = require('colors')
const { config } = require('dotenv')

// load env variables
config();

// load models
const Friend = require('./src/models/Friend.model');
const Item = require('./src/models/Item.model');
const Reminder = require('./src/models/Reminder.model');
const Todo = require('./src/models/Todo.model');
const User = require('./src/models/User.model');

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
    keepAlive: true,        
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useFindAndModify: false,
    useUnifiedTopology: true,
}

// connect to DB
const connectDB = async() => {
    if (process.env.NODE_ENV === 'test') {
        mongoose.connect(process.env.MONGODB_TEST_URI, options)
    }
    
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production' ) {
        mongoose.connect(process.env.MONGODB_URI, options)
    }
    
}

const deleteData = async() => {
    try {
        await connectDB()
        await Friend.deleteMany();
        await Item.deleteMany();
        await Reminder.deleteMany();
        await Todo.deleteMany();
        await User.deleteMany();

        console.log('data destroyed successfully...'.red.inverse);
        process.exit();

    } catch (err) {
        console.log(err)
    }
}

if (process.argv[2] === '-d') {
    deleteData();
}