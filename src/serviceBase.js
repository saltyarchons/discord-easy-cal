class ServiceBase {
    constructor(bot) {
        this.bot = bot;
    }

    init() {
        this.bot.logger.info(`Initialising ${this.constructor.name}`);
    }

    start() {
        this.bot.logger.info(`Starting ${this.constructor.name}`);
    }
}

module.exports = ServiceBase;
