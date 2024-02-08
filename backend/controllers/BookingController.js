import {db} from '../db.js'
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";


export const getBookings = (req, res) => {
    let sqlQuery = `
        SELECT DISTINCT bookings.id, bookings.house_no, bookings.date, bookings.time, bookings.created_at, tenants.first_name, tenants.other_names, flats.name AS flat_name
        FROM bookings
        JOIN tenants ON bookings.tenant_id = tenants.id
        JOIN flats ON tenants.flat_id = flats.id
        WHERE 1
    `;

    const queryParams = [];

    if (req.query.tenant_id) {
        sqlQuery = `SELECT * FROM bookings WHERE bookings.tenant_id = ?`;
        queryParams.push(req.query.tenant_id);
    } else if (req.query.building_manager_id) {
        sqlQuery += ` AND tenants.building_manager_id = ?`;
        queryParams.push(req.query.building_manager_id);
    }

    if (req.query.search !== undefined && req.query.search !== null && req.query.search !== '') {
        const searchTerm = `%${req.query.search?.trim()}%`;
        sqlQuery += ` AND bookings.house_no LIKE ?`;
        queryParams.push(searchTerm);
    }

    db.query(sqlQuery, queryParams, (err, data)=>{
        if(err){
            return res.status(500).json({error: "Internal Server Error"});
        }

        return res.status(200).json(data)
    });
}




export const addBooking = (req, res) => {
    
    const sqlQuery = "INSERT INTO bookings (`id`, `tenant_id`, `house_no`, `date`, `time`, `created_at`) VALUES(?)";

    const values = [
        uuidv4(),
        req.body.tenant_id,
        req.body.house_no,
        req.body.date,
        req.body.time,
        new Date()
    ];

    db.query(sqlQuery, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.status(200).json("House booked successfully");
    })

}



export const getBooking = (req, res) => {
       
    const sqlQuery = "SELECT * FROM bookings WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
    
}



export const deleteBooking = (req, res) => {
    const token = req.cookies.tenant_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const bookingId = req.params.id;
        const sqlQuery = "DELETE FROM bookings WHERE `id`=?";

        db.query(sqlQuery, [bookingId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Booking has been deleted!")
        })

    })
}