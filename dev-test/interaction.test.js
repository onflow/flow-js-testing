/* eslint-disable jest/expect-expect */
import {config} from "@onflow/fcl"
import path from "path"
import {
  emulator,
  init,
  sendTransaction,
  executeScript,
  getAccountAddress,
  shallResolve,
  shallThrow,
  shallPass,
} from "../src"
import {createAccount} from "../src/account"
import {HashAlgorithm, pubFlowKey, SignatureAlgorithm} from "../src/crypto"
import {permute} from "./util/permute"

// We need to set timeout for a higher number, cause some transactions might take up some time
jest.setTimeout(10000)

describe("interactions - sendTransaction", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("sendTransaction - shall throw  when no code and name provided", async () => {
    await shallThrow(async () => {
      return sendTransaction({})
    })
  })

  test("sendTransaction - shall pass with name provided", async () => {
    await shallPass(async () => {
      const name = "log-signer-address"
      return sendTransaction({name})
    })
  })

  test("sendTransaction - shall pass with name passed directly", async () => {
    await shallPass(async () => {
      return sendTransaction("log-signer-address")
    })
  })

  test("sendTransaction - shall pass with code provided", async () => {
    await shallPass(async () => {
      const code = `
        transaction{
          prepare(signer: AuthAccount){
            log(signer.address)
          }
        }
      `
      return sendTransaction({code})
    })
  })

  test("sendTransaction - shall pass with signer address", async () => {
    const Alice = await getAccountAddress("Alice")

    const code = `
      transaction{
        prepare(signer: AuthAccount){
          assert(signer.address == ${Alice}, message: "Signer address must be equal to Alice's Address")
        }
      }
    `
    const signers = [Alice]

    await shallPass(sendTransaction({code, signers}))
  })

  test("sendTransaction - shall pass with signer object using default private key", async () => {
    const Alice = await getAccountAddress("Alice")

    const code = `
      transaction{
        prepare(signer: AuthAccount){
          assert(signer.address == ${Alice}, message: "Signer address must be equal to Alice's Address")
        }
      }
    `
    const signers = [
      {
        addr: Alice,
        keyId: 0,
      },
    ]

    await shallPass(sendTransaction({code, signers}))
  })

  test("sendTransaction - shall pass with signer object using custom private key", async () => {
    const Alice = await getAccountAddress("Alice")

    const code = `
      transaction{
        prepare(signer: AuthAccount){
          assert(signer.address == ${Alice}, message: "Signer address must be equal to Alice's Address")
        }
      }
    `
    const signers = [
      {
        addr: Alice,
        keyId: 0,
        privateKey: await config().get("PRIVATE_KEY"),
      },
    ]

    await shallPass(sendTransaction({code, signers}))
  })

  test.each(
    permute(Object.keys(HashAlgorithm), Object.keys(SignatureAlgorithm))
  )(
    "sendTransaction - shall pass with custom signer - %s hash algorithm, %s signature algorithm",
    async (hashAlgorithm, signatureAlgorithm) => {
      const privateKey = "1234"
      const Adam = await createAccount({
        name: "Adam",
        keys: [
          await pubFlowKey({
            privateKey,
            hashAlgorithm,
            signatureAlgorithm,
            weight: 1000,
          }),
        ],
      })

      const code = `
        transaction{
          prepare(signer: AuthAccount){
            assert(signer.address == ${Adam}, message: "Signer address must be equal to Adam's Address")
          }
        }
      `
      const signers = [
        {
          addr: Adam,
          keyId: 0,
          privateKey,
          hashAlgorithm,
          signatureAlgorithm,
        },
      ]

      await shallPass(sendTransaction({code, signers}))
    }
  )

  test("sendTransaction - shall pass with custom signer - hashAlgorithm, signatureAlgorithm resolved via string - pubKey resolved via privKey", async () => {
    const hashAlgorithm = "ShA3_256" //varying caps to test case insensitivity
    const signatureAlgorithm = "eCdSA_P256"

    const privateKey = "1234"
    const Adam = await createAccount({
      name: "Adam",
      keys: [
        {
          privateKey,
          hashAlgorithm,
          signatureAlgorithm,
          weight: 1000,
        },
      ],
    })

    const code = `
        transaction{
          prepare(signer: AuthAccount){
            assert(signer.address == ${Adam}, message: "Signer address must be equal to Adam's Address")
          }
        }
      `
    const signers = [
      {
        addr: Adam,
        keyId: 0,
        privateKey,
        hashAlgorithm,
        signatureAlgorithm,
      },
    ]

    await shallPass(sendTransaction({code, signers}))
  })

  test("sendTransaction - argument mapper - basic", async () => {
    await shallPass(async () => {
      const code = `
        transaction(a: Int){
          prepare(signer: AuthAccount){
            log(signer.address)
          }
        }
      `
      const args = [42]
      return sendTransaction({code, args})
    })
  })

  test("sendTransaction - argument mapper - multiple", async () => {
    await shallPass(async () => {
      const code = `
        transaction(a: Int, b: Int, name: String){
          prepare(signer: AuthAccount){
            log(signer.address)
          }
        }
      `
      const args = [42, 1337, "Hello, Cadence"]
      return sendTransaction({code, args})
    })
  })

  test("sendTransaction - argument mapper - automatic", async () => {
    await shallPass(async () => {
      const code = `
        transaction(a: Int, b: Int, name: String){
          prepare(signer: AuthAccount){
            log(signer.address)
          }
        }
      `
      const args = [42, 1337, "Hello, Cadence"]
      return sendTransaction({code, args})
    })
  })

  test("sendTransaction - short notation, no signers", async () => {
    emulator.setLogging(true)
    await shallPass(async () => {
      return sendTransaction("log-signer-address")
    })
  })

  test("sendTransaction - short notation, Alice signed", async () => {
    emulator.setLogging(true)
    await shallPass(async () => {
      const Alice = await getAccountAddress("Alice")
      const signers = [Alice]
      return sendTransaction("log-signer-address", signers)
    })
  })

  test("sendTransaction - short notation, Alice signed, with args", async () => {
    emulator.setLogging(true)
    await shallPass(async () => {
      const args = ["Hello, from Cadence!"]
      const Alice = await getAccountAddress("Alice")
      const signers = [Alice]
      return sendTransaction("log-message", signers, args)
    })
  })
})

