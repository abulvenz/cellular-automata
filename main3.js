const range2 = N => { const r = []; for (let i = 0; i < N; i++) r.push(i); return r; };

const range = (() => {
    let r = range2(2000);
    return N => {
        if (r.length < N)
            r = range2(N);
        return r.slice(0, N);
    };
})();


let field = [];

const N = 97;
const M = 2;

const { pow, random, round, max, min } = Math;
const init = N => range(N).map(i => i == round(N / 2) ? 1 : 0)
const randomArray = N => range(N).map(i => random() < .5 ? 1 : 0)

field.push(init(N));

//console.log(field)

const last = (k = 1) => field[max(0, field.length - k)];

const indexW = (idx, w) => idx + w < 0 ? N + (idx + w) : idx + w >= N ? idx + w - N : idx + w;

const use = (v, fn) => fn(v);
const flatMap = arr => arr.reduce((acc, v) => acc.concat(v));

const neighbors = (k) => use(last(), row => (row.map((c, i) => [row[indexW(i, -1)], row[indexW(i, 0)], row[indexW(i, 1)]])));


const A = randomArray(3)

const bin = A => A.reduce((acc, v, i) => v === 0 ?
    acc :
    acc + pow(2, i), 0);

console.log(bin(A), JSON.stringify(A, null, 2))

//const rule = randomArray(8);
const rule = [0, 0, 1, 1, 1, 1, 1, 0];

const next = () => {
    field.push(
        neighbors().map(n => {
            return rule[bin(n)];
        })
    );
};
range(N).forEach(next);

const scale = 1;

const width = innerWidth * scale;
const height = innerHeight * scale;

const c = document.getElementById("board");
c.width = width;
c.height = height;
const ctx = c.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(0, 0, innerWidth, innerHeight);

const draw = () => {
    field.forEach((row, ri) => {
        row.forEach((col, ci) => {

            ctx.fillStyle = col === 1 ?
                'black' : 'white';

            ctx.fillRect(
                width / field[0].length * ci + 0,
                height / field.length * ri + 0,
                width / field[0].length - 0,
                height / field.length - 0
            );

        });
    });
};


const run = () =>
    requestAnimationFrame(() => {
        field.splice(0, 1);
        next();
        draw();
        run();
    });

run();

//document.getElementById("rule").innerHTML = JSON.stringify(binaryPermutations(2), null, 2)

// setInterval(() => {
//     field.splice(0, 1);
//     next();
//     draw();
// }, 10);