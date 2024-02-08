import { db } from "../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import generateSlug from "../utils/slugify.js";

// Admin
export const register = (req, res)=>{

    const sqlQuery = "SELECT * FROM users WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json(err)
        if (data.length) return res.status(409).json("User already exists");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const sqlQuery = "INSERT INTO users (`id`, `first_name`, `other_names`, `email`, `password`) VALUES(?)";

        const values = [
            uuidv4(),
            req.body.first_name,
            req.body.other_names,
            req.body.email,
            hash,
        ];

        db.query(sqlQuery, [values], (err, result)=>{
            if(err) return res.json(err);
                return res.status(200).json("User has been created");
        })


    })
 
}



export const login = (req, res)=>{


    const sqlQuery = "SELECT * FROM users WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json({err});

        if(data.length === 0) return res.status(404).json("User not found!")

        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, 
            data[0].password)

        if(!isPasswordCorrect) 
            return res.status(400).json("Wrong email or password!");

        const token = jwt.sign({id: data[0].id}, "jwt-secret-key");
        const {password, ...other} = data[0];


        res
        .cookie("access_token", token, {
            httpOnly: true,
            // secure: false
        })
        .status(200)
        .json(other); 

    })


}


export const logout = (req, res)=>{
    res.clearCookie('access_token', {

    }).status(200).json("User has been logged out");
}


//Company 

export const registerCompany = (req, res)=>{

    const sqlQuery = "SELECT * FROM companies WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json(err)
        if (data.length) return res.status(409).json("Company already exists");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const sqlQuery = "INSERT INTO companies (`id`, `name`, `email`, `slug`, `password`) VALUES(?)";

        const values = [
            uuidv4(),
            req.body.name,
            req.body.email,
            generateSlug(req.body.name),
            hash,
        ];

        db.query(sqlQuery, [values], (err, result)=>{
            if(err) return res.json(err);
                return res.status(200).json("Company has been created");
        })

    })

    

}


export const loginCompany = (req, res)=>{


    const sqlQuery = "SELECT * FROM companies WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json({err});

        if(data.length === 0) return res.status(404).json("Company not found!")

        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, 
            data[0].password)

        if(!isPasswordCorrect) 
            return res.status(400).json("Wrong company email or password!");

        const token = jwt.sign({id: data[0].id}, "jwt-secret-key");
        const {password, ...other} = data[0];
        
        res.cookie("company_access_token", token, {
            httpOnly: true,
            secure: false,
            domain: 'localhost',
        })
        .status(200)
        .json(other) 

    })
}



export const logoutCompany = (req, res)=>{
    res.clearCookie('company_access_token', {

    }).status(200).json("Company has been logged out");
}


//Building Manager 

export const registerBuildingManager = (req, res)=>{

    const sqlQuery = "SELECT * FROM building_managers WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json(err)
        if (data.length) return res.status(409).json("User already exists");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const sqlQuery = "INSERT INTO building_managers (`id`, `company_id`, `first_name`, `other_names`, `email`, `password`, `created_at`) VALUES(?)";

        const values = [
            uuidv4(),
            req.body.company_id,
            req.body.first_name,
            req.body.other_names,
            req.body.email,
            hash,
            new Date()
        ];



        db.query(sqlQuery, [values], (err, result)=>{
            if(err) return res.json(err);
                return res.status(200).json("Account has been created");
        })

    })

    

}


export const loginBuildingManager = (req, res)=>{

    // console.log(req.body)

    const sqlQuery = "SELECT * FROM building_managers WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json({err});

        if(data.length === 0) return res.status(404).json("Account does not exist!")

        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, 
            data[0].password)

        if(!isPasswordCorrect) 
            return res.status(400).json("Wrong email or password!");

        const token = jwt.sign({id: data[0].id}, "jwt-secret-key");
        const {password, ...other} = data[0];


        res
        .cookie("building_manager_access_token", token, {
            httpOnly: true,
            // secure: false
        })
        .status(200)
        .json(other) 

    })


}

export const logoutBuildingManager = (req, res)=>{
    res.clearCookie('building_manager_access_token', {

    }).status(200).json("Building manager has been logged out");
}



//Tenant 

export const registerTenant = (req, res)=>{

    const sqlQuery = "SELECT * FROM tenants WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json(err)
        if (data.length) return res.status(409).json("User already exists");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const sqlQuery = "INSERT INTO tenants (`id`, `company_id`, `first_name`, `other_names`, `email`, `password`) VALUES(?)";

        const values = [
            uuidv4(),
            req.body.company_id,
            req.body.first_name,
            req.body.other_names,
            req.body.email,
            hash,
        ];



        db.query(sqlQuery, [values], (err, result)=>{
            if(err) return res.json(err);
                return res.status(200).json("Account has been created");
        })

    })

    

}


export const loginTenant = (req, res)=>{

    const sqlQuery = "SELECT * FROM tenants WHERE email = ?";

    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) return res.json({err});

        if(data.length === 0) return res.status(404).json("Account does not exist!")

        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password, 
            data[0].password)

        if(!isPasswordCorrect) 
            return res.status(400).json("Wrong email or password!");

        const token = jwt.sign({id: data[0].id}, "jwt-secret-key");
        const {password, ...other} = data[0];


        res
        .cookie("tenant_access_token", token, {
            httpOnly: true,
            // secure: false
        })
        .status(200)
        .json(other) 

    })


}

export const logoutTenant = (req, res)=>{
    res.clearCookie('tenant_access_token', {

    }).status(200).json("Tenant has been logged out");
}
