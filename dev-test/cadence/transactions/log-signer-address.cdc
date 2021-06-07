transaction{
  prepare(signer: AuthAccount){
    log("Signer Address:".concat(signer.address.toString()))
  }
}