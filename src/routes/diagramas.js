import express from 'express';
import loginController from '../controller/logincontroller.js';
import diagramasController from '../controller/diagramascontroller.js';
const router = express.Router();

router.get('/obtenerUltimosDiagramas', loginController.verificarToken, diagramasController.obtenerUltimosDiagramas);


export default router;