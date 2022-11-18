const env = process.env;

module.exports = {
    port: env.port || env.PORT || 8000,
}