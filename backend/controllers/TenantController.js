import {db} from '../db.js'
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";



export const getTenants = (req, res) => {

    let sqlQuery = "SELECT tenants.*, flats.name AS flat_name, flats.flat_no FROM tenants" 
        sqlQuery += " LEFT JOIN flats ON tenants.flat_id = flats.id" //Will change this relationship to be M:M
        sqlQuery += " WHERE 1";
    
    const queryParams = [];

    if (req.query.building_manager_id) {
        sqlQuery += " AND tenants.building_manager_id = ?";
        queryParams.push(req.query.building_manager_id)
    } 
    
    if (req.query.search !==undefined && req.query.search !==null && req.query.search !== '') {
        const searchTerm = `%${req.query.search?.trim()}%`;
        sqlQuery += " AND (tenants.first_name LIKE ? OR tenants.other_names LIKE ? OR tenants.email LIKE ?) ";
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    db.query(sqlQuery, queryParams, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    });
}




export const addTenant = (req, res) => {

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const sqlQuery = "INSERT INTO tenants (`id`, `building_manager_id`, `resident_type_id`, `flat_id`, `first_name`, `other_names`, `mobile_no`, `document`, `email`, `password`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.building_manager_id,
        req.body.resident_type_id,
        req.body.flat_id,
        req.body.first_name,
        req.body.other_names,
        req.body.mobile_no,
        req.body.document || null,
        req.body.email,
        hash,
    ];

    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("Tenant Added Successfully");
    })

}

export const getTenant = (req, res) => {
       
    const sqlQuery = "SELECT * FROM tenants WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
    
}

export const updateTenant = (req, res) => {
    const token = req.cookies.building_manager_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const tenantId = req.params.id;

        const sqlQuery = "UPDATE tenants SET `resident_type_id`=?, `flat_id`=?, `first_name`=?, `other_names`=?, `mobile_no`=? WHERE `id`=?";

        // console.log(req.body)


        const values = [
            req.body.resident_type_id,
            req.body.flat_id,
            req.body.first_name,
            req.body.other_names,
            req.body.mobile_no,
        ];

        db.query(sqlQuery, [...values, tenantId], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Tenant info has been updated!")
        })

    })
}




export const deleteTenant = (req, res) => {
    const token = req.cookies.building_manager_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const tenantId = req.params.id;
        const sqlQuery = "DELETE FROM tenants WHERE `id`=?";

        db.query(sqlQuery, [tenantId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Tenant has been deleted!")
        })

    })
}