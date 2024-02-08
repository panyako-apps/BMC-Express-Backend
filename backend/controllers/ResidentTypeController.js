import {db} from '../db.js'
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from 'uuid'


export const getResidentTypes = (req, res) => {

    const sqlQuery = "SELECT * FROM resident_types"
    db.query(sqlQuery, (err, data)=>{
        if(err) return res.json(err)
        return res.status(200).json(data);
    })
}

export const addResidentType = (req, res) => {

    const sqlQuery = "INSERT INTO resident_types (`id`, `name`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.name
    ];
    
    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("Category Added Successfully");
    })


}

export const getResidentType = (req, res) => {

    const sqlQuery = "SELECT * FROM resident_types WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
}

export const updateResidentType = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const buildingManagerId = req.params.id;

        const sqlQuery = "UPDATE resident_types SET `first_name`=?, `other_names`=? WHERE `id`=?";

        const values = [
            req.body.first_name,
            req.body.other_names,
        ];
        
        db.query(sqlQuery, [...values, buildingManagerId], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Manager info has been updated!")
        })

    })
}

export const deleteResidentType = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const buildingManagerId = req.params.id;
        const sqlQuery = "DELETE FROM resident_types WHERE `id`=?";

        db.query(sqlQuery, [buildingManagerId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Manager has been deleted!")
        })

    })
}