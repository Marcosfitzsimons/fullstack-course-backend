const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// middlewares 

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(cors())
app.use(express.json());
app.use(requestLogger)

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


function generateRandomId() {
    const min = 100000; // Minimum value for the ID
    const max = 999999; // Maximum value for the ID
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id)
    const person = persons.find(person => person.id === personId)

    if (!person) return response.status(404).end()

    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const personId = Number(request.params.id)
    const person = persons.find(person => person.id === personId)

    if (!person) return response.status(404).end()

    response.send('Person has been deleted')
})

app.post('/api/persons', (request, response) => {

    if (!request.body.name || !request.body.number) return response.status(400).json({
        error: 'name or number is missing '
    })

    const nameAlreadyExists = persons.find(person => person.name.toLowerCase() === request.body.name.toLowerCase())

    if (nameAlreadyExists) return response.status(400).json({
        error: 'name must be unique'
    })

    const newPerson = {
        name: request.body.name,
        number: request.body.number,
        id: generateRandomId()
    }

    response.json(newPerson)
})


app.get('/info', (request, response) => {
    const currentDate = new Date().toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
    });

    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})