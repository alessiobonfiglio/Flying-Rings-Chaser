class Event {
    #eventHandlers = [];

    subscribe(handler) {
        this.#eventHandlers.push(handler);
    }

    invoke(sender, arg) {
        for (const handler of this.#eventHandlers)
            if(arg !== "undefined")
                handler(sender, arg);
            else 
                handler(sender);
    }
}

export default Event;
