# Aqua — Foundry Migration Analysis

## foundry.toml Settings

### `[profile.default]`
| Setting | Value |
|---|---|
| `solc` | `0.8.30` |
| `optimizer` | `true` |
| `optimizer_runs` | `10_000_000` |
| `via_ir` | `true` |
| `libs` | `["node_modules", "lib"]` |
| `fs_permissions` | read-write `./deployments`, read-write `./config` |

### `[profile.ci]`
Identical to `[profile.default]` — same compiler settings, same fs_permissions. No additional test overrides (no fuzz/invariant changes).

### `[profile.solx]`
| Setting | Value |
|---|---|
| `solc` | `~/.local/bin/solx` (custom compiler binary) |

### `[fmt]`
| Setting | Value |
|---|---|
| `single_line_statement_blocks` | `multi` |
| `multiline_func_header` | `all` |
| `override_spacing` | `false` |
| `bracket_spacing` | `true` |
| `int_types` | `long` |
| `number_underscore` | `thousands` |

## Remappings (`remappings.txt`)
```
forge-std/=node_modules/forge-std/src/
@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/
@1inch/solidity-utils/=node_modules/@1inch/solidity-utils/
```

## Git Submodules
None — no `.gitmodules`, no `lib/` directory. All dependencies are via npm/yarn.

## Directory Structure
- **Source:** `src/` (Aqua.sol, AquaApp.sol, AquaRouter.sol, interfaces/, libs/)
- **Test:** `test/` (6 test files: AquaBalances, AquaEvents, AquaLifecycle, AquaPushPull, AquaShipDock, AquaStorageTest + base/ + mock/ + utils/)
- **Script:** `script/` (DeployAquaRouter.s.sol)
- **Examples:** `examples/` (apps/, test/ — contains XYCSwap.t.sol, XYCNestedSwaps.t.sol)

## Test Count
- `test/*.t.sol`: 49 test functions (9+5+2+10+15+8)
- `examples/test/*.t.sol`: 26 test functions (22+4)
- **Total: 75 test functions**

## Absolute Imports
7 files contain absolute imports (using `src/` and `test/` prefixes):
- `test/AquaEvents.t.sol` — `src/interfaces/IAqua.sol`
- `test/AquaBalances.t.sol` — `src/interfaces/IAqua.sol`
- `test/AquaPushPull.t.sol` — `src/interfaces/IAqua.sol`
- `test/AquaLifecycle.t.sol` — `src/interfaces/IAqua.sol`
- `test/AquaShipDock.t.sol` — `src/interfaces/IAqua.sol`
- `test/base/AquaTestBase.sol` — `src/Aqua.sol`, `src/interfaces/IAqua.sol`
- `examples/test/XYCNestedSwaps.t.sol` — `test/utils/Dynamic.sol`, `src/Aqua.sol`, `src/AquaApp.sol`
- `examples/test/XYCSwap.t.sol` — `test/utils/Dynamic.sol`, `src/Aqua.sol`, `src/AquaApp.sol`

Decision: 8 files → convert to relative imports.

## Inline Test Config (`forge-config:`)
None found.

## Package Manager
**yarn** — `yarn.lock` exists (4203 lines). No other lockfiles.

## Forge-dependent `package.json` Scripts
| Script | Command |
|---|---|
| `test` | `forge test` |
| `snapshot` | `forge snapshot --no-match-test "testFuzz_*"` |

## npm Package Exports
- `@1inch/solidity-utils` — has `exports` field but includes `./contracts/*.sol` patterns. Should work.
- `forge-std` — no `exports` field. Hardhat has built-in allowlist for it.
- `@openzeppelin/contracts` — no `exports` field. No issues.

## Notable Patterns
- `via_ir = true` — all profiles use IR pipeline
- `optimizer_runs = 10_000_000` — very high optimization for deployment
- `[profile.ci]` is identical to default — no build profile needed for it
- `[profile.solx]` uses a custom compiler binary — Foundry-only, no Hardhat equivalent
- `[fmt]` section — Foundry-only formatter config (projects typically use prettier)
- Deployment scripts (`script/`) use Forge script format
