
const { ApolloServer, gql } = require('apollo-server')
const { RESTDataSource } = require('apollo-datasource-rest')
const express = require('express')

//car data API
class CarDataApi extends RESTDataSource {
    async getCar() {
        const data = await this.get('http://localhost:5000/carData')
        return data
    }
}

// create a memory db
const db = {
    cars: [
        { id: 'a', brand: 'Ford', color: 'Blue', doors: 4, type: 'Sedan' },
        { id: 'b', brand: 'Tesla', color: 'Red', doors: 4, type: 'SUV' },
        { id: 'c', brand: 'Toyota', color: 'White', doors: 3, type: 'Coupe' },
        { id: 'd', brand: 'Fiat', color: 'Green', doors: 5, type: 'Coupe' },
    ]
}

// create schema
const schema = gql(`
    enum CarTypes {
        Sedan
        SUV
        Coupe
        Limo
    }

    type Car {
        id: ID!
        brand: String!
        color: String!
        doors: Int!
        type: CarTypes
    }

    type Query {
        carsByType(type: CarTypes!): [Car]
        carsById(id:ID!): Car
        carsApi: Car
    }

    type Mutation {
        insertCar(brand: String!, color: String!, doors: Int!, type: CarTypes!): [Car]!
    }
`)

// create resolver map
const resolvers = {
    Query: {
        carsByType: (parent, args, context, info) => {
            return context.db.cars.filter(car => car.type === args.type)
        },
        carsById: (parent, args, context, info) => {
            return context.db.cars.filter(car => car.id === args.id)[0]
        },
        carsApi: async (parent, args, context, info) => {
            return await context.dataSources.CarDataApi.getCar()
        }
    },
    // Car: {
    //     brand: (parent, args, context, info) => {
    //         return context.db.cars.filter(car => car.brand === parent.brand)[0].brand
    //     }
    // },
    Mutation: {
        insertCar: (_, { brand, color, doors, type }) => {
            context.db.cars.push({
                id: Math.random().toString(),
                brand: brand,
                color: color,
                doors: doors,
                type: type
            })
            return db.cars
        }
    }
}

// mock database connection 
const dbConnection = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db)
        }, 2000);
    })
}

// create apollo server
const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    dataSources: () => {
        return {
            CarDataApi: new CarDataApi()
        }
    },
    context: async () => {
        return { db: await dbConnection() }
    }
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})


// express server 
const app = express()
app.get('/carData', function (req, res) {
    res.send({
        id: 'd',
        brand: 'Honda',
        color: 'Blue',
        doors: 4,
        type: 'Sedan'
    })
})

app.listen(5000)
