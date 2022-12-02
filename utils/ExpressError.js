class ExpressError extends Error {
    constructor(message, statusCode) {
        //調用super它將調用error構造函數
        super();
        this.message = message;
        this.statusCode = statusCode;

    }
}

module.exports = ExpressError;