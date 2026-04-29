git add .
git commit -m "upload to github"
git branch -M main
git remote set-url origin https://github.com/k-ush-agra/SecureChain.git 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote add origin https://github.com/k-ush-agra/SecureChain.git
}
git push -u origin main
