import { Client } from 'pg';
import { createClient } from 'redis';  
import { DbMessage } from './types';

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'exchange_db',
    password: '#Oneplus7',
    port: 5434,
});
pgClient.connect();

async function main() {
    const redisClient = createClient({
        url: 'redis://localhost:6379'
    });
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (!response) {

        }  else {
            const data: DbMessage = JSON.parse(response);
            if (data.type === "TRADE_ADDED") {
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO tata_prices (time, price) VALUES ($1, $2)';
                // TODO: How to add volume?
                const values = [timestamp, price];
                try {
                    // Log the exact data we're trying to insert
                    console.log('Attempting to insert with values:', {
                        timestamp: timestamp.toISOString(),
                        price: price,
                        timestampType: typeof timestamp,
                        priceType: typeof price
                    });

                    const result = await pgClient.query(query, values);
                    console.log('Insert query result:', {
                        rowCount: result.rowCount,
                        command: result.command 
                    });

                    // Immediately try to read back the data
                    const verifyQuery = 'SELECT * FROM tata_prices ORDER BY time DESC LIMIT 5';
                    const verifyResult = await pgClient.query(verifyQuery);
                    console.log('Latest records in table:', verifyResult.rows);

                } catch (error) {
                    console.error('Error during data insertion:', error);
                    console.error('Query:', query);
                    console.error('Values:', JSON.stringify(values));
                }
            }
        }
    }

}

main();