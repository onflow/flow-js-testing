import TestUtilities from 0x01

transaction(offset: UInt64){
    prepare(signer: AuthAccount){
        TestUtilities.setBlockOffset(offset)
    }
}