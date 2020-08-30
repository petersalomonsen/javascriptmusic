export class WorkerMessageHandler {

    constructor(messagePort) {
        this.workerMessageListeners = [];
        this.messagePort = messagePort;
        messagePort.onmessage = (msg) => {
            this.workerMessageListeners = this.workerMessageListeners.filter(listener =>
                    listener(msg) === true);
        }
        messagePort.onmessageerror = (err) => {
            console.error(err);
        };
    }

    async callAndGetResult(message, responseFilter) {
        const result = await new Promise((resolve) => {
            this.workerMessageListeners.push((msg) =>
                responseFilter(msg.data) ? resolve(msg.data) : true);
            this.messagePort.postMessage(message);
        });
        return result;
    }
}
