include .env
export

include Makefile.db Makefile.docker

start:
	@yarn start-dev-server
