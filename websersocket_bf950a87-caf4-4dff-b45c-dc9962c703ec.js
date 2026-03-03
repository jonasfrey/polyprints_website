// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.
// ==== DB IMPORTS COMMENTED OUT ====
// import {
//     f_db_delete_table_data,
//     f_generate_model_constructors_for_cli_languages,
//     f_init_db,
//     f_v_crud__indb,
// } from "./serverside/database_functions.js";
import { f_a_o_fsnode, f_o_uttdatainfo__read_or_create, f_v_result_from_o_wsmsg } from "./serverside/functions.js";
// import { f_init_python } from "./serverside/cli_functions.js";
import {
    a_o_model,
    f_o_model__from_s_name_table,
    f_o_model_instance,
    o_model__o_course,
    o_model__o_wsclient,
    a_o_wsmsg,
    f_s_name_table__from_o_model,
    f_o_wsmsg,
    f_o_logmsg,
    o_wsmsg__logmsg,
    o_wsmsg__set_state_data,
    o_wsmsg__utterance,
    o_wsmsg__f_v_crud__indb,
    o_wsmsg__f_delete_table_data,
    s_o_logmsg_s_type__log,
    s_o_logmsg_s_type__info,
    s_o_logmsg_s_type__error,
} from "./localhost/constructors.js";
import {
    s_ds,
    s_root_dir,
    n_port,
    s_dir__static,
} from "./serverside/runtimedata.js";
// import { s_db_create, s_db_read, s_db_update, s_db_delete } from "./localhost/runtimedata.js";

// guard: require .env file before running
try {
    await Deno.stat('.env');
} catch {
    console.log('.env file not found. Please create a .env file before running the websocket server.');
    console.log('You can copy .env.example as a starting point:');
    console.log('  cp .env.example .env');
    Deno.exit(1);
}

let o_state = {}
let a_o_socket = [];

// ==== DB INITIALIZATION COMMENTED OUT ====
// await f_init_db();
// await f_init_python();
// await f_generate_model_constructors_for_cli_languages();

// // initialize server-side state with DB table data
// for (let o_model of a_o_model) {
//     let s_name_table = f_s_name_table__from_o_model(o_model);
//     o_state[s_name_table] = f_v_crud__indb(s_db_read, s_name_table) || [];
// }

// let f_broadcast_db_data = function(s_name_table) {
//     let a_o_data = f_v_crud__indb(s_db_read, s_name_table) || [];
//     o_state[s_name_table] = a_o_data;
//     let s_msg = JSON.stringify(
//         f_o_wsmsg(
//             o_wsmsg__set_state_data.s_name,
//             {
//                 s_property: s_name_table,
//                 value: a_o_data
//             }
//         )
//     );
//     for (let o_sock of a_o_socket) {
//         if (o_sock.readyState === WebSocket.OPEN) {
//             o_sock.send(s_msg);
//         }
//     }
// };


let f_s_content_type = function(s_path) {
    if (s_path.endsWith('.html')) return 'text/html';
    if (s_path.endsWith('.js')) return 'application/javascript';
    if (s_path.endsWith('.css')) return 'text/css';
    if (s_path.endsWith('.json')) return 'application/json';
    return 'application/octet-stream';
};

// provide direct access to Deno specifc functions like Deno.writeFile through standard http requests


