const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mj9te36.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        const carsCollection = client.db('toyZone').collection('gallery');
        const addToysCollection = client.db('toyZone').collection('addToys');

        app.get('/gallery', async (req, res) => {
            const cursor = carsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // addToys
        app.get('/addToys', async (req, res) => {
            let query = {};

            if (req.query?.email) {
                query = { email: req.query.email }
            }
            else if (req.query.toy_name) {
                const toyNameRegex = new RegExp(req.query.toy_name, 'i');
                query.toy_name = toyNameRegex;
            }
            else if (req.query.category) {
                const toyNameRegex = new RegExp(req.query.category, 'i');
                query.category = toyNameRegex;
            }

            const sortField = req.query.sort || 'price';
            const sortOrder = req.query.order === 'desc' ? -1 : 1;

            const cursor = addToysCollection.find(query).sort({ [sortField]: sortOrder }).limit(20);
            const Toys = await cursor.toArray();
            res.send(Toys);
        });

        app.get('/addToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const allToysId = await addToysCollection.findOne(query);
            res.send(allToysId);
        })

        app.post('/addToys', async (req, res) => {
            const addToys = req.body;
            const toys = await addToysCollection.insertOne(addToys);
            res.send(toys);
        })
        app.put('/addToys/:id', async (req, res) => {
            const id = req.params.id;
            const userData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateToysDetails = {
                $set: {
                    price: userData.price,
                    quantity: userData.quantity,
                    description: userData.description
                }
            }
            const UpdateToysInfo = await addToysCollection.updateOne(filter, updateToysDetails, options);
            res.send(UpdateToysInfo);

        })

        app.delete('/addToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const deleteToy = await addToysCollection.deleteOne(query);
            res.send(deleteToy);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy Zone Is Running')
})

app.listen(port, () => {
    console.log(`Toy Zone Is Running On Port  ${port}`)
})