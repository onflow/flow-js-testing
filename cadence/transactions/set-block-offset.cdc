import FlowManager from 0x01

transaction(offset: UInt64){
    prepare(signer: &Account){
        FlowManager.setBlockOffset(offset)
    }
}
