const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Filter = require('bad-words');
const {generateMessage,locationMessage} = require('./utils/messages')
const {addUser,getUser,removeUser,getUsersInRoom} = require('./utils/user')

const app = express();
const server = http.createServer(app);
io = socketIo(server);

const port = process.env.port  || 3000;

const staticPath = path.join(__dirname,'../public');

app.use(express.static(staticPath));

let message = "welcome!"
io.on('connection', (socket)=>{

    socket.on('join', (options, callback) => {
        const  { error, user}  = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        const users = getUsersInRoom(user.room);
        const room = user.room;
        io.to(user.room).emit('changeRoomData',{room:user.room,users});

        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('profinity is not allowed');
        }
        const user = getUser(socket.id);

        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback("delivered")
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        let Location = `https://google.com/maps?q=${location.lattitude},${location.longitude}`;
        io.to(user.room).emit('locationMessage', locationMessage(user.username,Location));
        
        // Check if callback is a function before invoking it
        if (typeof callback === 'function') {
            callback();
        }
    });
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`));
            const users = getUsersInRoom();
            io.to(user.room).emit('changeRoomData',{room:user.room,users});
        }
    })
})

server.listen(port,()=>{
    console.log(`server started at port ${port}`);
});