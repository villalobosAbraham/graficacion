import express from 'express';
import loginController from '../controller/logincontroller.js';

const router = express.Router();

router.get('/', (req, res) => {
    // let enctriptado = await bcrypt.hash('juan123', 10);
    // res.send(enctriptado);
});

router.post('/iniciarSesion', loginController.iniciarSesion); 
router.post('/registrarse', loginController.registrarse);
router.post('/cerrarSesion', loginController.cerrarSesion);

export default router;