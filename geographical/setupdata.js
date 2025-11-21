const fs = require('fs')

const baseurl = "https://kenya-api.onrender.com/api/v1/"

const checkApiHealth = async () => {
    const res = await  fetch(`${baseurl}health`)

    const data = await res.json()
}


const fetchCounties = async () => {}

const fetchSubCounties = async (county=null)=>{}

const fetchWards = async (subcounty = null) => {}