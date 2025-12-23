class ApiResqonse {
    constructor(statusCode, data = null, message = "success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode<400;
        
    }
}
export default ApiResqonse;