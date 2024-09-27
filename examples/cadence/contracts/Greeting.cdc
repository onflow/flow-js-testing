import FungibleToken from 0x1

access(all) contract Greeting{
    access(all) let message: String

    init(message: String){
        self.message = message
    }
}
