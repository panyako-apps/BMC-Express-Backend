import {db} from '../db.js'
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";


export const getBills = (req, res) => {

    let sqlQuery = `
        SELECT 
            bills.*, 
            JSON_OBJECT('id', tenants.id, 'first_name', tenants.first_name, 'other_names', tenants.other_names) AS tenant,
            JSON_OBJECT('name', flats.name, 'flat_no', flats.flat_no) AS flat
        FROM 
            bills 
            JOIN tenants ON tenants.id = bills.tenant_id
            JOIN flats ON flats.id = tenants.flat_id 
        WHERE 1
    `; // consider making a many to many relationship on flats and tenants

    const queryParams = [];

    if (req.query.tenant_id) {
        sqlQuery += " AND tenant_id = ?";
        queryParams.push(req.query.tenant_id)
    } 
    
    if (req.query.search !==undefined && req.query.search !==null && req.query.search !== '') {
        const searchTerm = `%${req.query.search?.trim()}%`;
        sqlQuery += " AND bills.flat_id LIKE ?";
        queryParams.push(searchTerm);
    }


    db.query(sqlQuery, queryParams, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    });
}



export const addBill = (req, res) => {

    // console.log(req.body)
    
    const sqlQuery = "INSERT INTO bills (`id`, `tenant_id`, `flat_id`, `duedate`, `amount`, `created_at`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.tenant_id,
        req.body.flat_id,
        req.body.duedate,
        req.body.amount,
        new Date()

    ];

    // console.log(values)

    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("Bill submitted Successfully");
    })

}



export const getBill = (req, res) => {
       
    const sqlQuery = "SELECT * FROM bills WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
    
}



export const updateBill = (req, res) => {
    const token = req.cookies.tenant_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const tenantId = req.params.id;

        const sqlQuery = "UPDATE bills SET `description`=?";

        const values = [
            req.body.description,
        ];

        db.query(sqlQuery, [...values, tenantId], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Bill info has been updated!")
        })

    })
}



export const deleteBill = (req, res) => {
    const token = req.cookies.tenant_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const billId = req.params.id;
        const sqlQuery = "DELETE FROM bills WHERE `id`=?";

        db.query(sqlQuery, [billId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Bill has been deleted!")
        })

    })
}