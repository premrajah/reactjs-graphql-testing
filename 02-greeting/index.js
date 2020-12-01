const { graphql, buildSchema } = require('graphql');

// buisl schema
const schema = buildSchema(`
    type Query {
        greeting(name: String) : String
    }
`)

// create resolver
const resolvers = () => {
    const greeting = (args) => {
        return `Hello ${args.name}`
    }

    return { greeting }
}

// excute query
const excuteQuery = async () => {
    const result = await graphql(schema, '{greeting(name: "Peter Parker")}', resolvers());
    console.log(result)
}

excuteQuery();