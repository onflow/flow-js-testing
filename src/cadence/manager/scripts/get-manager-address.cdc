pub fun main(serviceAddress: Address): Address? {
    let account = getAccount(serviceAddress)
    let ref = account
            .getCapability(/public/flowManagerAddress)
            .borrow<&[Address]>()!

    return ref[0]
}
 