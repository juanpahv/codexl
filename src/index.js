const {c, cpp, node, python, java} = require('compile-run');


for(i = 0; i<10; i++){
    console.log('hola');
}

// const sourcecode = `print("Hell0 W0rld!")`;
// let resultPromise = java.runSource(sourcecode);
// resultPromise
//     .then(result => {
//         console.log(result);
//     })
//     .catch(err => {
//         console.log(err);
//     });