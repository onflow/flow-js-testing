pub contract HelloWorld{
    pub let message: String

    init(){
        log("contract added to account")
        self.message = "Hello, from Cadence"
    }
}