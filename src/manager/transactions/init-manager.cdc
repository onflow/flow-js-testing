transaction ( code: String ) {
    prepare( admin: AuthAccount) {
        admin.contracts.add(
           name: "FlowManager",
           code: code.decodeHex(),
        )
   }
}
