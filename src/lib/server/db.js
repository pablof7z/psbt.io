import { Sequelize, DataTypes } from 'sequelize'
import { defineTransaction }     from './models/Transaction.js'


// we create the db cnx
const sequelize = new Sequelize('postgres://localhost/psbt_io_development', {
    logging: false,
    pool: { max: 10, min: 5, idle: 30000, acquire: 60000 }
})


// we instantiate our models
const Transaction = defineTransaction(sequelize, DataTypes)


// relations between models
export { sequelize, Transaction }