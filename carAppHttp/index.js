const { graphql, buildSchema } = require('graphql')
const express = require('express')
const { graphqlHTTP } = require('express-graphql')

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
const schema = buildSchema(`
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
    }

    type Mutation {
        insertCar(brand: String!, color: String!, doors: Int!, type: CarTypes!): [Car]!
    }
`)

// create resolvers
const resolvers = () => {
    const carsByType = (args) => {
        return db.cars.filter(car => car.type === args.type)
    }

    const carsById = (args) => {
        return db.cars.filter(car => car.id === args.id)[0]
    }

    const insertCar = ({ brand, color, doors, type }) => {
        db.cars.push({
            id: Math.random().toString(),
            brand: brand,
            color: color,
            doors: doors,
            type: type,
        })
        return db.cars
    }


    return { carsByType, carsById, insertCar }
}


// excute queries
// const excuteQuery = async () => {

//     const queryByType = `
//     {
//         carsByType(type: Coupe) {
//             brand
//             color
//             type
//             id
//         }
//     }
//     `

//     const responseOne = await graphql(schema, queryByType, resolvers())
//     // console.log(responseOne.data)

//     const queryById = `
//     {
//         carsById(id: "b") {
//         brand
//         color
//         type
//         id
//         }
//     }
//     `
//     const responseTwo = await graphql(schema, queryById, resolvers())
//     // console.log(responseTwo.data)

//     const mutationQuery = `
//         mutation {
//             insertCar(brand: "Nissan", color: "Pink", doors: 5, type: SUV) {
//                 brand
//                 color
//                 doors
//                 id
//             }
//         }
//     `

//     const mutationResponse = await graphql(schema, mutationQuery, resolvers());
//     // console.log(mutationResponse.data);

//     const mutationsWithVariables = `
//         mutation insertCar($brand: String!, $color: String!, $doors: Int!, $type: CarTypes!) {
//             insertCar(brand: $brand, color: $color, doors: $doors, type: $type) {
//                 brand
//                 color
//                 id
//                 doors
//             }
//         }
//     `

//     const mutationVarResponse = await graphql(schema, mutationsWithVariables, resolvers(), null, {
//         brand: 'Mustang',
//         color: 'Orange',
//         doors: 2,
//         type: 'Coupe'
//     })

//     console.log(mutationVarResponse.data)


// }
// excuteQuery();



// http server
const app = express();

app.use(
    '/graphql',
    graphqlHTTP({ schema: schema, rootValue: resolvers(), graphiql: true }))

app.listen(3000)
console.log('GraphQL server is listening to PORT 3000')
