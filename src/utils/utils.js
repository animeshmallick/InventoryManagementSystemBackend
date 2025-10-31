class Utils{
    generateProductId(){
        const randonNumber = Math.floor(1000 + Math.random() * 9000);
        return `P${randonNumber}`;
    }
}
module.exports = new Utils();