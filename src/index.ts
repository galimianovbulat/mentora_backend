import 'dotenv/config';

import { app } from './app';
import config from './config';
import { AppDataSource } from './data-source';

void (async function () {
    await AppDataSource.initialize();

    console.log('DB is here!');

    app.listen(config.PORT, () => {
        console.log(`Server started on ${String(config.PORT)}`);
    });
})();