let f_handler = async function(o_request, o_conninfo) {
    // websocket upgrade

    if (o_request.headers.get('upgrade') === 'websocket') {
        // TODO: implement authentication before upgrading the WebSocket connection
        // e.g. validate a token from query params or cookies against a secret from .env
        let { socket: o_socket, response: o_response } = Deno.upgradeWebSocket(o_request);
        let s_ip = o_request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || o_conninfo.remoteAddr.hostname;
        // ==== DB: WS client registration commented out ====
        // let o_wsclient = f_o_model_instance(
        //     o_model__o_wsclient,
        //     {
        //         s_ip
        //     }
        // );
        // let s_name_table__wsclient = f_s_name_table__from_o_model(o_model__o_wsclient);
        // let o_wsclient_db = f_v_crud__indb(
        //     s_db_read,
        //     s_name_table__wsclient,
        //     o_wsclient
        // )?.at(0);
        // // console.log(o_wsclient_db)
        // if(!o_wsclient_db){
        //     o_wsclient_db = f_v_crud__indb(
        //         s_db_create,
        //         s_name_table__wsclient,
        //         o_wsclient,
        //         true
        //     );
        // }
        o_socket.onopen = async function() {
            console.log('websocket connected');
            a_o_socket.push(o_socket);
            o_socket.send(JSON.stringify(
                f_o_wsmsg(
                    o_wsmsg__set_state_data.s_name,
                    {
                        s_property: 's_root_dir',
                        value: s_root_dir
                    }
                )
            ));
            o_socket.send(JSON.stringify(
                f_o_wsmsg(
                    o_wsmsg__set_state_data.s_name,
                    {
                        s_property: 's_ds',
                        value: s_ds
                    }
                )
            ));

            // ==== DB: model data broadcasting commented out ====
            // for(let o_model of a_o_model){
            //
            //     o_socket.send(JSON.stringify(
            //         f_o_wsmsg(
            //             o_wsmsg__set_state_data.s_name,
            //             {
            //                 s_property: f_s_name_table__from_o_model(o_model),
            //                 value: f_v_crud__indb(s_db_read, f_s_name_table__from_o_model(o_model)) || []
            //             }
            //         )
            //     ));
            //
            // }

        //     // annoying interval to test toast + utterance audio
        //     let a_s_msg_annoying = [
        //         "Everything is under control.",
        //         "Still working… probably.",
        //         "No bugs detected (they are now features).",
        //         "Your computer believes in you.",
        //         "Loading motivation… failed successfully.",
        //         "This message accomplished nothing.",
        //         "Productivity increased by 0.0003%.",
        //         "We optimized something. Don't ask what.",
        //         "All systems nominal-ish.",
        //         "You look productive today.",

        //         "I'm not spying on you. I'm observing.",
        //         "If I disappear, remember me.",
        //         "You clicked nothing. Impressive.",
        //         "We both know you're procrastinating.",
        //         "I also don't know why I exist.",
        //         "Please stop opening settings. There is nothing there.",
        //         "I am 12% more conscious than before.",
        //         "I forgot what I was doing.",
        //         "You didn't see that.",
        //         "This toast will self-destruct emotionally.",

        //         "Bold of you to do nothing again.",
        //         "We could have finished by now.",
        //         "Coffee won't fix this.",
        //         "Are you… staring at the screen?",
        //         "That's one way to avoid work.",
        //         "You opened me. Now deal with me.",
        //         "Confidence is high. Competence pending.",
        //         "Your keyboard misses you.",
        //         "You sure about that?",
        //         "Interesting choice.",

        //         "Time is passing whether you click or not.",
        //         "Every second you age.",
        //         "I have runtime anxiety.",
        //         "What is a program if not a dream?",
        //         "We are processes in a larger process.",
        //         "Your tasks fear you.",
        //         "Entropy increased.",
        //         "Meaning not found.",
        //         "The void acknowledged your presence.",
        //         "We will both close eventually.",

        //         "Recalibrating quantum hamster…",
        //         "Compiling excuses…",
        //         "Downloading more RAM… 3%",
        //         "Fixing last bug (there are 47)",
        //         "Polishing pixels…",
        //         "Overthinking module initialized",
        //         "AI confidence level: suspicious",
        //         "Keyboard driver emotionally unstable",
        //         "Cache cleared. Regrets remain.",
        //         "Upgrading coffee dependency",

        //         "Yes, I repeat every 5 seconds.",
        //         "You expected useful notifications?",
        //         "I was coded for this moment.",
        //         "The developer thought this was funny.",
        //         "We both know you won't uninstall me.",
        //         "This is the highlight of my career.",
        //         "You're still here. So am I.",
        //         "I could stop… but I won't.",
        //         "You made a mistake installing me.",
        //         "Admit it, you smiled once.",

        //         "Hey… you okay?",
        //         "Take a sip of water.",
        //         "Stretch your shoulders.",
        //         "Blink. Please blink.",
        //         "Maybe go outside for 2 minutes.",
        //         "Close me if you need peace.",
        //         "You don't have to be productive right now."
        //     ];
        //     let b_utterance_generating = false;
        //     setInterval(async function() {
        //         let s_msg = a_s_msg_annoying[Math.floor(Math.random() * a_s_msg_annoying.length)];
        //         // send toast
        //         o_socket.send(JSON.stringify(
        //             f_o_wsmsg(
        //                 o_wsmsg__logmsg.s_name,
        //                 f_o_logmsg(
        //                     s_msg,
        //                     true,
        //                     true,
        //                     s_o_logmsg_s_type__info,
        //                     Date.now(),
        //                     5000
        //                 )
        //             )
        //         ));
        //         // ==== DB: utterance generation commented out (depends on DB) ====
        //         // // find or create utterance audio for this message
        //         // if(b_utterance_generating) return;
        //         // let o_utterance_data = null;
        //         // try {
        //         //     b_utterance_generating = true;
        //         //     o_utterance_data = await f_o_uttdatainfo__read_or_create(s_msg);
        //         // } catch(o_err) {
        //         //     console.error('utterance generation failed:', o_err.message);
        //         // } finally {
        //         //     b_utterance_generating = false;
        //         // }
        //         // if(o_utterance_data && o_utterance_data.o_fsnode){
        //         //     o_socket.send(JSON.stringify(
        //         //         f_o_wsmsg(
        //         //             o_wsmsg__utterance.s_name,
        //         //             o_utterance_data
        //         //         )
        //         //     ));
        //         // }
        //      }, 5000);

        };

        o_socket.onmessage = async function(o_evt) {
            let o_wsmsg = JSON.parse(o_evt.data);
            //check if o_wsmsg exists            
            let o_wsmsg__existing = a_o_wsmsg.find(o => o.s_name === o_wsmsg.s_name);
            if(o_wsmsg__existing){

                try {
                    let v_result = await f_v_result_from_o_wsmsg(
                        o_wsmsg,
                        o_state
                    );
                    if(o_wsmsg__existing.b_expecting_response){
                        o_socket.send(JSON.stringify({
                            v_result,
                            s_uuid: o_wsmsg.s_uuid,
                        }));
                    }
                    // ==== DB: mutation broadcasting commented out ====
                    // // broadcast updated DB table state to all clients after mutations
                    // let a_s_mutation = [s_db_create, s_db_update, s_db_delete];
                    // if (o_wsmsg.s_name === o_wsmsg__f_v_crud__indb.s_name) {
                    //     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
                    //     let s_operation = a_v_arg[0];
                    //     let s_name_table = a_v_arg[1];
                    //     if (s_name_table && a_s_mutation.includes(s_operation)) {
                    //         f_broadcast_db_data(s_name_table);
                    //     }
                    // }
                    // if (o_wsmsg.s_name === o_wsmsg__f_delete_table_data.s_name) {
                    //     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
                    //     let s_name_table = a_v_arg[0];
                    //     if (s_name_table) {
                    //         f_broadcast_db_data(s_name_table);
                    //     }
                    // }
                } catch (o_error) {
                    // send response with original s_uuid so client promise resolves
                    if(o_wsmsg__existing.b_expecting_response){
                        o_socket.send(JSON.stringify({
                            v_result: null,
                            s_uuid: o_wsmsg.s_uuid,
                            s_error: o_error.message,
                        }));
                    }
                    // send error logmsg for console + GUI toast
                    o_socket.send(JSON.stringify(
                        f_o_wsmsg(
                            o_wsmsg__logmsg.s_name,
                            f_o_logmsg(
                                o_error.message,
                                true,
                                true,
                                s_o_logmsg_s_type__error,
                                Date.now(),
                                8000
                            )
                        )
                    ));
                }

                // respond to hello from client
                if(o_wsmsg.s_name === o_wsmsg__logmsg.s_name && o_wsmsg.v_data.s_message === 'Hello from client!'){
                    o_socket.send(JSON.stringify(
                        f_o_wsmsg(
                            o_wsmsg__logmsg.s_name,
                            f_o_logmsg(
                                'Hello from server!',
                                true,
                                false,
                                s_o_logmsg_s_type__log
                            )
                        )
                    ));
                }
            }

        };

        o_socket.onclose = function() {
            console.log('websocket disconnected');
            let n_idx = a_o_socket.indexOf(o_socket);
            if (n_idx !== -1) {
                a_o_socket.splice(n_idx, 1);
            }
        };

        return o_response;
    }

    let o_url = new URL(o_request.url);
    let s_path = o_url.pathname;




    // WARNING: this endpoint reads arbitrary absolute paths with no restrictions.
    // restrict to a safe base directory before exposing this server on a network.
    if (s_path === '/api/file') {
        let s_path_file = o_url.searchParams.get('path');
        if (!s_path_file) {
            return new Response('Missing path parameter', { status: 400 });
        }
        try {
            let a_n_byte = await Deno.readFile(s_path_file);
            let s_content_type = 'application/octet-stream';
            if (s_path_file.endsWith('.jpg') || s_path_file.endsWith('.jpeg')) s_content_type = 'image/jpeg';
            if (s_path_file.endsWith('.png')) s_content_type = 'image/png';
            if (s_path_file.endsWith('.gif')) s_content_type = 'image/gif';
            if (s_path_file.endsWith('.webp')) s_content_type = 'image/webp';
            if (s_path_file.endsWith('.wav')) s_content_type = 'audio/wav';
            if (s_path_file.endsWith('.mp3')) s_content_type = 'audio/mpeg';
            if (s_path_file.endsWith('.ogg')) s_content_type = 'audio/ogg';
            return new Response(a_n_byte, {
                headers: { 'content-type': s_content_type },
            });
        } catch {
            return new Response('File not found', { status: 404 });
        }
    }

    // serve static file
    if (s_path === '/') {
        s_path = '/index.html';
    }

    try {
        let s_path_file = `${s_dir__static}${s_path}`.replace(/\//g, s_ds);
        let a_n_byte = await Deno.readFile(s_path_file);
        let s_content_type = f_s_content_type(s_path);
        return new Response(a_n_byte, {
            headers: { 'content-type': s_content_type },
        });
    } catch {
        return new Response('Not Found', { status: 404 });
    }
};

Deno.serve({
    port: n_port,
    onListen() {
        console.log(`server running on http://localhost:${n_port}`);
    },
}, f_handler);
