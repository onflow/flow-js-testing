access(all) contract Hello{
    access(all) let message: String

    init(){
        self.message = "Hi!"
    }
}
