transaction{
  prepare(signer: &Account){
    log("Signer Address:".concat(signer.address.toString()))
  }
}
