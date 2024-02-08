const express = require("express")
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ay7bogq.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        const todoCollection = client.db('todo-list').collection('todos');

        app.get('/todos', async (req, res) => {

            let query = {};
            if (req.query.priority !== 'all') {
                query.priority = req.query.priority;
            }

            const incompleteTodos = await todoCollection.find({ ...query, isCompleted: false }).toArray();
            const completedTodos = await todoCollection.find({ ...query, isCompleted: true }).toArray();
            const todos = incompleteTodos.concat(completedTodos);

            res.json(todos);
        })

        app.post('/todo', async (req, res) => {
            const todo = req.body;
            const result = await todoCollection.insertOne(todo);
            res.json(result);
        })

        app.put('/todo/:id', async (req, res) => {
            const id = req.params.id;
            const todo = req.body;
            const result = await todoCollection.updateOne({ _id: new ObjectId(id) }, { $set: todo });
            res.json(result);
        })

        app.delete('/todo/:id', async (req, res) => {
            const id = req.params.id;
            const result = await todoCollection.deleteOne({ _id: new ObjectId(id) });
            res.json(result);
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



app.listen(
    port, () => console.log(`Server is running on port ${port}`)
)
app.get('/', (req, res) => {
    res.send('Todo list server running..........');
});