
const generateMessage = (username,text)=>{
    return {
        username,
        text,
        createdAt:Date.now()
    }
}

const locationMessage = (username,url)=>{
    return{
        username,
        url,
        createdAt:Date.now()
    }
}

module.exports = {
    generateMessage,
    locationMessage
}