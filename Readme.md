# A CLI in Docker to scaffold a new cray service
Compatible with the DST [Pipeline Standards](https://connect.us.cray.com/confluence/display/DST/Pipeline+Standards+for+Docker+Builds) in conflunece

## To build
docker build . -t yeoman

## To use
docker run --rm -it -v "${HOME}/.config:/root/.config" -v "${PWD}:/workdir"  yeoman your_fantastic_application_name

