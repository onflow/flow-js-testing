transaction(message:String){
    prepare(signer: &Account){
        log(message)
    }
}
