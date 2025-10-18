# Pre-Publish Checklist

Complete this checklist before publishing a new version of the consciousness-engine-wasm package.

## 📋 Pre-Release Checks

### Code Quality
- [ ] All unit tests passing (`cargo test --release`)
- [ ] All integration tests passing (`node test-epic9-integration.js`)
- [ ] No compiler warnings (`cargo clippy`)
- [ ] Code formatted with rustfmt (`cargo fmt --check`)
- [ ] No memory leaks detected (test-memory-leaks.js)

### Documentation
- [ ] API_REFERENCE.md is up-to-date
- [ ] CHANGELOG.md has entry for new version
- [ ] README.md reflects current functionality
- [ ] Migration guide includes new features/breaking changes
- [ ] Examples work with latest changes

### Package Configuration
- [ ] package.json version matches Cargo.toml version
- [ ] All necessary files included in "files" array
- [ ] Dependencies are up-to-date and secure
- [ ] License files present (LICENSE-MIT, LICENSE-APACHE)
- [ ] Repository links correct in package.json

### Build Verification
- [ ] Clean build completes successfully (`npm run clean && npm run build`)
- [ ] WASM binary size is acceptable (<250 KB for release)
- [ ] TypeScript definitions generated correctly (pkg/*.d.ts)
- [ ] All exports work in Node.js environment
- [ ] Package works in test project (`npm pack` and test in separate dir)

### Performance Validation
- [ ] Benchmarks show expected performance (cargo bench)
- [ ] No performance regressions vs previous version
- [ ] Memory usage within acceptable limits
- [ ] Batch processing scales linearly

### Git & Version Control
- [ ] Working directory is clean (`git status`)
- [ ] On correct branch (main or es6-module-conversion)
- [ ] All changes committed with clear messages
- [ ] CHANGELOG.md committed
- [ ] Version bump will trigger correct automation

### Release Notes
- [ ] Notable features documented
- [ ] Breaking changes clearly marked
- [ ] Migration path provided for breaking changes
- [ ] Performance improvements quantified
- [ ] Known issues documented

## 🚀 Release Process

### Automated (Recommended)
```bash
# Dry run to verify everything works
node scripts/release.js patch --dry-run

# Actual release (patch/minor/major)
node scripts/release.js patch
```

### Manual Steps (if automation fails)
```bash
# 1. Run tests
npm test

# 2. Clean and build
npm run clean
npm run build

# 3. Bump version (will sync Cargo.toml automatically)
npm version patch  # or minor/major

# 4. Create git tag
git tag -a v0.1.1 -m "Release v0.1.1"

# 5. Publish to npm
npm publish

# 6. Push to GitHub
git push && git push --tags
```

## 🔍 Post-Release Verification

### npm Registry
- [ ] Package appears on npm registry
- [ ] npm page shows correct README
- [ ] All files accessible
- [ ] TypeScript types available

### GitHub
- [ ] Tags pushed correctly
- [ ] Release created with notes
- [ ] Downloads work

### Installation Test
```bash
# Create test project
mkdir test-install && cd test-install
npm init -y
npm install @world-history-sim/consciousness-engine-wasm

# Test basic import
node -e "const engine = require('@world-history-sim/consciousness-engine-wasm'); console.log(engine);"
```

### Documentation
- [ ] npm README matches repository README
- [ ] Links in documentation work
- [ ] Examples can be copy-pasted and run

## 📊 Version Strategy

### Patch (0.1.0 -> 0.1.1)
- Bug fixes
- Documentation updates
- Performance improvements (no API changes)
- Dependency updates

### Minor (0.1.0 -> 0.2.0)
- New features (backwards compatible)
- New API functions
- Enhancements to existing features
- Deprecations (with warnings)

### Major (0.1.0 -> 1.0.0)
- Breaking API changes
- Removed deprecated features
- Architecture changes
- Major performance overhauls

## ⚠️ Rollback Procedure

If something goes wrong after publishing:

### npm unpublish (within 72 hours only)
```bash
npm unpublish @world-history-sim/consciousness-engine-wasm@0.1.1
```

### Deprecate version
```bash
npm deprecate @world-history-sim/consciousness-engine-wasm@0.1.1 "This version has critical issues. Use 0.1.0 instead."
```

### Quick fix and re-publish
```bash
# Fix the issue
npm version patch  # This creates 0.1.2
npm publish
git push && git push --tags
```

## 📞 Emergency Contacts

If critical issues arise after release:
- Create GitHub issue: https://github.com/RobinsonDionte40hz/world-history-sim-engine/issues
- Tag with "critical" and "consciousness-engine-wasm"
- Notify maintainers immediately

## 🔐 Security Checklist

- [ ] No secrets in code or repository
- [ ] Dependencies audited (`cargo audit`, `npm audit`)
- [ ] No known vulnerabilities in WASM binary
- [ ] Console logs removed from production builds
- [ ] Debug features disabled in release builds

## 📝 Notes

- Always test on Windows, macOS, and Linux before release
- Keep CHANGELOG.md updated with every release
- Coordinate with main project releases
- Announce releases in project Discord/Slack/etc.
- Update benchmarks after significant changes

---

**Last Updated**: 2025-01-XX
**Next Review**: Before every release
