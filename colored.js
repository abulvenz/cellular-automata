import m from 'mithril';
import tagl from 'tagl-mithril';

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

const range2 = N => { const r = []; for (let i = 0; i < N; i++) r.push(i); return r; };

const range = (() => {
    let r = range2(2000);
    return N => {
        if (r.length < N)
            r = range2(N);
        return r.slice(0, N);
    };
})();


const recorder = ((canvasid) => {
    let recorder = null;
    let chunks = [];
    let blob = null;
    let vidURL = null;

    const record = () => {
        const canvas = document.getElementById(canvasid);
        var cStream = canvas.captureStream(30);
        // create a recorder fed with our canvas' stream
        recorder = new MediaRecorder(cStream);
        // start it
        recorder.start();
        // save the chunks
        recorder.ondataavailable = saveChunks;
        recorder.onstop = exportStream;
        // change our button's function
    };

    const saveChunks = (e) => console.log("Save") || chunks.push(e.data);
    const stop = () => [recorder && recorder.stop(), m.redraw()];

    const exportStream = (e) => {
        // combine all our chunks in one blob
        blob = new Blob(chunks)
            // do something with this blob
        vidURL = URL.createObjectURL(blob);
        recorder = null;
        chunks = [];
    };

    return {
        record,
        stop,
        clear: () => {
            URL.revokeObjectURL(blob);
            vidURL = null;
            chunks = [];
        },
        vidURL: () => vidURL,
        recording: () => !!recorder
    };
})("board");



let field = [];

const N = 128;
const M = 1;
const L = 2;

const { pow, random, round, max, min } = Math;
const init = N => range(N).map(i => i == round(N / 2) ? 1 : 0)
const randomArray = N => range(N).map(i => random() < .5 ? 1 : 0)

range(N).forEach(() =>
    field.push(randomArray(N)));

//console.log(field)

const last = (k = 1) => field[max(0, field.length - k)];

const indexW = (idx, w = 0) => idx + w < 0 ? N + (idx + w) : idx + w >= N ? idx + w - N : idx + w;

const use = (v, fn) => fn(v);
const flatMap = arr => arr.reduce((acc, v) => acc.concat(v));

const A = randomArray(3)

const bin = A => A.reduce((acc, v, i) => v === 0 ?
    acc :
    acc + pow(2, i), 0);

console.log(bin(A), JSON.stringify(A, null, 2))

const W = ((M * 2) + 1) * L;

let rule = randomArray(pow(2, W));
//const rule = [0, 0, 1, 1, 1, 1, 1, 0];

const pows = range(W).map(i => pow(2, i));

const next = (row) => {
    row = indexW(row)
    if (row === 0)
        rule = randomArray(pow(2, W));
    const current = field[row];

    let mini = 1;
    let maxi = 0;

    for (let idx = 0; idx < current.length; idx++) {
        let sum = 0;
        let count = 0;
        for (let r = 1; r < L + 1; r++) {
            for (let c = -M; c <= M; c++) {
                if (field[indexW(row, -r)][indexW(idx, c)] === 1) {
                    sum += pows[count];
                }
                count += 1;
            }
        }
        //  if (row === 0)
        //        console.log(sum, rule.length)
        current[idx] = rule[sum];
        mini = min(mini, rule[sum]);
        maxi = max(maxi, rule[sum]);
    }
    if (mini === maxi) {
        current[0] = 0;
        current[1] = 1;
    }
    if (0 && row === 0) {
        init(N).forEach((v, i) => field[indexW(row, -2)][i] = v)
        init(N).forEach((v, i) => field[indexW(row, -1)][i] = v)
        init(N).forEach((v, i) => field[indexW(row, -0)][i] = v)
    }
};

//range(N).forEach(next);

const scale = 1;

const width = innerWidth * scale;
const height = innerHeight * scale;

const c = document.getElementById("board");
c.width = width;
c.height = height;
const ctx = c.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(0, 0, innerWidth, innerHeight);

let index = 0;

const draw = () => {
    index = (index - 1) % N;
    field.forEach((row, ri_) => {
        const ri = indexW(ri_, index);

        row.forEach((col, ci) => {

            ctx.fillStyle = col === 1 ?
                //            `rgb(${field[ci][ri]*155},${field[ci][ri]*155},${field[ri][ci]*255})`    
                //`rgb(${field[ci][ri]*55},${field[ci][ri]*55},${field[ri][ci]*155})`
                //`rgb(${max(0,255-2*index*55)},${(max(0,ci*2*55)%255)},${max(0,255-ri*155)})`
                `rgb(${ri},${ci},${-index%255})`
                //"black"
                :
                'black';

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
        next(-index);
        draw();
        run();
        m.redraw()
    });

run();

m.mount(document.getElementById("rule"), {
    view: vnode => [
        (recorder.recording() ?
            button({ onclick: e => recorder.stop() }, 'stop') : [
                button({ onclick: e => recorder.record() }, 'record'),
                recorder.vidURL() ? button({ onclick: e => recorder.clear() }, 'clear') : null,
            ]),
        recorder.vidURL() ? video({ controls: true, src: recorder.vidURL() }) : null,
        JSON.stringify(rule), index
    ]
});

//document.getElementById("rule").innerHTML = JSON.stringify(binaryPermutations(2), null, 2)

// setInterval(() => {
//     field.splice(0, 1);
//     next();
//     draw();
// }, 10);