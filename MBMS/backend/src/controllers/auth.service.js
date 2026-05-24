//authService 
const db = require("./database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class userService{
    async authUser(email, password){
        
        // 1. Check if user exist
        const user = await db.findUserbyEmail(email);
        if(!user) throw new Error('invalid email or password');

        // 2. verifyPassword:
        const validPassword = await bcrypt.compare(password, user.hashPassword)
        if(!validPassword) throw new Error('invalid email or password');

        // 3. Generate token :
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: "1d"});

        // 4.   return only data donot touch any HTTP or cookie here 
        return {user, token}
    }
}

module.exports = new userService;