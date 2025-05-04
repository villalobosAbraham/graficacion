import pool from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

const diagramasController = {
    obtenerDiagramas : async (req, res) => {
        let idUsuario = req.usuario.id;
        let [diagramasUsuario] = await pool.query(`
            SELECT 
                id, nombre, fechacreacion 
            FROM 
                cat_diagramas 
            WHERE 
                idcreador = ? AND
                activo = TRUE
            ORDER BY 
                fechacreacion`, [idUsuario]);

        return res.status(200).json(diagramasUsuario);
    },
    obtenerUltimosDiagramas: async (req, res) => {
        let idUsuario = req.usuario.id;
        let [registrosIdsDiagramas] = await pool.query(`
            SELECT 
                iddiagrama 
            FROM 
                cat_visualizacionesusuariodiagrama 
            WHERE 
                idusuario = ? 
            ORDER BY 
                fecha, hora, id
            LIMIT 5`, [idUsuario]);
        let idsDiagramas = registrosIdsDiagramas.map(registro => registro.iddiagrama);
        if (idsDiagramas.length <= 0) {
            let [diagramasUsuario] = await pool.query(`
                SELECT 
                    id, nombre, fechacreacion 
                FROM 
                    cat_diagramas 
                WHERE 
                    idcreador = ? AND
                    activo = TRUE
                ORDER BY 
                    fechacreacion
                LIMIT 5`, [idUsuario]);

            return res.status(200).json(diagramasUsuario);
        } else {
            let placeholders = idsDiagramas.map(() => '?').join(',');
            let [diagramasUsuario] = await pool.query(`
                SELECT 
                    id, nombre, fechacreacion 
                FROM 
                    cat_diagramas 
                WHERE 
                    id IN (${placeholders}) AND
                    activo = TRUE
                ORDER BY 
                    fechacreacion`, idsDiagramas);
            return res.status(200).json(diagramasUsuario);
        }
    },
    obtenerDiagramasFavoritos : async (req, res) => {
        let idUsuario = req.usuario.id;
        let [diagramasUsuario] = await pool.query(`
            SELECT 
                cat_diagramas.id, cat_diagramas.nombre, cat_diagramas.fechacreacion 
            FROM 
                cat_diagramas 
            INNER JOIN 
                dia_diagramasfavoritos ON cat_diagramas.id = dia_diagramasfavoritos.iddiagrama
            WHERE 
                dia_diagramasfavoritos.idusuario = ? AND
                cat_diagramas.activo = TRUE
            ORDER BY 
                cat_diagramas.fechacreacion, cat_diagramas.id`, [idUsuario]);

        return res.status(200).json(diagramasUsuario);
    }
};

export default diagramasController;