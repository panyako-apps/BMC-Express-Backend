import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// import dotenv from 'dotenv'


import AdminRoutes from './routes/AdminRoutes.js';
import AuthRoutes from './routes/AuthRoutes.js';
import CompanyRoutes from './routes/CompanyRoutes.js';
import ProjectRoutes from './routes/ProjectRoutes.js';
import BuildingRoutes from './routes/BuildingRoutes.js';
import TenantRoutes from './routes/TenantRoutes.js';
import BuildingManagerRoutes from './routes/BuildingManagerRoutes.js'
import CommonFacilityRoutes from './routes/CommonFacilityRoutes.js'
import FlatRoutes from './routes/FlatRoutes.js';
import FlatCategoryRoutes from './routes/FlatCategoryRoutes.js';
import ResidentTypeRoutes from './routes/ResidentTypeRoutes.js'
import IssueRoutes from './routes/IssueRoutes.js';
import BookingRoutes from './routes/BookingRoutes.js';
import BillRoutes from './routes/BillRoutes.js';

//Static Files Management
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// dotenv.config();

const app = express();
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "UPDATE", "PATCH", "PUT"],
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

const port = /* process.env.PORT ||  */8800;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Serve static files from the 'storage' directory
app.use('/storage', express.static(join(__dirname, 'storage')));


// Routes 
app.use('/api/auth', AuthRoutes)
app.use('/api/admin', AdminRoutes)
app.use('/api/companies', CompanyRoutes)
app.use('/api/projects', ProjectRoutes)
app.use('/api/buildings', BuildingRoutes)
app.use('/api/building-managers', BuildingManagerRoutes)
app.use('/api/common-facilities', CommonFacilityRoutes)
app.use('/api/flat-categories', FlatCategoryRoutes)
app.use('/api/tenants', TenantRoutes)
app.use('/api/flats', FlatRoutes)
app.use('/api/resident-types', ResidentTypeRoutes)
app.use('/api/issues', IssueRoutes)
app.use('/api/bookings', BookingRoutes)
app.use('/api/bills', BillRoutes)



app.listen(8800, ()=>{
    console.log(`Server is Running... at PORT ${port}`)
})




