import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const loginController = {
    iniciarSesion: async (req, res) => {
        let { email, password } = req.body;
        
        let [userExist] = await pool.query('SELECT id, correo, contraseña FROM log_usuarios WHERE correo = ?', [email]);
        if (!userExist[0].id) {
            return res.status(400).json({ message: 'Usuario no existe' });
        }

        let passwordMatch = await bcrypt.compare(password, userExist[0].contraseña);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Si la contraseña es correcta, puedes proceder a obtener el id del usuario

        let token = jwt.sign({ id: userExist[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

        // const [result] = await pool.query('SELECT id FROM log_usuarios WHERE correo = ? AND contraseña = ?', [email, password]);
        // res.json(userExist[0]);
    },
};

export default loginController;