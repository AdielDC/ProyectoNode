
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('prueba', 'root', '', {
    host: 'localhost',
    dialect: 'mysql', 
});

export default sequelize;