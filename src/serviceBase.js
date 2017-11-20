class ServiceBase {
    constructor(app) {
        this.app = app;
        this.logger = app.logger;
        this.config = app.config;
        this.auth = app.auth;
    }
}

module.exports = ServiceBase;
