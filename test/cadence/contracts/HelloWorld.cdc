access(all) contract HelloWorld{
    access(all) let message: String

    init(){
        log("contract added to account")
        self.message = "Hello, from Cadence"
    }
}
