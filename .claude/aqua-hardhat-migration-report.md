# Aqua — Hardhat 3 Migration Report

**Hardhat version installed:** `^3.3.0`
**Migration date:** 2026-04-06
**Foundry analysis:** [Foundry analysis](aqua-foundry-migration-analysis.md)

---

**Verdict:** 🟡 **Successful with gaps**

### Blockers

None — all 49 tests pass.

---

## 1. Test Count Comparison

| Metric | Count |
|---|---|
| `function test*` declarations in `test/*.t.sol` | 49 |
| Tests Hardhat ran | 49 |
| Discrepancy | **0** |

The `examples/test/` directory contains 26 additional test functions, but these are outside the configured test directory (`test/`) in both Foundry and Hardhat configurations.

## 2. Feature Parity

### Gaps, bugs & partial support

| Feature | Parity | Impact | Workaround / Notes |
|---|---|---|---|
| Deployment scripting | 🚩 **Gap** | **Low** — `script/DeployAquaRouter.s.sol` exists but is not part of the test suite | Foundry-specific (`forge script` / `vm.startBroadcast()`); Hardhat Ignition is the HH3 alternative but requires a rewrite |
| `[profile.solx]` | 🚩 **Gap** | **Low** — alternative compiler not available in Hardhat | Foundry-only feature; Hardhat uses solc from npm |
| Built-in formatter | 🟡 **Partial** | **Low** — `forge fmt` works standalone regardless of build tool; `prettier-plugin-solidity` is a mature alternative | `[fmt]` config is Foundry-only but formatting workflow is not blocked |
| `@1inch/solidity-utils` exports | 🟡 **Partial** | **Low** — requires patch-package to expose `.sol` files | Patch applied; upstream package needs to add `.sol` exports to `exports` field |

### Full parity

These features work equivalently in Hardhat 3:

- Solidity compilation (`forge build` → `npx hardhat compile`)
- Solidity compiler settings (solc 0.8.30, optimizer with 10M runs, viaIR)
- forge-std cheatcodes (`vm.*`) — all used cheatcodes work correctly
- Fuzz testing (`testFuzz_*` — 256 runs default)
- Gas snapshots (`forge snapshot` → Hardhat 3.3.0 built-in support)
- `fsPermissions` (read-write access to `./deployments` and `./config`)
- Remappings (`remappings.txt` loaded automatically)
- npm dependency resolution (forge-std, @openzeppelin/contracts, @1inch/solidity-utils)

**Features not used by this project:**

- Network configuration / forking — no `[rpc_endpoints]` in foundry.toml
- Etherscan verification — no `[etherscan]` section
- Invariant testing — no invariant tests in codebase
- FFI — not enabled
- Inline test config — no `forge-config:` comments in test files

## 3. Workarounds Applied

1. **`patch-package` for `@1inch/solidity-utils`** — The package's `exports` field in `package.json` only exposes JS/TS entry points, not `.sol` contract files. Hardhat 3 respects Node.js `exports` resolution, causing `HHE902` errors. In Forge, the remapping `@1inch/solidity-utils/=node_modules/@1inch/solidity-utils/` bypasses `exports` entirely since Forge uses its own resolution (not Node.js module resolution). Patch adds `./contracts/*.sol`, `./contracts/libraries/*.sol`, `./contracts/mixins/*.sol`, and `./contracts/interfaces/*.sol` to the exports. Patch file: `patches/@1inch+solidity-utils+6.9.2.patch`.

2. **Absolute import rewrites** — 15 absolute imports across 8 files converted to relative paths. Forge resolves `src/` and `test/` as absolute prefixes via `libs` config; Hardhat 3 requires relative or npm-style imports. Files modified: `test/AquaEvents.t.sol`, `test/AquaBalances.t.sol`, `test/AquaPushPull.t.sol`, `test/AquaLifecycle.t.sol`, `test/AquaShipDock.t.sol`, `test/base/AquaTestBase.sol`, `examples/test/XYCNestedSwaps.t.sol`, `examples/test/XYCSwap.t.sol`.

3. **ESM mode** — `"type": "module"` set in `package.json` (required by Hardhat 3). No existing CommonJS files were broken.

## 4. Next Steps

1. **File upstream issue for `@1inch/solidity-utils` exports** — Request the package maintainers add `.sol` file exports to their `package.json` `exports` field, eliminating the need for `patch-package`. Impact: removes a build-time workaround.

2. **Add Hardhat gas snapshot script** — Gas snapshots are now supported in Hardhat 3.3.0. Add a `"snapshot-hardhat"` script to `package.json` alongside the existing `"snapshot": "forge snapshot ..."`.

3. **Consider running `examples/test/` tests** — The 26 test functions in `examples/test/` are not included in the default test run. If desired, configure a separate test path or move them into `test/`.
