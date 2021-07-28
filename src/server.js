const app = require('./config/app');
const colors = require('colors');
const connectDB = require('./config/db');
// const { seedData } = require('./config/seeds/seeder.seed')


const connect = async() => {
    // connect to DB
     await connectDB();

    //   await seedData();
}

    connect();

// define port
const PORT = process.env.PORT || 5000;

// create server
const server = app.listen(
    PORT,
    console.log(`Todo service running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold) 
)

// handle unhandle romise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`err: ${err.message}`.red.bold);
    server.close(() => process.exit(1));
})