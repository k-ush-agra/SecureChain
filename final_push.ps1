git pull origin main --no-rebase
git checkout --ours readme.md
git add .
git commit -m "Add footer and sync with remote"
git push origin main
