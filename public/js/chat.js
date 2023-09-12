const socket = io();

const messageForm = document.getElementById('message-form');
const messageFormInput = document.getElementById('messageinput');
const messageFormButton = document.getElementById('submit-button');
const sendLocationButton = document.getElementById('sendlocation');
const messageDiv = document.getElementById('messages');
const {username,room} = Qs.parse(location.search,{'ignoreQueryPrefix' : true});

const autoScroll = () => {
    const newMessage = messageDiv.lastElementChild;

    if (newMessage) {
        const newMessageStyles = getComputedStyle(newMessage);
        const newMessageMargin = parseInt(newMessageStyles.marginBottom);
        const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

        const visibleHeight = messageDiv.offsetHeight;

        const containerHeight = messageDiv.scrollHeight;

        const scrollOffset = messageDiv.scrollTop + visibleHeight;

        if (containerHeight - newMessageHeight <= scrollOffset) {
            messageDiv.scrollTop = messageDiv.scrollHeight;
        }
    }
};


messageForm.addEventListener('submit',(e)=>{
    messageFormButton.setAttribute('disabled','disabled');
    e.preventDefault();
    let message = messageFormInput.value;
    socket.emit("sendMessage",message, (data)=>{
        messageFormButton.removeAttribute('disabled');
        messageFormInput.value = '';
        messageFormInput.focus();
    });
})

sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        console.log("your browser doesn't support geo location")
    } else{
        sendLocationButton.setAttribute('disabled','disabled');
        navigator.geolocation.getCurrentPosition((position)=>{
            console.log(position);
            let location ={
                longitude : position.coords.longitude,
                lattitude : position.coords.latitude
            }
            socket.emit('sendLocation',location,()=>{
                sendLocationButton.removeAttribute('disabled');
                console.log("location shared");
            })
        });
    }
})

socket.on("message",(message)=>{
    const messageTemplate = document.getElementById('message-template').innerHTML;
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mma')

    });
    messageDiv.insertAdjacentHTML('beforeend',html);
    autoScroll();
    console.log(message);
})

socket.on('locationMessage',(location)=>{
    const locationTemplate = document.getElementById('location-template').innerHTML;
    const html = Mustache.render(locationTemplate,{
        username:location.username,
        url:location.url,
        createdAt:moment(location.createdAt).format('h:mma')
    });
    messageDiv.insertAdjacentHTML("beforeend",html);
    autoScroll();
    console.log(location)
})

socket.on('changeRoomData',({room,users})=>{
    const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html;

});

socket.emit('join',({username,room}),(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
});