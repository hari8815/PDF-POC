
var config  = {}

config.sf_tokenUrl = 'https://login.salesforce.com/services/oauth2/token'

config.sf_token_gen_option = {
    uri: config.sf_tokenUrl,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }, 
    form: {
        'grant_type': 'password',
        'client_id': process.env.SF_CLIENT_ID,
        'client_secret': process.env.SF_CLIENT_SECRET,
        'username': process.env.SF_USERNAME,
        'password': process.env.SF_PASSWORD
    }
}

module.exports = config;