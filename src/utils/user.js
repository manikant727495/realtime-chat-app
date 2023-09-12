let users = [];

const addUser = ({id,username,room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!room || !username) {
        return {
            error: "Cannot have null value in id, room, username",
        };
    }

    const existingUser = users.find((user) => {
        return user.username === username && user.room === room;
    });

    if (existingUser) {
        return {
            error: "Username already exists",
        };
    }

    const user = { id, username, room };
    users.push(user);
    return {user};
};


const removeUser = (id)=>{
    if(!id){
        return{
            error:"id cannot be empty"
        }
    }
    const index = users.findIndex((user) =>{
        return user.id === id ;
    })
    if(index !== -1){
        return users.splice(index,1)[0];
    }

}

const getUser = (id)=>{
    return users.find(user=>{
       return user.id  === id
    })
}

const getUsersInRoom = (room)=>{
    if(!room){
        return;
    }
    room = room.trim().toLowerCase();
    return users.filter(user=>{
        return user.room === room
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}