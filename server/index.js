const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    createReservation,
    destroyReservation,
    fetchReservations,
} = require('./db');

const express = require('express');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/customers', async( req, res, next) => {
    try {
        res.send(await fetchCustomers());
    }   catch (error) {
        next(error);
    }
});

app.get('/api/restaurants', async( req, res, next) => {
    try {
        res.send(await fetchRestaurants());
    }   catch (error) {
        next(error);
    }
});

app.get('/api/reservations', async( req, res, next) => {
    try {
        res.send(await fetchReservations());
    }   catch (error) {
        next(error);
    }
});

app.delete('/api/customers/:customer_id/reservations/:id',
async(req, res, next) => {
    try {
        await destroyReservation({customer_id: req.params.customer_id, id: req.params.id})
        res.sendStatus(204)
    }   catch (error) {
        next(error)
    }
});

app.post('/api/customers/:customer_id/resevervations', async(req, res, next) => {
    try {
        res.status(201).send(await createReservation({customer_id: req.params.customer_id, restaurant_id: req.body.restaurant_id, arrival_date: req.body.arrival_date}));
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send({error: err.message || err});
});

const init = async () => {
    await client.connect();

    await createTables();
    console.log('Tables created');

    // Create customers and restaurants
    const [moe, lucy, larry, ethyl, curiousSpoon, emberSpice, beesBistro] = await Promise.all([
        createCustomer({ name: 'moe' }),
        createCustomer({ name: 'lucy' }),
        createCustomer({ name: 'larry' }),
        createCustomer({ name: 'ethyl' }),
        createRestaurant({ name: 'curiousSpoon' }),
        createRestaurant({ name: 'emberSpice' }),
        createRestaurant({ name: 'beesBistro' }),
    ]);

    console.log('Data seeded');

    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    // Create reservations 
    const [reservation1, reservation2, reservation3, reservation4, reservation5] = await Promise.all([
        createReservation({
            customer_id: lucy.id,
            restaurant_id: emberSpice.id,
            arrival_date: '2024-05-19',
            name: 'Lucy\'s Dinner at EmberSpice'
        }),
        createReservation({
            customer_id: moe.id,
            restaurant_id: curiousSpoon.id,
            arrival_date: '2024-06-01',
            name: 'Moe\'s Brunch at CuriousSpoon'
        }),
        createReservation({
            customer_id: larry.id,
            restaurant_id: beesBistro.id,
            arrival_date: '2024-05-25',
            name: 'Larry\'s Lunch at BeesBistro'
        }),
        createReservation({
            customer_id: larry.id,
            restaurant_id: emberSpice.id,
            arrival_date: '2024-05-30',
            name: 'Larry\'s Dinner at EmberSpice'
        }),
        createReservation({
            customer_id: ethyl.id,
            restaurant_id: beesBistro.id,
            arrival_date: '2024-05-22',
            name: 'Ethyl\'s Dinner at BeesBistro'
        })
    ]);

    console.log('Reservations created');
    console.log(await fetchReservations());

    // Destroy the first reservation using only its ID
    await destroyReservation(reservation1.id);

    // Start the Express server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
};

init();
