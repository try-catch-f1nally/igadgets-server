import * as http from 'http';
import express from 'express';
import Config from './utils/@types/interfaces/config.interface';
import Logger from './utils/@types/interfaces/logger.interface';
import Database from './utils/@types/interfaces/database.interface';
// TODO: add compression, helmet modules

export default class Application {
  private _express: express.Application = express();
  private _server: http.Server | null = null;
  private _config: Config;
  private _logger: Logger;
  private _database: Database;
  private _middlewares: Array<express.RequestHandler>;
  private _routers: Array<express.Router>;
  private _defaultHandler: express.RequestHandler;
  private _errorHandler: express.ErrorRequestHandler;

  constructor(
    config: Config,
    logger: Logger,
    database: Database,
    middlewares: Array<express.RequestHandler>,
    routers: Array<express.Router>,
    defaultHandler: express.RequestHandler,
    errorHandler: express.ErrorRequestHandler
  ) {
    this._config = config;
    this._logger = logger;
    this._database = database;
    this._middlewares = middlewares;
    this._routers = routers;
    this._defaultHandler = defaultHandler;
    this._errorHandler = errorHandler;

    this._registerShutdownHooks();
    this._registerHandlers();
  }

  async start() {
    this._logger.info('Starting application...');
    await this._database.connect();
    this._startListening();
  }

  async stop() {
    this._logger.info('Stopping application...');
    await this._database.close();
    this._logger.info('Application successfully stopped');
  }

  private _registerHandlers() {
    this._express.use(...this._middlewares);
    this._express.use(this._config.baseUrl, ...this._routers);
    this._express.use(this._errorHandler);
    this._express.use('*', this._defaultHandler);
  }

  private _registerShutdownHooks() {
    const gracefulShutdown = async () => {
      this._logger.info('Stopping server from accepting new connections...');
      this._server?.close();
      await new Promise((resolve) => setTimeout(resolve, this._config.shutdownTimeoutInSeconds * 1000));
      this._server?.closeAllConnections();
      await this.stop();
      process.exit();
    };
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  }

  private _startListening() {
    const port = Number(process.env.PORT) || this._config.port;
    const cb = () => this._logger.info(`Application started listening on port ${port}`);
    this._server = this._express.listen(port, cb);
  }
}
