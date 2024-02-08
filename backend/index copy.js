import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// import adminRoutes from './routes/adminRoutes';
// import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "UPDATE", "PATCH"],
    credentials: true,
}));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

const salt = 10;

//Routes 
// app.use('/auth', authRoutes)
// app.use('/administrator', adminRoutes)

const db = mysql.createConnection({
    host: 'localhost',
    user: 'panyako',
    password: 'insync88PX',
    database: 'bmc',
});


app.post('/register', (req, res)=>{

    const sqlQuery = "INSERT INTO users (`id`, `first_name`, `other_names`, `email`, `password`) VALUES(?)";
    
    
    bcrypt.hash(req.body.password.toString(), salt, (err, hash)=>{
        if(err) 
            return res.json({error: "Error for hashing password"});

        const values = [
            uuidv4(),
            req.body.first_name,
            req.body.other_names,
            req.body.email,
            hash,
            
        ];
        
        db.query(sqlQuery, [values], (err, result)=>{
            if(err) return res.json({error: err.message});
                return res.json({status: "success"});
        })


    })
    

})


app.post('/login', (req, res)=>{

    const sqlQuery = "SELECT * FROM users WHERE email = ?";
    
    db.query(sqlQuery, [req.body.email], (err, data)=>{
        if(err) 
            return res.json({error: err.message});

        if(data.length > 0)
        {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response)=>{
                if(err) 
                    return res.json({error: "Password Comparison Error"});
                
                if(response){
                    const name = data[0].name;
                    const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: "1d"});
                    res.cookie('token', token);
                    
                    //session 
                    req.session.user = data[0];
                    return res.json({status: "success", user: req.session.user});
                }
                else
                {
                    return res.json({error: "Password Missmatch"}); 
                }
            })
        }else
        {
            return res.json({error: "Email does not exits"});
        }
    })


})


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.json({error: "You are not authenticated!"});
    }else {
        jwt.verify(token, "jwt-secret-key", (err, decoded)=>{
            if(err) {
                return res.json({error: "Invalid token"});
            } else {
                req.name = decoded.name;
                next();
            }

        })
    }
}

app.get('/admin/dashboard', verifyUser, (req, res)=>{
    return res.json({status: "success", name: req.name});
})

app.post('/admin/logout', (req, res)=>{
    res.clearCookie('token')
    return res.json({status: "success"});
})



app.get('/users', (req, res)=>{
    const sqlQuery = "SELECT * FROM users";
    db.query(sqlQuery, (err, data)=>{
        if(err) 
            return res.json(err);
        
        return res.json(data);
    });
})


app.listen(8081, ()=>{
    console.log("Server is Running...")
})

