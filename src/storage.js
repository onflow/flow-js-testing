import {executeScript} from "./interaction"

function reduce(arr) {
  return arr.reduce(nameExtractor, new Set())
}
function nameExtractor(acc, pathStruct) {
  acc.add(pathStruct.identifier)
  return acc
}
export async function getPaths(address) {
  const [result] = await executeScript({
    code: `
      pub struct PathInfo{
        pub let public: [PublicPath]
        pub let private: [PrivatePath]
        pub let storage: [StoragePath]
        
        init(public: [PublicPath], private: [PrivatePath], storage: [StoragePath]){
          self.public = public
          self.private = private
          self.storage = storage
        }
      }
      pub fun main(address: Address): PathInfo{
        let account = getAuthAccount(address)
        let info = PathInfo(
          public: account.publicPaths, 
          private: account.privatePaths, 
          storage: account.storagePaths
        )
        return info
      }
    `,
    args: [address],
  })

  return {
    publicPaths: reduce(result.public),
    privatePaths: reduce(result.private),
    storagePaths: reduce(result.storage),
  }
}

export async function getStorageValue(account, path) {
  let fixedPath = path.startsWith("/") ? path.slice(1) : path
  let storagePath = `/storage/${fixedPath}`
  const args = [account, storagePath]
  const code = `
    import MetadataViews from 0x1
    
    pub fun main(address: Address, path: StoragePath): AnyStruct{
      let account = getAuthAccount(address)
      
      if let valueType = account.type(at: path) {
        if(valueType.isSubtype(of: Type<@AnyResource>())){
          let obj = account.borrow< auth &AnyResource >(from: path)!
          let meta = obj as? &AnyResource{MetadataViews.ResolverCollection}
        
          if let idList = meta?.getIDs(){
            if(idList.length > 0){
              let res: {UInt64: AnyStruct} = {}
            
              for id in idList {
                res[id] = meta!.borrowViewResolver(id: id).resolveView(Type<MetadataViews.Display>())!
              }
              return res
            }
          }
          
          let value = account.borrow< &AnyResource >(from: path)! as AnyStruct
          return value  
        }
        
        let value = account.borrow< &AnyStruct >(from: path)! as AnyStruct
        return value  
      }
      
      return nil
    }
  `
  const [values, error] = await executeScript({code, args})
  return [values, error]
}
