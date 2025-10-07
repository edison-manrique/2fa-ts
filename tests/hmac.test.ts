import { hmacDigest } from "../hmac"

/**
 * Test cases for HMAC implementation
 */

async function runTests() {
  console.log("Testing HMAC implementation...\n")

  try {
    // Test case 1: SHA-1
    console.log("Test 1: SHA-1")
    const key1 = new TextEncoder().encode("key")
    const message1 = new TextEncoder().encode("The quick brown fox jumps over the lazy dog")
    const result1 = await hmacDigest("SHA1", key1, message1)
    const hex1 = Array.from(result1)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    console.log("Result:", hex1)
    console.log("Expected: de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9")
    console.log("Match:", hex1 === "de7c9b85b8b78aa6bc8a7a36f70a90701c9db4d9")
    console.log("")

    // Test case 2: SHA-256
    console.log("Test 2: SHA-256")
    const key2 = new TextEncoder().encode("key")
    const message2 = new TextEncoder().encode("The quick brown fox jumps over the lazy dog")
    const result2 = await hmacDigest("SHA256", key2, message2)
    const hex2 = Array.from(result2)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    console.log("Result:", hex2)
    console.log("Expected: f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8")
    console.log("Match:", hex2 === "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8")
    console.log("")

    // Test case 3: Empty message
    console.log("Test 3: Empty message with SHA-256")
    const key3 = new TextEncoder().encode("key")
    const message3 = new TextEncoder().encode("")
    const result3 = await hmacDigest("SHA256", key3, message3)
    const hex3 = Array.from(result3)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    console.log("Result:", hex3)
    console.log("")

    console.log("All tests completed.")
  } catch (error) {
    console.error("Test failed:", error)
  }
}

// Run tests if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
  runTests()
}

export { runTests }
