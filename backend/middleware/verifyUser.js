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