import express, {Express} from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './routes/router';

import {notFoundHandler, serverErrorHandler,} from './middlewares/server-errors';
import swaggerUi from 'swagger-ui-express';
import {swaggerSpecs} from './conf/swagger.conf';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import {redisClient} from './conf/redis.conf';

dotenv.config();
const app: Express = express();
app.use(cors({credentials: true, origin: process.env.CLIENT_ADDRESS}));
app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'short'));
app.use(
    compression({
        level: 6,
        threshold: 100 * 1000,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        },
    }),
);
app.use('/api', router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use(notFoundHandler);
app.use(serverErrorHandler);
const server = app.listen(process.env.APPLICATION_PORT, () => {
    console.log(`Listening on ${process.env.APPLICATION_PORT}`);
});
redisClient
    .connect()
    .then(() => {
    })
    .catch((err) => {
        console.log(err);
    });
process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    console.log('Closing http server.');
    server.close(() => {
        console.log('Http server closed.');
        process.exit(0);
    });
});
