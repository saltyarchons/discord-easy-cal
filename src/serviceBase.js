class ServiceBase {
    constructor(app) {
        this.app = app;
        this.logger = app.logger;
        this.config = app.config;
        this.auth = app.auth;
    }

    init() {
        this.logger.info(`Initialising ${this.constructor.name}`);
    }

    start() {
        this.logger.info(`Starting ${this.constructor.name}`);
    }
}

module.exports = ServiceBase;
