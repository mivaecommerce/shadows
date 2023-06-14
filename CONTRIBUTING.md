# Contributing

## Steps

- `$ rm -r mmt/ && mkdir mmt`
- `$ rm -r pkg/shadows && mkdir pkg/shadows`
- Copy files to `mmt/`
- Copy files to `pkg/shadows`
- Copy pkg to `package/shadows.pkg`
- Format `control.xml`
- `$ sh replace.sh`
- `git add *`
- `git commit -m "Added files for 10.XX.XX"`
- `git tag 10.XX.XX`
- `git push -u origin --tags`
