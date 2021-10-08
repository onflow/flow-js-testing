import FungibleToken from 0x1

pub contract Greeting{
    pub let message: String

    init(message: String){
        self.message = message
    }
}