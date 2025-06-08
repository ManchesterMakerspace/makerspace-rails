deploy:
	yarn install --production=false
	yarn build
	node scripts/release.js

clean:
	rm -fr ./tmp/screenshots/*

integration:
	yarn install --production=false
	yarn build
	node scripts/integration.js
	node tests/uploadScreenshots.js
