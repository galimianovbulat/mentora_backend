import 'dotenv/config';

import express from 'express';

import config from './config';
import { AppDataSource } from './data-source';

const app = express();

void (async function() {
    await AppDataSource.initialize();
    console.log('DB is here!');

    app.listen(config.PORT, () => {
        console.log(`Server started on ${String(config.PORT)}`);
    });
})();
