import battleshipBot from './src/bot_client/index';
import { staticServer } from './src/http_server/index';
import './src/ws_server/index';

const HTTP_PORT = 8181;

console.log(`Start static http server on the http://localhost:${HTTP_PORT}`);
staticServer.listen(HTTP_PORT);

setTimeout(() => battleshipBot(), 1000);
