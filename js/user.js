// user.js

class User {
    constructor(userId, userName, email, profilePictureUrl, role = null) {
        this.userId = userId || null;
        this.userName = userName || null;
        this.email = email || null;
        this.profilePictureUrl = profilePictureUrl || null;
        this.role = role || null;
    }
}

export default User;
