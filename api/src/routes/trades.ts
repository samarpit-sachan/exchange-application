import { Router } from "express";
import { Client } from "pg";

export const tradesRouter = Router();

const pgClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'exchange_db',
    password: '#Oneplus7',
    port: 5434,
});
pgClient.connect();

tradesRouter.get("/", async (req, res) => {

    const result = await pgClient.query('SELECT * FROM tata_prices');

    res.json(result.rows);
})
