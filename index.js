require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()

// middlewares 

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.static('dist'))
app.use(cors())
app.use(express.json());
app.use(requestLogger)


morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        if (persons) {
            response.json(persons)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    const personId = request.params.id
    Person.findById(personId).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const personId = request.params.id

    Person.findByIdAndDelete(personId).then(person => {
        if (person) {
            response.status(200).send(`Person ${person.id} has been deleted`)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    if (!request.body.name || !request.body.number) return response.status(400).json({
        error: 'name or number is missing '
    })

    const person = {
        name: request.body.name,
        number: request.body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {

    if (!request.body.name || !request.body.number) return response.status(400).json({
        error: 'name or number is missing '
    })

    const person = new Person({
        name: request.body.name,
        number: request.body.number,
    })

    person.save().then(savedPerson => {
        if (savedPerson) {
            response.json(savedPerson)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))

})

app.get('/info', (request, response, next) => {
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

    Person.find({}).then(persons => {
        if (persons) {
            response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>`)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


