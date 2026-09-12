const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css += `
@media only screen and (max-width: 900px) {
    .new_modal_layout .modal-body-container {
        flex-direction: column !important;
        overflow-y: auto !important;
    }
    .new_modal_layout .modal-body-container > div:first-child { /* thumbsCol */
        flex-direction: row !important;
        width: 100% !important;
        height: 100px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
    }
    .new_modal_layout .modal-body-container > div:first-child > div {
        width: 120px !important;
        height: 80px !important;
    }
    .new_modal_layout .modal-body-container > div:nth-child(2) { /* mainFrame */
        min-height: 250px !important;
    }
    .new_modal_layout .modal-body-container > div:nth-child(3) { /* detailsCol */
        width: 100% !important;
        height: auto !important;
    }
    .new_modal_layout .event_title h1 {
        font-size: 16px !important;
    }
    .new_modal_layout .event_prev, .new_modal_layout .event_next {
        min-width: 80px !important;
        font-size: 12px !important;
        padding: 8px !important;
    }
}
`;

fs.writeFileSync('style.css', css);

let mincss = fs.readFileSync('style.min.css', 'utf8');
mincss += '@media only screen and (max-width:900px){.new_modal_layout .modal-body-container{flex-direction:column!important;overflow-y:auto!important}.new_modal_layout .modal-body-container>div:first-child{flex-direction:row!important;width:100%!important;height:100px!important;overflow-x:auto!important;overflow-y:hidden!important}.new_modal_layout .modal-body-container>div:first-child>div{width:120px!important;height:80px!important}.new_modal_layout .modal-body-container>div:nth-child(2){min-height:250px!important}.new_modal_layout .modal-body-container>div:nth-child(3){width:100%!important;height:auto!important}.new_modal_layout .event_title h1{font-size:16px!important}.new_modal_layout .event_prev,.new_modal_layout .event_next{min-width:80px!important;font-size:12px!important;padding:8px!important}}';
fs.writeFileSync('style.min.css', mincss);

console.log('Added responsive styles for new modal');
