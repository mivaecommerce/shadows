# Contributing

## Steps

- Cleanup
	- `$ rm -r mmt/ && mkdir mmt`
	- `$ rm -r pkg/ && mkdir pkg`
- Setup
	- Copy files to `mmt/`
	- Copy pkg to `pkg/shadows.pkg`
	- Extract files to `pkg/shadows`
	- Format `control.xml`
	- `$ sh replace.sh`
	- Remove any deleted files from `pkg/shadows`. Find using `$ git status | grep deleted`
- Publish
	- `git add *`
	- `git commit -m "Added files for 10.XX.XX"`
	- `git tag 10.XX.XX`
	- `git push -u origin --tags`
