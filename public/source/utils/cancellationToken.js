class CancellationToken {
    #isAborted = false;
    get isAborted() {
        return this.#isAborted;
    }         

    abort() {
        this.#isAborted = true;
    }

}

export default CancellationToken;