import {db} from '../db.js'
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from 'uuid'




export const getFlats = (req, res) => {


    let sqlQuery = "SELECT flats.id, flats.name, flats.flat_no, flats.created_at, flats.building_manager_id, tenants.id AS tenant_id, tenants.first_name AS tenant_first_name, tenants.other_names AS tenant_other_names, tenants.email AS tenant_email, tenants.mobile_no AS tenant_mobile_no, tenants.status AS tenant_staying_status, flat_categories.name AS flat_category_name FROM flats";
    
    sqlQuery += " LEFT JOIN tenants ON flats.id = tenants.flat_id";
    
    sqlQuery += " LEFT JOIN flat_categories ON flats.flat_category_id = flat_categories.id";

    sqlQuery += " WHERE 1";
    
    
    const queryParams = [];

    if (req.query.building_manager_id) {
        queryParams.push(req.query.building_manager_id);
        sqlQuery += " AND flats.building_manager_id = ?";
    }

    if (req.query.building_id) {
        queryParams.push(req.query.building_id);
        sqlQuery = "SELECT * FROM flats WHERE flats.building_id = ?";
    }

    if (req.query.search !== undefined && req.query.search !== null && req.query.search !== '') {
        const searchTerm = `%${req.query.search.trim()}%`;
        sqlQuery += " AND flats.name LIKE ?";
        queryParams.push(searchTerm);
    }

    // sqlQuery += " ORDER by `created_at` DESC";

    db.query(sqlQuery, queryParams, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);

        // if(err) console.log(err)
    });
};



export const addFlat = (req, res) => {

    const sqlQuery = "INSERT INTO flats (`id`, `building_manager_id`, `building_id`, `flat_category_id`, `name`, `flat_no`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.building_manager_id,
        req.body.building_id,
        req.body.flat_category_id,
        req.body.name,
        req.body.flat_no,
    ];

    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("Flat Added Successfully");
    })
}



export const getFlat = (req, res) => {
   
    const sqlQuery = "SELECT * FROM flats WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
    
}



export const updateFlat = (req, res) => {

    const token = req.cookies.building_manager_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const flatId = req.params.id;

        const sqlQuery = "UPDATE flats SET `building_id`=?, `flat_category_id`=?, `name`=?, `flat_no`=? WHERE `id`=?";

        const values = [
            req.body.building_id,
            req.body.flat_category_id,
            req.body.name,
            req.body.flat_no,
        ];
        
        db.query(sqlQuery, [...values, flatId], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Flat info has been updated!")
        })

    })
}

export const deleteFlat = (req, res) => {

    const token = req.cookies.building_manager_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const flatId = req.params.id;
        const sqlQuery = "DELETE FROM flats WHERE `id`=?";

        db.query(sqlQuery, [flatId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Flat has been deleted!")
        })

    })
}