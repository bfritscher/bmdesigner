# bmdesigner

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# BUGS
-> font and note height also relative to canvas size?
-> zone paddings + relative title size

-> note icon positions depending on mode.

# modes
free-mixed
    text, pic, note

## TODO
-> rotate with middle
-> keep last used colors?

-> list home add date, nb, badges...
-> logo zone
-> view/edit mode?
-> canvas selection menu / create new
-> duplicate canvas
-> where to put menus?
-> title
-> save menu state to localstorage and/or user's profile
-> login
-> backend
    -> send data to
    -> send new z-order
    -> vuexfire https://github.com/posva/vuexfire
-> bugtrack sentry
-> feedback form
-> info pages
-> credits
-> delete button?

-> add custom props/values to note
-> migrate user/data?`
-> export/import from strategyzer

-> search / filter
-> tags

# Nice to have
-> track which user did what action
-> image mode hide/show labels allow elements without text?
-> allow image drop / lookup?
-> convert image size for space
-> viewonly mode
    -> embed?
-> logo upload
    -> extract color https://github.com/lokesh/color-thief

-> presentation mode
   - animation order
   - tap to show on projector?
   - animation pan order list?

-> animate change

-> invite collaborate / share
    -> remove collaborator

-> mobile touch support

-> screenshot preview / export


# Future
-> handle too many items?
-> start with vp shortcut ?
-> canvas background-image?
-> list to model as with smartart
-> import from other
-> multilingual
-> sentence mode?
-> custom templates
-> mechanics arrow?
-> Quiz mode
-> vpc dynamic fit display
    -> connection + and -
    -> cs  % fit
    -> vp % efficency
    -> + total over all cs & vp
-> offline pwa?
-> other zooms?
-> validation
-> clone / history stream / version tree?
-> calculation MathJS + https://github.com/marcelklehr/toposort
-> Checklist? (link to api of something?)
