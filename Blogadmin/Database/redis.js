let redis = require('redis'),
    RDS_PORT = 6379,
    RDS_HOST = '127.0.0.1',
    RDS_PWD = 'W-qh',
    RDS_OPTS = {},
    client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

client.auth(RDS_PWD, () => {
    console.log("通过认证")
})
client.on('ready', (err) => {
    console.log('ready')
});
module.exports = client;



