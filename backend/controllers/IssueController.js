import {db} from '../db.js'
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";


function handleQueryResult(res) {
    return (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    };
}



export const getIssues = (req, res) => {

    let sqlQuery = "SELECT * FROM issues WHERE 1";
    
    const queryParams = [];

    if (req.query.tenant_id) {
        sqlQuery += " AND tenant_id = ?";
        queryParams.push(req.query.tenant_id)
    } 
    
    if (req.query.search !==undefined && req.query.search !==null && req.query.search !== '') {
        const searchTerm = `%${req.query.search?.trim()}%`;
        sqlQuery += " AND issues.description LIKE ?";
        queryParams.push(searchTerm);
    }

    db.query(sqlQuery, queryParams, handleQueryResult(res));
}



export const addIssue = (req, res) => {

    // console.log(req.body)
    
    const sqlQuery = "INSERT INTO issues (`id`, `tenant_id`, `description`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.tenant_id,
        req.body.description,
    ];

    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("Issue submitted Successfully");
    })

}



export const getIssue = (req, res) => {
       
    const sqlQuery = "SELECT * FROM issues WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
    
}



export const updateIssue = (req, res) => {
    const token = req.cookies.tenant_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const issueId = req.params.id;

        const sqlQuery = "UPDATE issues SET `description`=? WHERE id=?";

        const values = [
            req.body.description,
        ];

        db.query(sqlQuery, [...values, issueId], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Issue info has been updated!")
        })

    })
}




export const deleteIssue = (req, res) => {
    const token = req.cookies.tenant_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const issueId = req.params.id;
        const sqlQuery = "DELETE FROM issues WHERE `id`=?";

        db.query(sqlQuery, [issueId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Issue has been deleted!")
        })

    })
}