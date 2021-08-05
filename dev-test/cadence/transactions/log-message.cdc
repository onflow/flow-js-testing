transaction(message:String){
    prepare(signer: AuthAccount){
        log(message)
    }
}