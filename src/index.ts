import './pre-start'; // Must be the first import
import logger from 'jet-logger';
import server from './server';

const SERVER_START_MSG = 'Express server started on port: ' + 8080;

server.listen(8080, () => logger.info(SERVER_START_MSG));
