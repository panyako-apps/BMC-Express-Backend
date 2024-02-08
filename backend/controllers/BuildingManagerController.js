import {db} from '../db.js'
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from 'uuid'
import bcrypt from 'bcryptjs'


export const getBuildingManagers = (req, res) => {

    let sqlQuery = `
        SELECT building_managers.*, JSON_ARRAYAGG(JSON_OBJECT('id', buildings.id, 'name', buildings.name)) AS buildings
        FROM building_managers
        LEFT JOIN building_building_manager ON building_managers.id = building_building_manager.building_manager_id
        LEFT JOIN buildings ON building_building_manager.building_id = buildings.id
        WHERE 1
    `;
    
    const queryParams = [];
  
    if (req.query.company_id) {
      sqlQuery += " AND building_managers.company_id = ?";
      queryParams.push(req.query.company_id);
    }
  
    if (req.query.search !== undefined && req.query.search !== null && req.query.search !== '') {
      const searchTerm = `%${req.query?.search.trim()}%`;
      sqlQuery += " AND (building_managers.first_name LIKE ? OR building_managers.other_names LIKE ?)";
      queryParams.push(searchTerm, searchTerm);
    }
  
    sqlQuery += " GROUP BY building_managers.id ORDER BY building_managers.created_at DESC";
  
    db.query(sqlQuery, queryParams, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);
    });


  };

  


export const addBuildingManager = (req, res) => {

    const checkBuildingManagerQuery = "SELECT * FROM building_managers WHERE email = ?";
    const insertBuildingManagerQuery = "INSERT INTO building_managers (`id`, `company_id`, `first_name`, `other_names`, `email`, `password`, `created_at`) VALUES(?)";
    const updateBuildingManagersQuery = 'INSERT INTO building_building_manager (`building_id`, `building_manager_id`) VALUES ?';


    db.query(checkBuildingManagerQuery, [req.body.email], (err, data)=>{
        if(err) return res.json(err)
        if (data.length) return res.status(409).json("User already exists");

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const userId = uuidv4();

        const values = [
            userId,
            req.body.company_id,
            req.body.first_name,
            req.body.other_names,
            req.body.email,
            hash,
            new Date()
        ];


        const buildingIds = req.body.building_ids;


        db.query(insertBuildingManagerQuery, [values], (err, result)=>{
            if(err) return res.json(err);

                const updateValues = buildingIds.map((buildingId) => [buildingId, userId]);

                db.query(updateBuildingManagersQuery, [updateValues], (err) => {
                    if (err) return res.json(err);
                    return res.status(200).json("Account has been created successfully");
                });

        })

    })

}

export const getBuildingManager = (req, res) => {

    let sqlQuery = `
        SELECT building_managers.*, JSON_ARRAYAGG(JSON_OBJECT('id', buildings.id, 'name', buildings.name)) AS buildings
        FROM building_managers
        LEFT JOIN building_building_manager ON building_managers.id = building_building_manager.building_manager_id
        LEFT JOIN buildings ON building_building_manager.building_id = buildings.id
        WHERE building_managers.id=?
    `;

    db.query(sqlQuery, [req.params.id], (err, data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data[0]);
    })
}




export const updateBuildingManager = (req, res) => {
    
    const token = req.cookies.company_access_token;
    if (!token) res.status(401).json("Not authenticated");
  
    jwt.verify(token, "jwt-secret-key", (err, userInfo) => {
      if (err) res.status(403).json("Invalid token");
  
      const buildingManagerId = req.params.id;
  
      const updateBuildingManagersQuery = 'UPDATE building_managers SET `first_name`=?, `other_names`=? WHERE `id`=?';
      const deleteBuildingManagerBuildingsQuery = 'DELETE FROM building_building_manager WHERE `building_manager_id`=?';
      const insertBuildingManagerBuildingsQuery = 'INSERT INTO building_building_manager (`building_id`, `building_manager_id`) VALUES ?';
  
      const values = [
        req.body.first_name,
        req.body.other_names,
        buildingManagerId,
      ];
  
      const buildingIds = req.body.building_ids || [];
  
      db.beginTransaction((err) => {
        if (err) return res.status(403).json(err);
  
        db.query(updateBuildingManagersQuery, values, (err, data) => {
          if (err) return db.rollback(() => res.status(403).json(err));
  
          db.query(deleteBuildingManagerBuildingsQuery, [buildingManagerId], (err) => {
            if (err) return db.rollback(() => res.status(403).json(err));
  
            const insertValues = buildingIds.map((buildingId) => [buildingId, buildingManagerId]);
  
            db.query(insertBuildingManagerBuildingsQuery, [insertValues], (err) => {
              if (err) return db.rollback(() => res.status(403).json(err));
  
              db.commit((err) => {
                if (err) return db.rollback(() => res.status(403).json(err));
  
                return res.status(200).json("Manager info has been updated!");
              });
            });
          });

          
        });
      });
    });
  };
  




export const deleteBuildingManager = (req, res) => {

    const token = req.cookies.company_access_token
    if(!token) res.status(401).json("Not authenticated")

    jwt.verify(token, "jwt-secret-key", (err, userInfo)=>{
        if(err) res.status(403).json("Invalid token")

        const buildingManagerId = req.params.id;
        const sqlQuery = "DELETE FROM building_managers WHERE `id`=?";

        db.query(sqlQuery, [buildingManagerId], (err, data)=>{
            if(err) return res.status(403).json("Action not allowed!");
            return res.status(200).json("Manager has been deleted!")
        })

    })
}