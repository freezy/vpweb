# Visual Pinball for the Web

[VPX-JS](https://github.com/vpdb/vpx-js) is only a library, so there must be
something that runs it. This is it. Its current main purpose is to serve as a
development tool. It doesn't do much but create a three.js scene and load VPX-JS
when a VPX file is dragged onto it.

*This is very much work in progress. You have been warned.*

## Usage

For the ambitious, you'll have to clone both repos. Some time in the future 
you'll find VPX-JS on NPM.

```bash
git clone https://github.com/vpdb/vpx-js.git
cd vpx-js
npm ci
npm run build
cd ..
git clone https://github.com/freezy/vpweb.git
cd vpweb
npm ci
npm start
```

## Quirks

The dragged VPX is locally cached so you wouldn't need to re-drag it every time
the page is reloaded. So it parses the VPX file on every page reload. This means
that if you want to test a different file, you'll have to clear the application
data and refresh the page.

Sometimes it might not work because VPX-JS changed the API on a new branch and
that branch isn't merged yet. In this case look for the freshest branch on 
VPX-JS and use that one.

## License

GPL-2.0
