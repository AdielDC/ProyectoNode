import { DataTypes } from 'sequelize';
import sequelize from './database.js'; // Asegúrate de que la ruta sea correcta

const Craft = sequelize.define('Craft', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

export default Craft;