describe("interactions - executeScript", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "./cadence")
    await init(basePath)
    return emulator.start()
  })

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop()
  })

  test("executeScript - shall throw  when no code and name provided", async () => {
    shallThrow(async () => {
      return executeScript({})
    })
  })

  test("executeScript - shall pass with name provided", async () => {
    await shallResolve(async () => {
      const name = "log-message"
      return executeScript({name})
    })
  })

  test("executeScript - shall pass with code provided", async () => {
    await shallResolve(async () => {
      const code = `
        pub fun main(){
            log("hello from cadence")
        }
      `
      return executeScript({code})
    })
  })

  test("executeScript - shall pass with short notation", async () => {
    const [result, err] = await shallResolve(executeScript("log-message"))
    expect(err).toBe(null)
    expect(result).toBe("42")
  })

  test("executeScript - shall pass with short notation and arguments", async () => {
    const message = "Hello, from Cadence!"
    const [result, err] = await shallResolve(() => {
      const args = [message]
      return executeScript("log-passed-message", args)
    })
    expect(err).toBe(null)
    expect(result).toBe(message)
  })

  test("executeScript - shall work properly for empty array as argument", async () => {
    const [result, err] = await shallResolve(async () => {
      const code = `
      pub fun main(data: [String]): [String]{
        log(data)
        return data
      }
    `
      const args = [[]]
      return executeScript({code, args})
    })
    expect(err).toBe(null)
    expect(result.length).toBe(0)
  })
})
