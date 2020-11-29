# Video Tutorials



## Installing Message DB on Postgres Docker

NOTE: This is a manual installation, it can be automated.

```bash
# Access the docker shell.
$ docker exec -it $(docker ps -q) bash

# Add git.
$ apk add git

# Clone the message-db git repository to tmp folder.
$ cd tmp
$ git clone https://github.com/message-db/message-db.git
$ cd message-db

# Create a user (defaults to root)
$ adduser john

# Switch to john
$ su -l john
$ whoami
john

# Install.
$ database/install.sh
```
