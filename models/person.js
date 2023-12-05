const mongoose = require('mongoose')

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
mongoose.set('strictQuery', false)

const url = process.env.MONGO_URL

mongoose.connect(url)
    .then(result => { console.log('connected to MongoDB') }).catch((error) => { console.log('error connecting to MongoDB:', error.message) })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        validate: {
            validator: function (v) {
                return /^\d{2,3}-\d+$/.test(v) && v.length >= 8; // Custom validation using regex
            },
            message: props => `${props.value} is not a valid phone number! Please use the format xx-xxxxxxx.`,
        },
        required: true,
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)
