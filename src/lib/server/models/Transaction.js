const defineTransaction = function(sequelize, DataTypes) {
    return sequelize.define('Transaction', {
        id:          { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        rawtx:        { type: DataTypes.TEXT, allowNull: false },
        network:      { type: DataTypes.STRING, allowNull: false, defaultValue: 'bitcoin' },
        conditions:   { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
        createdAt:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
        updatedAt:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
        broadcasted:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    
    {
        sequelize,
        tableName: 'transactions',
        timestamps: true,
    })
}

export { defineTransaction }