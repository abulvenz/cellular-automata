import m, { mount } from 'mithril';
import tagl from 'tagl-mithril';

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

const range = N => { const r = []; for (let i = 0; i < N; i++) r.push(i); return r; };

let field = [];

const N = 100;

const { random } = Math;
const init = N => range(N).map(i => i == N / 2 ? 1 : 0)
const init2 = N => range(N).map(i => random() < .5 ? 1 : 0)

field.push(init(N));

console.log(field)

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
const rule = rules(init2(8));

// 30 = 16 + 8 + 4 + 2

const next = () => {
    field.push(
        neighbors().map(n => {
            let r = rule.find(rule => rule.check(n)).r2;
            return r;
        })
    )
}

range(100).forEach(next)

const c = document.getElementById("board");
c.width = window.innerWidth;
c.height = window.innerHeight;
const ctx = c.getContext("2d");
ctx.fillStyle = "saddlebrown";
ctx.fillRect(0, 0, innerWidth, innerHeight);

const draw = () => {
    field.map((row, ri) => {
        row.map((col, ci) => {

            ctx.fillStyle = col === 1 ?
                'black' : 'white';

            ctx.fillRect(
                field.length / innerWidth * ci * 60 + 20,
                field[0].length / innerHeight * ri * 60 + 10,
                field.length / innerWidth * 60,
                field[0].length / innerHeight * 60
            )

        })
    });
};

setInterval(() => {
    field.splice(0, 1);
    next();
    draw();
}, 0)