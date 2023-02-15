# Contributing

## Steps

- `$ rm -r mmt/ && mkdir mmt`
- `$ rm -r pkg/ && mkdir pkg`
- Copy files to `mmt/`
- Copy files to `pkg/`
- Copy pkg to `package/shadows.pkg`
- Format `control.xml`
- `$ sh replace.sh`
- `git add *`
- `git commit -m "Added files for 10.XX.XX"`
- `git tag 10.XX.XX`
- `git push -u origin --tags`
