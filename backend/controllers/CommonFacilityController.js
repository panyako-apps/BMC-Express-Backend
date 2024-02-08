import {db} from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import generateSlug from '../utils/slugify.js'
import jwt from "jsonwebtoken";
import multer from 'multer';
import path from 'path';
import fs from 'fs'
        
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const baseUrl = 'http://localhost:8800';

export const getCommonFacilities = (req, res) => {

    let sqlQuery = "SELECT * FROM common_facilities WHERE 1"

    const queryParams = [];

    if(req.query.company_id){
        sqlQuery +=" AND company_id = ?" 
        queryParams.push(req.query.company_id)
    }


    if(req.query.search !== undefined && req.query.search !== null && req.query.search !==''){
        const searchTerm = `%${req.query?.search.trim()}%`;
        sqlQuery += " AND (common_facilities.name LIKE ? OR common_facilities.description LIKE ?)";
        queryParams.push(searchTerm, searchTerm)
    }

    sqlQuery += " ORDER BY created_at DESC";


    db.query(sqlQuery,queryParams, (err, data)=>{
       
        if(err) return res.json(err)
        
        const facilitiesWithImagePaths = data.map((facility) => ({
            ...facility,
            imagePath: facility.image ? baseUrl + '/storage/common_facility/' + facility.image : null,
        }));

        return res.status(200).json(facilitiesWithImagePaths);

    })
}




const storage = multer.diskStorage({
    destination: function (req, file, callBack) {
        callBack(null, './storage/common_facility'); 
    },
    filename: function (req, file, callBack) {

        const slug = generateSlug(req.body.name);
        const fileName = slug + '-' + Date.now()+ '.' + path.extname(file.originalname).split(".").pop();        
        callBack(null, fileName);


    },
});

const upload = multer({ storage: storage });

    
export const addCommonFacility = (req, res) => {

    const destinationDirectory = './storage/common_facility';

    if (!fs.existsSync(destinationDirectory)) {
        fs.mkdirSync(destinationDirectory, { recursive: true });
    }

    const sqlQuery = 'INSERT INTO common_facilities (`id`, `project_id`, `company_id`, `name`, `description`, `slug`, `image`, `created_at`) VALUES(?)';

    upload.single('image')(req, res, (err) => {
    
        if (err) {
            return res.status(500).json(err);
        }

        const values = [
            uuidv4(),
            req.body.project_id,
            req.body.company_id,
            req.body.name,
            req.body.description,
            generateSlug(req.body.name),
            req.file ? req.file.filename : null,
            new Date()
        ];
    
        db.query(sqlQuery, [values], (err, data) => {
            if (err) {
            return res.status(500).json(err);
            }
            return res.status(200).json('Facility Added Successfully');
        });

    });
};



export const getCommonFacility = (req, res) => {

    const sqlQuery = "SELECT * FROM common_facilities WHERE `id`=?"

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);

        const imagePath = data[0].image ? baseUrl + '/storage/common_facility/' + data[0].image : null;
        const responseData = { ...data[0], imagePath };

        return res.status(200).json(responseData);

    })
}

export const updateCommonFacility = (req, res) => {

    const token = req.cookies.company_access_token;

    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const commonFacilityId = req.params.id;

        const sqlQuery = "UPDATE common_facilities SET `project_id`=?, `name`=?, `description`=? WHERE `id`=? AND `company_id`=? ";

        const values = [
            req.body.project_id,
            req.body.name,
            req.body.description,
        ];
        
        db.query(sqlQuery, [...values, commonFacilityId, userInfo.id], (err, data)=>{
            if(err) return res.status(403).json(err);
            return res.status(200).json("Facility has been updated!")
        })

    })
}


export const deleteCommonFacility = (req, res) => {

    const token = req.cookies.company_access_token;

    if (!token) {
        return res.status(401).json("Not authenticated");
    }

    jwt.verify(token, "jwt-secret-key", (err, userInfo) => {
        if (err) {
            return res.status(403).json("Invalid token");
        }

        const commonFacilityId = req.params.id;
        const getFileNameQuery = "SELECT `image` FROM common_facilities WHERE `id`=? AND `company_id`=?";
        const deleteFacilityQuery = "DELETE FROM common_facilities WHERE `id`=? AND `company_id`=?";


        db.query(getFileNameQuery, [commonFacilityId, userInfo.id], async (err, data)=>{
            if(err) return res.status(500).json(err);
            
            if (data.length > 0) {
                
                const fileName = data[0].image;

                const filePath = fileName ?  path.join(dirname(dirname(fileURLToPath(import.meta.url))), 'storage', 'common_facility',fileName) : null;

                if (fs.existsSync(filePath)) {
                    try {
                        if (fileName !== 'default-image.jpg' || fileName !== null) {
                            fs.unlink(filePath, (err)=>{
                                if(err) {
                                    console.log("Error deleting file:", err)
                                    return res.status(500).json(err);
                                }
                                console.log("File deleted successully")
                            });
                        }
                    } catch (error) {
                        return res.status(500).json(error);
                    }
                } else {
                    console.error('File not found:', filePath);
                }
            }

            db.query(deleteFacilityQuery, [commonFacilityId, userInfo.id], (err, data) => {
                if (err) {
                    return res.status(500).json(err);
                }
                return res.status(200).json("Facility and corresponding image have been deleted!");
            });

        });


    });
};
