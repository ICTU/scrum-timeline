RELEASE=v0.3.0-alpha1-lhelwerd6

.PHONY: install
install:
	npm install d3
	npm install https://github.com/lhelwerd/EventDrops/releases/download/$(RELEASE)/$(RELEASE).tar.gz
	npm install browserify
	npm install http-server

bundle.js: index.js data.json locales.json
	./node_modules/browserify/bin/cmd.js index.js > bundle.js

.PHONY: clean
clean:
	rm -rf node_modules/ bundle.js

.PHONY: run
run: bundle.js
	./node_modules/http-server/bin/http-server
