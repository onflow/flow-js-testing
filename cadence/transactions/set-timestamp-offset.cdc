import FlowManager from 0x01

transaction(offset: UFix64){
    prepare(signer:AuthAccount){
        FlowManager.setTimestampOffset(offset)
    }
}
