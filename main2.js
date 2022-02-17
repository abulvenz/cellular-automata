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

const N = 57;

const { random, round } = Math;
const init = N => range(N).map(i => i == round(N / 2) ? 1 : 0)
const init2 = N => range(N).map(i => random() < .5 ? 1 : 0)

field.push(init(N));

//console.log(field)

const last = () => field[field.length - 1];

const indexW = (idx, w) => idx + w < 0 ? N + (idx + w) : idx + w >= N ? idx + w - N : idx + w;

const use = (v, fn) => fn(v);

const neighbors = () => use(last(), row => (row.map((c, i) => [row[indexW(i, -1)], row[indexW(i, 0)], row[indexW(i, 1)]])));

const flatMap = arr => arr.reduce((acc, v) => acc.concat(v));

const rules = (arr) => {
    const r = [];
    range(2).map(
        first => range(2).map(second =>
            range(2).map(third => r.push(
                use([first, second, third],
                    rule => ({
                        rule,
                        r2: arr[r.length],
                        check: n => rule.every((e, i) => n[i] === e),
                        result: () => arr[r.length]
                    }))
            ))
        )
    );
    return r;
};

//const rule = rules([0, 0, 1, 1, 1, 1, 1, 0]);

const initial = init2(8)
const rule = rules(initial);

// 30 = 16 + 8 + 4 + 2

const next = () => {
    field.push(
        neighbors().map(n => {
            let r = rule.find(rule => rule.check(n)).r2;
            return r;
        })
    );
};

range(N).forEach(next);

const width = innerWidth * .4;
const height = innerHeight * .4;

const c = document.getElementById("board");
c.width = width;
c.height = height;
const ctx = c.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, innerWidth, innerHeight);

const draw = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    field.forEach((row, ri) => {
        row.forEach((col, ci) => {

            ctx.fillStyle = col === 1 ?
                'black' : 'white';

            ctx.fillRect(
                width / field[0].length * ci + 0,
                height / field.length * ri + 0,
                width / field[0].length,
                height / field.length
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

document.getElementById("rule").innerHTML = JSON.stringify(rule)

// setInterval(() => {
//     field.splice(0, 1);
//     next();
//     draw();
// }, 10);