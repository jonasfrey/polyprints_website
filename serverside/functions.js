// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

// backend utility functions
// add shared server-side helper functions here and import them where needed

import { s_ds } from './runtimedata.js';
// ==== DB IMPORTS COMMENTED OUT ====
// import { s_db_create, s_db_read } from '../localhost/runtimedata.js';
import { a_o_wsmsg,
    f_o_model_instance,
     f_s_name_table__from_o_model, o_wsmsg__logmsg, o_wsmsg__set_state_data } from '../localhost/constructors.js';
// import { f_v_crud__indb, f_db_delete_table_data } from './database_functions.js';
// import { f_o_uttdatainfo } from './cli_functions.js';

let f_a_o_fsnode = async function(
    s_path,
    b_recursive = false,
    b_store_in_db = false
) {
    let a_o = [];

    if (!s_path) {
        console.error('Invalid path:', s_path);
        return a_o;
    }
    if (!s_path.startsWith(s_ds)) {
        console.error('Path is not absolute:', s_path);
        return a_o;
    }

    try {
        for await (let o_dir_entry of Deno.readDir(s_path)) {
            let s_path_absolute = `${s_path}${s_ds}${o_dir_entry.name}`;

            let o_fsnode = f_o_model_instance(
                o_model__o_fsnode,
                {
                    s_path_absolute,
                    s_name: s_path_absolute.split(s_ds).at(-1),
                    b_folder: o_dir_entry.isDirectory,
                }
            );
            // ==== DB: store_in_db block commented out ====
            // if(b_store_in_db){
            //     let o_fsnode__fromdb = (f_v_crud__indb(s_db_read, f_s_name_table__from_o_model(o_model__o_fsnode), { s_path_absolute }))?.at(0);
            //     if (o_fsnode__fromdb) {
            //         o_fsnode.n_id = o_fsnode__fromdb.n_id;
            //     } else {
            //         let o_fsnode__created = f_v_crud__indb(s_db_create, f_s_name_table__from_o_model(o_model__o_fsnode), { s_path_absolute, b_folder: o_dir_entry.isDirectory });
            //         o_fsnode.n_id = o_fsnode__created.n_id;
            //     }
            //     if (o_dir_entry.isDirectory && b_recursive) {
            //         o_fsnode.a_o_fsnode = await f_a_o_fsnode(s_path_absolute, b_recursive);
            //     }
            // }

            a_o.push(o_fsnode);
        }
    } catch (o_error) {
        console.error(`Error reading directory: ${s_path}`, o_error.message);
        console.error(o_error.stack);
    }

    a_o.sort(function(o_a, o_b) {
        if (o_a.b_folder === o_b.b_folder) return (o_a.s_name || '').localeCompare(o_b.s_name || '');
        return o_a.b_folder ? -1 : 1;
    });

    return a_o;
};



// WARNING: the following deno_copy_file, deno_stat, deno_mkdir handlers expose raw Deno APIs
// to any connected WebSocket client with arbitrary arguments. Fine for local dev use,
// but must be restricted or removed before any network-exposed deployment.
// o_wsmsg__deno_copy_file.f_v_server_implementation = function(o_wsmsg){
//     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
//     return Deno.copyFile(...a_v_arg);
// }
// o_wsmsg__deno_stat.f_v_server_implementation = function(o_wsmsg){
//     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
//     return Deno.stat(...a_v_arg);
// }
// o_wsmsg__deno_mkdir.f_v_server_implementation = function(o_wsmsg){
//     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
//     return Deno.mkdir(...a_v_arg);
// }
// ==== DB: CRUD server implementations commented out ====
// o_wsmsg__f_v_crud__indb.f_v_server_implementation = function(o_wsmsg){
//     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
//     return f_v_crud__indb(...a_v_arg);
// }
// o_wsmsg__f_delete_table_data.f_v_server_implementation = function(o_wsmsg){
//     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
//     return f_db_delete_table_data(...a_v_arg);
// }
// o_wsmsg__f_a_o_fsnode.f_v_server_implementation = function(o_wsmsg){
//     let a_v_arg = Array.isArray(o_wsmsg.v_data) ? o_wsmsg.v_data : [];
//     return f_a_o_fsnode(...a_v_arg);
// }
o_wsmsg__logmsg.f_v_server_implementation = function(o_wsmsg){
    let o_logmsg = o_wsmsg.v_data;
    if(o_logmsg.b_consolelog){
        console[o_logmsg.s_type](o_logmsg.s_message);
    }
    return null;
}
o_wsmsg__set_state_data.f_v_server_implementation = function(o_wsmsg, o_wsmsg__existing, o_state){
    o_state[o_wsmsg.v_data.s_property] = o_wsmsg.v_data.value;
    return null;
}
// ==== DB: utterance read_or_create commented out ====
// let f_o_uttdatainfo__read_or_create = async function(s_text){
//     let s_name_table__utterance = f_s_name_table__from_o_model(o_model__o_utterance);
//     let s_name_table__fsnode = f_s_name_table__from_o_model(o_model__o_fsnode);
//     let a_o_existing = f_v_crud__indb(s_db_read, s_name_table__utterance, { s_text }) || [];
//     if(a_o_existing.length > 0){
//         let o_utterance = a_o_existing[0];
//         let o_fsnode = o_utterance.n_o_fsnode_n_id
//             ? (f_v_crud__indb(s_db_read, s_name_table__fsnode, { n_id: o_utterance.n_o_fsnode_n_id }) || []).at(0)
//             : null;
//         return { o_utterance, o_fsnode };
//     }
//     // not found in db, generate new utterance audio
//     return await f_o_uttdatainfo(s_text);
// };
let f_o_uttdatainfo__read_or_create = async function(s_text){
    console.log('[db disabled] f_o_uttdatainfo__read_or_create skipped');
    return null;
};

let f_v_result_from_o_wsmsg = async function(
    o_wsmsg,
    o_state
){
    let o_wsmsg__existing = a_o_wsmsg.find(o=>o.s_name === o_wsmsg.s_name);
    if(!o_wsmsg__existing){
        console.error('No such wsmsg:', o_wsmsg.s_name);
        return null;
    }
    if(!o_wsmsg__existing.f_v_server_implementation) {
        console.error('No server implementation for wsmsg:', o_wsmsg.s_name);
        return null;
    }
    return o_wsmsg__existing.f_v_server_implementation(
        o_wsmsg,
        o_wsmsg__existing, 
        o_state
    );

}

export {
    f_a_o_fsnode,
    f_o_uttdatainfo__read_or_create,
    f_v_result_from_o_wsmsg
};
