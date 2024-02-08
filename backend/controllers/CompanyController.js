import {db} from '../db.js'


function handleQueryResult(res) {
    return (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    };
}


export const getCompanies = (req, res) => {

    let sqlQuery = "SELECT * FROM companies WHERE 1"; // Start the query with a true condition
    
    const queryParams = [];

    if (req.query.search !== undefined && req.query.search !== null && req.query.search !== '') {
        const searchTerm = `%${req.query?.search.trim()}%`;
        sqlQuery += " AND companies.name LIKE ?";
        queryParams.push(searchTerm);
    }

    sqlQuery += " ORDER BY created_at ASC";

    db.query(sqlQuery, queryParams, handleQueryResult(res));
};



export const addCompany = (req, res) => {
    res.json("Get Companies")
}

export const getCompany = (req, res) => {
    res.json("Get Companies")
}

export const updateCompany = (req, res) => {
    res.json("Get Companies")
}

export const deleteCompany = (req, res) => {
    res.json("Get Companies")
}