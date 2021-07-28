const nodeCron = require('node-cron');

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

class Worker {

    #cron; // save cron object here
    #task; // save current task here

    constructor(cron){
        
        if(!cron){
            throw new Error('cron expression is required')
        }

        this.#cron = cron;
    }

    get cron(){
        return this.#cron;
    }

    get task(){
        return this.#task;
    }

    schedule = async (cb) => {

        this.#task = await nodeCron.schedule(this.#cron, cb);
        this.#task.start();
    }

    stop = async () => {
        if(this.#task){
           await this.#task.stop();
        }
    }

    destroy = async () => {
        if(this.#task){
            await this.#task.destroy();
        }
    }
}

module.exports = Worker;