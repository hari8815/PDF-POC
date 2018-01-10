const chalk = require('chalk')

module.exports = class Queue {
    constructor(processor, batchSize) {
        this.currentProcess = 0;
        this.queue = [];
        this.processor = processor;
        this.batchSize = batchSize || 1;
    }
    
    addJob(job) {
        console.log(chalk.green('Adding Itme: ' + job.url))
        this.queue.push(job)
        this.execute()
    }

    executeNext() {
        console.log(chalk.blue('Execute next called.'))
        this.currentProcess --;
        this.execute();
    }
    
    execute() {
        if(this.currentProcess < this.batchSize) {
            console.log('current process is less than or equals batchSize', this.currentProcess, this.batchSize);
            if(this.queue.length) {
                console.log(chalk.red('Processing item'))
                this.processor(this.queue.shift(), this)
                this.currentProcess ++;
                console.log(chalk.blue('proccess count ' + this.currentProcess))
            }
        }
    }
}