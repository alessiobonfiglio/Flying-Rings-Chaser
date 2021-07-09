class Event {
    #eventHandlers = [];

    subscribe(handler) {
        this.#eventHandlers.push(handler);
    }

    invoke(sender) {
        for (const handler of this.#eventHandlers)
            handler(sender);
    }
}

export default Event;
