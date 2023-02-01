import { Sequelize, DataTypes } from 'sequelize'
import { defineTransaction }     from './models/Transaction.js'


const sequelize = new Sequelize(import.meta.env.VITE_DATABASE_URL, {
    logging: false,
    pool: { max: 10, min: 5, idle: 30000, acquire: 60000 }
})

const Transaction = defineTransaction(sequelize, DataTypes)

export { sequelize, Transaction }