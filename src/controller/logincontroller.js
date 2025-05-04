import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const loginController = {
    registrarse: async (req, res) => {
        try {

            let { email, password, telefono, nombres, apellidoPaterno, apellidoMaterno } = req.body;
            let [userExist] = await pool.query('SELECT id FROM log_usuarios WHERE correo = ?', [email]);
            if (userExist.length > 0) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }
    
            let saltRounds = parseInt(process.env.SALT_ROUNDS);
            let hashedPassword = await bcrypt.hash(password, saltRounds);
            const [result] = await pool.query(
                'INSERT INTO log_usuarios (correo, contraseña, telefono, nombres, apellidopaterno, apellidomaterno) VALUES (?, ?, ?, ?, ?, ?)', 
                [email, hashedPassword, telefono, nombres, apellidoPaterno, apellidoMaterno]
            );
            
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Usuario registrado correctamente' });
            } else {
                res.status(500).json({ message: 'Error al registrar el usuario en la Base de Datos' });
            }
        } catch (err) {
            console.error('Error al registrar el usuario:', err);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    iniciarSesion: async (req, res) => {
        let { email, password } = req.body;
        
        let [userExist] = await pool.query('SELECT id, correo, contraseña FROM log_usuarios WHERE correo = ?', [email]);
        if (!userExist ||!userExist[0].id) {
            return res.status(400).json({ message: 'Usuario no existe' });
        }

        let passwordMatch = await bcrypt.compare(password, userExist[0].contraseña);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        let tiempo = new Date();
        let hours = tiempo.getHours().toString().padStart(2, '0');
        let minutes = tiempo.getMinutes().toString().padStart(2, '0');
        let seconds = tiempo.getSeconds().toString().padStart(2, '0');
        let horaActual = `${hours}:${minutes}:${seconds}`;
        let [actualizacion] = await pool.query('UPDATE log_usuarios SET fechaultimaconexion = ?, horaultimaconexion = ? WHERE id = ?', [tiempo, horaActual, userExist[0].id]);
        if (actualizacion.affectedRows > 0) {
            let token = jwt.sign(
                { 
                    id: userExist[0].id,
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );
            res
                .cookie('access_token', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 3600000, // 1 hour
                })
                .send(true);
        } else {
            res.status(500).json({ message: 'Error al registrar el usuario' });
        }
    },
    cerrarSesion: async (req, res) => {
        try {
            // Leer el token desde la cookie
            let token = req.cookies.access_token;
    
            if (!token) {
                return res.status(401).json({ message: 'No se encontró el token de sesión' });
            }
    
            // Verificar el token
            let decoded = jwt.verify(token, process.env.JWT_SECRET);
    
            // Consultar si el usuario existe
            let [result] = await pool.query('SELECT id FROM log_usuarios WHERE id = ?', [decoded.id]);
            if (!result || result.length === 0) {
                return res.status(401).json({ message: 'Usuario inválido' });
            }
    
            // Limpiar la cookie
            res.clearCookie('access_token', {
                httpOnly: true,
                sameSite: 'strict',
            });
    
            return res.status(200).json({ message: 'Sesión cerrada correctamente' });
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(401).json({ message: 'Fallo al Cerrar Sesión' });
        }
    },
    verificarToken: (req, res, next) => {
        let token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: 'No se encontró el token de sesión' });
        }
    
        try {
            let decoded = jwt.verify(token, process.env.JWT_SECRET);
    
            // Aquí puedes volver a emitir un token con nueva expiración
            let nuevoToken = jwt.sign(
                {
                    id: decoded.id,
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
    
            res.cookie('access_token', nuevoToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 3600000 // 1 hora
            });
    
            req.usuario = decoded; // para que otros middlewares/rutas puedan usarlo
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
    },
};

export default loginController;