const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_reservation_planner');
const uuid = require('uuid');

const createTables = async () => {
    const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers CASCADE;
    DROP TABLE IF EXISTS restaurants CASCADE;

    CREATE TABLE customers (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE restaurants (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE reservations (
        id UUID PRIMARY KEY,
        arrival_date DATE NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
        name VARCHAR(255) NOT NULL UNIQUE
    );
    `;
    await client.query(SQL);
};

const createCustomer = async ({name}) => {
    const SQL = `
    INSERT INTO customers(id, name) VALUES($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const createRestaurant = async ({name}) => {
    const SQL = `
    INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const fetchCustomers = async () => {
    const SQL = 'SELECT * FROM customers';
    const response = await client.query(SQL);
    return response.rows;
};

const fetchRestaurants = async () => {
    const SQL = 'SELECT * FROM restaurants';
    const response = await client.query(SQL);
    return response.rows;
};

const createReservation = async ({ customer_id, restaurant_id, arrival_date, name }) => {
    const SQL = `
    INSERT INTO reservations(id, customer_id, restaurant_id, arrival_date, name)
    VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), customer_id, restaurant_id, arrival_date, name]);
    return response.rows[0];
};

const fetchReservations = async () => {
    const SQL = 'SELECT * FROM reservations';
    const response = await client.query(SQL);
    return response.rows;
};

const destroyReservation = async (id) => {
    const SQL = 'DELETE FROM reservations WHERE id = $1';
    await client.query(SQL, [id]);
};

module.exports = {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    createReservation,
    destroyReservation,
};
