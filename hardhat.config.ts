import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: {
    compilers: [
      {
        version: "0.8.30",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10_000_000,
          },
          viaIR: true,
          // evmVersion not explicitly set in foundry.toml — Forge auto-detects latest supported by solc.
          // solc 0.8.30 defaults to a recent EVM version; leaving it to solc default here as well.
        },
      },
    ],
  },

  paths: {
    // Forge default is "src", Hardhat default is "./contracts" — must set explicitly
    sources: "./src",
    tests: "./test",
  },

  test: {
    solidity: {
      // fs_permissions from foundry.toml: read-write ./deployments, read-write ./config
      fsPermissions: {
        dangerouslyReadWriteDirectory: ["./deployments", "./config"],
      },
    },
  },

  // --- Foundry-only settings (no Hardhat equivalent) ---

  // [profile.ci] — identical to [profile.default], no separate build profile needed.

  // [profile.solx] — uses a custom solx binary (`solc = "~/.local/bin/solx"`). Foundry-only.

  // [fmt] — Foundry formatter config. Projects typically use prettier or solhint instead.

  // `libs = ["node_modules", "lib"]` — Hardhat auto-resolves via remappings.txt and node_modules.

  // `out = "out"` — Hardhat uses its own artifacts/ + cache/ directories.

  // `forge snapshot` — Not supported. See: https://github.com/NomicFoundation/hardhat/issues/7769
});
