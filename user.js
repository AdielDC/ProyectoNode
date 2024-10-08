
import { DataTypes } from 'sequelize';
import sequelize from './database.js';

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    profile: {
        type: DataTypes.JSONB, // Para almacenar objetos JSON
        allowNull: true,
    },
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

export default User;