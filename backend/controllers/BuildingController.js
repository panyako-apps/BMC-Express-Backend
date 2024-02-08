import {db} from '../db.js'
import generateSlug from '../utils/slugify.js'
import {v4 as uuidv4} from 'uuid'
import jwt from "jsonwebtoken";


export const getBuildings = (req, res) => {
   
    let sqlQuery = "SELECT * FROM buildings WHERE 1";
    
    const queryParams = [];

    if (req.query.company_id) {
        sqlQuery += " AND company_id = ?";
        queryParams.push(req.query.company_id)
    } 
    
    if (req.query.search !==undefined && req.query.search !==null && req.query.search !== '') {
        const searchTerm = `%${req.query.search?.trim()}%`;
        sqlQuery += " AND (buildings.name LIKE ? OR buildings.description LIKE ?)";
        queryParams.push(searchTerm, searchTerm);
    }

    if (req.query.building_manager_id) {
        sqlQuery = `
            SELECT buildings.*
            FROM buildings
            JOIN building_building_manager ON buildings.id = building_building_manager.building_id
            WHERE building_building_manager.building_manager_id = ?
        `;

        queryParams.push(req.query.building_manager_id)
    } 
    

    sqlQuery += " ORDER BY created_at DESC";
    
    db.query(sqlQuery, queryParams, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    });

};



export const addBuilding = (req, res) => {

    const sqlQuery = "INSERT INTO buildings (`id`, `project_id`, `company_id`, `name`, `description`, `slug`, `created_at`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.project_id,
        req.body.company_id,
        req.body.name,
        req.body.description,
        generateSlug(req.body.name),
        new Date()

    ];
    
    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("Building Added Successfully");
    })

    // console.log(values)
}


export const getBuilding = (req, res) => {

    const sqlQuery = "SELECT * FROM buildings WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
}

export const updateBuilding = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const buildingId = req.params.id;
        const sqlQuery = "UPDATE buildings SET `project_id`=?, `name`=?, `description`=? WHERE `id`=? AND `company_id`=? ";

        const values = [
            req.body.project_id,
            req.body.name,
            req.body.description,  
        ];
        
        db.query(sqlQuery, [...values, buildingId, userInfo.id], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Building has been updated!")
        })

    })
}

export const deleteBuilding = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const buildingId = req.params.id;
        const sqlQuery = "DELETE FROM buildings WHERE `id`=? AND `company_id`=? ";

        db.query(sqlQuery, [buildingId, userInfo.id], (err, data)=>{
            if(err) return res.status(403).json("You can delete only your buildings!");
            return res.status(200).json("Building has been deleted!")
        })

    })
}