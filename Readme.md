docker build . -t yeoman
docker run --rm -it -v "${HOME}/.config:/root/.config" -v "${PWD}:/workdir"  yeoman newapp
