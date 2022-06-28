# Chap

This project is a simple **cha**ngelog **p**arser written in Node.js. The parser assumes that [Semantic Versioning](https://semver.org/spec/v2.0.0.html) will be used and that the format roughly conforms to [Keep a Changelog](https://keepachangelog.com/).

It will simply check if a specified changelog follows rules like:
+ contains an 'Unreleased' section at the top of all releases
+ using only valid *types of changes*
+ does not contain undefined references
+ does not define references that aren't used
+ has valid versioning (1.1.0 can't be a later release than 1.2.0)
+ ...

It will not check if the contents of the file comply with the [Keep a Changelog](https://keepachangelog.com/) format completely.

## Usage

Pass the path to a changelog to validate it.
```
node index.js path/to/CHANGELOG.md
```

Use `-v` or `--version` to retrieve the current version (the one of the latest release).
```
node index.js -v path/to/CHANGELOG.md
```

Use `-c` or `--changes` to retrieve the content (as markdown) of the latest release.
```
node index.js -c path/to/CHANGELOG.md
```

Use `--today` to also make sure that the date of the latest release is the current date.
```
node index.js --today path/to/CHANGELOG.md
```

## Docker

You can also use Chap with [Docker](https://www.docker.com/).

### docker-compose 

```
docker-compose run --rm -v /path/to/CHANGELOG.md:/usr/src/app/CHANGELOG.md chap node index.js CHANGELOG.md
```

### Docker only

If you do not want to use docker-compose:
```
docker run --rm -v `pwd`:`pwd` -w `pwd` -v /path/to/CHANGELOG.md:`pwd`/CHANGELOG.md node:lts node index.js CHANGELOG.md
```
To break this down:
+ `--rm` to automatically remove the container after the command is done
+ `` -v `pwd`:`pwd` `` mount the current working directory (host) to the same directory inside the container (to mount the project)
+ `` -w `pwd` `` to also set the working directory inside the container 
+ `` -v /path/to/CHANGELOG.md:`pwd`/CHANGELOG.md `` the seconds `-v` will mount the desired changelog file to `` `pwd`/CHANGELOG.md `` inside the container
+ `node:lts` the image to use
+ `node index.js CHANGELOG.md` the actual command to run inside the container
