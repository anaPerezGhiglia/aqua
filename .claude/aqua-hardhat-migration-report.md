# Aqua — Hardhat 3 Migration Report

**Hardhat version installed:** `^3.1.10`
**Migration date:** 2026-03-03
**Foundry analysis:** [Foundry analysis](aqua-foundry-migration-analysis.md)

---

**Verdict:** 🟡 **Successful with gaps**

### Blockers

None — all 49 tests pass.

### Notable gaps (non-blocking, medium+ impact)

- 🚩 No equivalent for `forge snapshot` — gas snapshot workflow unavailable ([#7769](https://github.com/NomicFoundation/hardhat/issues/7769))

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
| Gas snapshots (`forge snapshot`) | 🚩 **Gap** | **Medium** — `snapshot` script in package.json has no Hardhat equivalent | [#7769](https://github.com/NomicFoundation/hardhat/issues/7769) — no workaround currently |
| `[profile.solx]` (custom compiler binary) | 🚩 **Gap** | **Low** — alternative compiler not available in Hardhat | Foundry-only feature; Hardhat uses solc from npm |
| `[fmt]` (Forge formatter) | 🚩 **Gap** | **Low** — project can use prettier/solhint instead | Foundry-only feature; most projects use prettier for Solidity formatting |
| `@1inch/solidity-utils` exports | 🟡 **Partial** | **Low** — requires patch-package to expose `.sol` files | Patch applied; upstream package needs to add `.sol` exports to `exports` field |

### Full parity

These features work equivalently in Hardhat 3:

- Solidity compilation (`forge build` → `npx hardhat compile`)
- Solidity compiler settings (solc 0.8.30, optimizer with 10M runs, viaIR)
- forge-std cheatcodes (`vm.*`) — all used cheatcodes work correctly
- Fuzz testing (`testFuzz_*` — 256 runs)
- `fsPermissions` (read-write access to `./deployments` and `./config`)
- Remappings (`remappings.txt` loaded automatically)
- npm dependency resolution (forge-std, @openzeppelin/contracts, @1inch/solidity-utils)

**Features not used by this project:**
- Network configuration / forking — no `[rpc_endpoints]` in foundry.toml
- Contract verification — no `[etherscan]` section
- Invariant testing — no invariant tests in codebase
- FFI — not enabled
- Deployment scripts (`forge script` / `.s.sol`) — project has `script/DeployAquaRouter.s.sol` but deployment scripts are Foundry-specific and not covered by Hardhat's Solidity test runner

## 3. Hardhat / EDR Bug Reports

No bugs found. All tests pass without behavioral differences.

## 4. Workarounds Applied

1. **`patch-package` for `@1inch/solidity-utils`** — The package's `exports` field in `package.json` only exposes JS/TS entry points, not `.sol` contract files. Hardhat 3 respects Node.js `exports` resolution, causing `HHE902` errors. Patch adds `./contracts/*.sol`, `./contracts/libraries/*.sol`, `./contracts/mixins/*.sol`, and `./contracts/interfaces/*.sol` to the exports. Patch file: `patches/@1inch+solidity-utils+6.9.2.patch`.

2. **Absolute import rewrites** — 15 absolute imports across 8 files converted to relative paths:
   - `test/AquaEvents.t.sol` — `src/interfaces/IAqua.sol` → `../src/interfaces/IAqua.sol`
   - `test/AquaBalances.t.sol` — same
   - `test/AquaPushPull.t.sol` — same
   - `test/AquaLifecycle.t.sol` — same
   - `test/AquaShipDock.t.sol` — same
   - `test/base/AquaTestBase.sol` — `src/Aqua.sol` and `src/interfaces/IAqua.sol` → `../../src/...`
   - `examples/test/XYCNestedSwaps.t.sol` — `test/utils/Dynamic.sol`, `src/Aqua.sol`, `src/AquaApp.sol`, `examples/apps/XYCSwap.sol` → relative paths
   - `examples/test/XYCSwap.t.sol` — same

3. **ESM mode** — Added `"type": "module"` to `package.json` (required by Hardhat 3). No existing CommonJS files were broken.

## 5. Next Steps

1. **File upstream issue for `@1inch/solidity-utils` exports** — Request the package maintainers add `.sol` file exports to their `package.json` `exports` field, eliminating the need for `patch-package`. Impact: removes a build-time workaround.

2. **Monitor gas snapshot support** — Track [#7769](https://github.com/NomicFoundation/hardhat/issues/7769) for `forge snapshot` equivalent. Impact: the `snapshot` script in package.json currently has no Hardhat alternative.

3. **Consider running `examples/test/` tests** — The 26 test functions in `examples/test/` are not included in the default test run. If desired, configure a separate test path or move them into `test/`.
