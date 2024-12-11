import express from "express";
import jwt from "jsonwebtoken";
import { Sequelize, DataTypes } from "sequelize";
import fs from "fs";
import http from "http";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import stripe from 'stripe';

dotenv.config();

const app = express();
//const hostname = "127.0.0.1";
const hostname = "192.168.137.114";
const PORT = 3000;

// Configuración de CORS
const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.0.5', 'http://192.68.0.6'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 86400
};
app.use(cors());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conexión a la base de datos MySQL
const sequelize = new Sequelize("myDatabase", "root", "", {
    host: "localhost",
    dialect: "mysql",
});

// Verifica la conexión
sequelize.authenticate()
    .then(() => console.log("Conectado a MySQL"))
    .catch(err => console.error("No se pudo conectar a MySQL:", err));

// Modelo de Usuario
const User = sequelize.define("User", {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Modelo de Artesanía
const Craft = sequelize.define("Craft", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stock:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

// Modelo de Categoría de Artesanía
const CraftCategory = sequelize.define("CraftCategory", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});


// Sincroniza los modelos con la base de datos
sequelize.sync()
    .then(() => console.log("Base de datos sincronizada"))
    .catch(err => console.error("Error al sincronizar la base de datos:", err));

const server = http.createServer(app);

// Middleware de autenticación JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ error: "Token no proporcionado" });
    }

    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido" });
        }
        req.user = user;
        next();
    });
};

// Middleware de manejo de errores CORS
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ error: 'Token inválido' });
    } else if (err.name === 'NotAllowedError') {
        res.status(403).json({ error: 'CORS no permitido' });
    } else {
        next(err);
    }
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("API Artesanías - Ruta principal");
});

// Rutas de Usuarios
app.post("/api/users/register", async (req, res) => {
    try {
        const { nombre, telefono, password } = req.body;
        if (!nombre || !telefono || !password) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ nombre, telefono, password: hashedPassword });
        const token = jwt.sign({ id: newUser.id }, process.env.SECRET, { expiresIn: "1h" });
        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(400).json({ error: "Error al registrar usuario" });
    }
});

app.post("/api/users/login", async (req, res) => {
    try {
        const { nombre, telefono, password } = req.body;
        const user = await User.findOne({ where: { nombre, telefono } });
        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "1h" });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: "Error en el login" });
    }
});

app.get("/api/users/profile", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el perfil" });
    }
});

app.put("/api/users/profile", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        user.nombre = req.body.nombre;
        user.telefono = req.body.telefono;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el perfil" });
    }
});

app.delete("/api/users/profile", authenticateJWT, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        await user.destroy();
        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});

// Rutas de Artesanías
app.get("/api/crafts", async (req, res) => {
    try {
        const crafts = await Craft.findAll();
        res.json(crafts);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener artesanías" });
    }
});

app.post("/api/crafts", authenticateJWT, async (req, res) => {
    try {
        const { title, description, price, stock} = req.body;
        const newCraft = await Craft.create({ title, description, price, stock});
        res.status(201).json(newCraft);
    } catch (error) {
        res.status(400).json({ error: "Error al crear artesanía" });
    }
});

app.get("/api/crafts/:id", async (req, res) => {
    try {
        const craft = await Craft.findByPk(req.params.id);
        if (!craft) return res.status(404).json({ error: "Artesanía no encontrada" });
        res.json(craft);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener artesanía" });
    }
});

app.put("/api/crafts/:id", authenticateJWT, async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const craft = await Craft.findByPk(req.params.id);
        if (!craft) return res.status(404).json({ error: "Artesanía no encontrada" });

        craft.title = title;
        craft.description = description;
        craft.price = price;
        craft.stock= stock;
        await craft.save();
        res.json(craft);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar artesanía" });
    }
});

app.delete("/api/crafts/:id", authenticateJWT, async (req, res) => {
    try {
        const craft = await Craft.findByPk(req.params.id);
        if (!craft) return res.status(404).json({ error: "Artesanía no encontrada" });
        await craft.destroy();
        res.json({ message: "Artesanía eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar artesanía" });
    }
});


// Rutas de Categorías
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await CraftCategory.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categorías" });
    }
});

app.post("/api/categories", authenticateJWT, async (req, res) => {
    try {
        const { title, description } = req.body;
        const newCategory = await CraftCategory.create({ title, description });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ error: "Error al crear categoría" });
    }
});

app.get("/api/categories/:id", async (req, res) => {
    try {
        const category = await CraftCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener categoría" });
    }
});

app.put("/api/categories/:id", authenticateJWT, async (req, res) => {
    try {
        const { title, description } = req.body;
        const category = await CraftCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });

        category.title = title;
        category.description = description;
        await category.save();
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar categoría" });
    }
});

app.delete("/api/categories/:id", authenticateJWT, async (req, res) => {
    try {
        const category = await CraftCategory.findByPk(req.params.id);
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
        await category.destroy();
        res.json({ message: "Categoría eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
});

// Iniciar servidor


server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}/`);
});
