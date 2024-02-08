import {db} from '../db.js'
import {v4 as uuidv4} from 'uuid'
import generateSlug from '../utils/slugify.js'
import jwt from "jsonwebtoken";



function handleQueryResult(res) {
    return (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    };
}



// export const getProjects = (req, res) => {
//     // Parse the page and limit from the request query parameters
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided

//     // Calculate the offset based on the page and limit
//     const offset = (page - 1) * limit;

//     // Use placeholders in the SQL query for dynamic values
//     const sqlQuery = req.query.company_id
//         ? "SELECT * FROM projects WHERE company_id = ? LIMIT ? OFFSET ?"
//         : "SELECT * FROM projects LIMIT ? OFFSET ?";

//     // Use prepared statements to prevent SQL injection
//     db.query(sqlQuery, [req.query.company_id, limit, offset], (err, data) => {
//         if (err) return res.status(500).json(err);
//         return res.status(200).json(data);
//     });
// };


export const getProjects = (req, res) => {

    let sqlQuery = "SELECT * FROM projects WHERE 1"; // Start the query with a true condition
    
    const queryParams = [];

    if (req.query.company_id) {
        sqlQuery += " AND company_id = ?";
        queryParams.push(req.query.company_id);
    }

    if (req.query.search !== undefined && req.query.search !== null && req.query.search !== '') {
        const searchTerm = `%${req.query?.search.trim()}%`;
        sqlQuery += " AND (projects.name LIKE ? OR projects.description LIKE ?)";
        queryParams.push(searchTerm, searchTerm);
    }

    sqlQuery += " ORDER BY created_at DESC";


    db.query(sqlQuery, queryParams, handleQueryResult(res));
};



export const addProject = (req, res) => {
    const sqlQuery = "INSERT INTO projects (`id`, `company_id`, `name`, `location`, `description`, `slug`, `created_at`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.company_id,
        req.body.name,
        req.body.location,
        req.body.description,
        generateSlug(req.body.name),
        new Date()

    ];

    
    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json("Project Created Successfully");
    })
    
}

export const getProject = (req, res) => {

    const sqlQuery = "SELECT * FROM projects WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
}

export const updateProject = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const projectId = req.params.id;
        const sqlQuery = "UPDATE projects SET `name`=?, `location`=?, `description`=? WHERE `id`=? AND `company_id`=? ";

        const values = [
            req.body.name,
            req.body.location,
            req.body.description,    
        ];
        
        db.query(sqlQuery, [...values, projectId, userInfo.id], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Project has been updated!")
        })

    })
}

export const deleteProject = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const projectId = req.params.id;
        const sqlQuery = "DELETE FROM projects WHERE `id`=? AND `company_id`=? ";

        db.query(sqlQuery, [projectId, userInfo.id], (err, data)=>{
            if(err) return res.status(403).json("You can delete only your projects!");
            return res.status(200).json("Project has been deleted!")
        })

    })
}