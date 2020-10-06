access(all) contract HelloWorld {

    init() {
        let message = ["hello cadence"]
        
        self.account.load<[String]>(from: /storage/testTest)
        self.account.save(message,to: /storage/testTest)
        
        self.account.link<&[String]>(/public/testTest, target: /storage/testTest)


        let singleMessage = "THIS IS ME, MARIO" 
        
        self.account.load<String>(from: /storage/singleMessage)
        self.account.save(singleMessage,to: /storage/singleMessage)
        
        self.account.link<&String>(/public/singleMessage, target: /storage/singleMessage)

        log(self.account.address)
    }
}
