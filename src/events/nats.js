const nats = require('node-nats-streaming');
const colors = require('colors');

class NatsWrapper {

    #_client;

    get client(){
        if(!this.#_client){
            throw new Error('Cannot access nats client before connecting');
        }

        return this.#_client;
    }

    async connect(clusterId, clientId, url){

        this.#_client = await nats.connect(clusterId, clientId, { url });

        return new Promise((resolve, reject) => {

            this.#_client.on('connect', () => {
                console.log('Connected to NATS'.yellow.inverse);
                resolve();
            });

            this.#_client.on('error', (err) => {
                console.log(err)
                reject(err);
            })
        })
    }
}

module.exports = new NatsWrapper();