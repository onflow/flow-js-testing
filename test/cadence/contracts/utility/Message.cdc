access(all) contract Message{
    access(all) let data: String

    init(){
        self.data = "This is Message contract"
    }
}
