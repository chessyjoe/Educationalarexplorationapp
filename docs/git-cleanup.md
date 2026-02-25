# Git Cleanup Guide: Removing Sensitive Files

## ✅ Step 1: Stop Tracking Files (COMPLETED)

The following files have been removed from Git tracking:
- `.env` - Frontend environment variables
- Updated `.gitignore` to prevent future tracking

**Committed**: Stop tracking .env files and add comprehensive .gitignore

---

## 🔄 Step 2: Rewrite Git History (OPTIONAL BUT RECOMMENDED)

### Why Rewrite History?

Even though we stopped tracking `.env`, it still exists in previous commits. Anyone with access to the repository history can see old API keys and credentials.

### ⚠️ Important Warnings

- **This rewrites git history** - requires force push
- **Coordinate with team** - everyone needs to re-clone
- **Backup first** - create a backup branch before proceeding
- **Not reversible** - once pushed, old history is gone

### Option A: Using git-filter-repo (Recommended)

**Install git-filter-repo**:
```bash
pip install git-filter-repo
```

**Remove .env from all history**:
```bash
# Backup current branch
git branch backup-main

# Remove .env from all commits
git filter-repo --path .env --invert-paths

# Remove backend .env if it exists in history
git filter-repo --path backend/.env --invert-paths

# Remove Firebase credentials
git filter-repo --path backend/firebase-service-account.json --invert-paths
```

**Force push to remote**:
```bash
git push origin --force --all
git push origin --force --tags
```

### Option B: Using BFG Repo-Cleaner (Alternative)

**Download BFG**:
- Download from: https://rtyley.github.io/bfg-repo-cleaner/

**Remove files**:
```bash
java -jar bfg.jar --delete-files .env
java -jar bfg.jar --delete-files firebase-service-account.json

git reflog expire --expire=now --all
git gc --prune=now --aggressive

git push origin --force --all
```

### Option C: Keep History As-Is (Easier, Less Secure)

If you choose NOT to rewrite history:
1. **Rotate all credentials immediately**:
   - Generate new Firebase API keys
   - Create new service account JSON
   - Update `.env` with new values
   
2. **Consider the repository compromised** for past credentials

---

## 📋 After History Rewrite (If you did Step 2)

### Team members must:
```bash
# Delete local repository
cd ..
rm -rf Educationalarexplorationapp

# Fresh clone
git clone https://github.com/chessyjoe/Educationalarexplorationapp.git
cd Educationalarexplorationapp

# Create .env files locally (not tracked)
# Copy values from secure source
```

---

## 🔒 Security Best Practices Going Forward

### 1. Never Commit Secrets
- Use `.env` files (now in `.gitignore`)
- Use environment variables in production
- Use secret management tools (GitHub Secrets, AWS Secrets Manager)

### 2. Rotate Compromised Credentials
If sensitive data was committed:
- Generate new API keys immediately
- Revoke old credentials
- Update all environments

### 3. Use `.env.example`
Create a template without real values:
```bash
# .env.example
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

### 4. Scan for Leaks
- Use `git-secrets` to prevent committing secrets
- Enable GitHub secret scanning
- Regular security audits

---

## 🚀 Next Steps

**If you want to rewrite history (recommended)**:
1. ✅ Notify team members
2. ✅ Create backup branch
3. ✅ Install `git-filter-repo`
4. ✅ Run filter commands above
5. ✅ Force push to remote
6. ✅ Rotate all exposed credentials
7. ✅ Team re-clones repository

**If keeping history as-is**:
1. ✅ Rotate Firebase credentials NOW
2. ✅ Update `.env` with new keys
3. ✅ Monitor for unauthorized access

---

## 📞 Need Help?

- git-filter-repo: https://github.com/newren/git-filter-repo
- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- GitHub: Remove sensitive data guide
