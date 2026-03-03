// Copyright (C) [2026] [Jonas Immanuel Frey] - Licensed under GPLv2. See LICENSE file for details.

import { f_send_wsmsg_with_response, o_state } from './index.js';

import {
    f_o_html_from_o_js,
} from "./lib/handyhelpers.js"

import {
    a_o_model,
    f_s_name_table__from_o_model,
    f_o_model__from_s_name_table,
    s_name_prop_id,
    s_name_prop_ts_created,
    s_name_prop_ts_updated,
    o_wsmsg__f_v_crud__indb,
    o_wsmsg__f_delete_table_data,
    f_o_wsmsg
} from './constructors.js';
import { s_db_create, s_db_read, s_db_update, s_db_delete } from './runtimedata.js';


let a_s_name_prop__auto = [s_name_prop_id, s_name_prop_ts_created, s_name_prop_ts_updated];

let o_component__data = {
    name: 'component-data',
    template: (await f_o_html_from_o_js({
        a_o: [
            {
                class: "a_o_model",
                a_o:[
                    {
                        's_tag': "div",
                        ":class": "'interactable' + (o_model2.s_name === o_model?.s_name ? ' active' : '')",
                        'v-for': "o_model2 of o_state.a_o_model",
                        'innerText': "{{ o_model2.s_name }} ({{ (o_state[f_s_name_table__from_o_model(o_model2)] || []).length }})",
                        'v-on:click': "f_select_model(o_model2)",
                    },

                ]
            },
            {
                's_tag': "div",
                'v-if': "o_model",
                'class': "o_form__create",
                a_o: [
                    {
                        's_tag': "div",
                        'innerText': "New {{ o_model.s_name }}",
                    },
                    {
                        's_tag': "div",
                        'class': "a_o_input",
                        a_o: [
                            {
                                's_tag': "div",
                                'v-for': "o_property of a_o_property__editable",
                                'class': "o_input_group",
                                a_o: [
                                    {
                                        's_tag': "div",
                                        'innerText': "{{ o_property.s_name }}",
                                    },
                                    {
                                        's_tag': "input",
                                        ':type': "o_property.s_type === 'number' ? 'number' : 'text'",
                                        ':step': "o_property.s_type === 'number' ? 'any' : undefined",
                                        'v-model': "o_instance__new[o_property.s_name]",
                                        ':placeholder': "o_property.s_name",
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        's_tag': "div",
                        'class': "interactable",
                        'v-on:click': "f_create_instance",
                        'innerText': "Create",
                    },
                ]
            },
            {
                's_tag': "div",
                'v-if': "o_model",
                'class': "interactable",
                'v-on:click': "f_clear_table",
                'innerText': "Delete all data",
            },
            {
                's_tag': "div",
                'v-if': "o_model",
                'class': "a_o_model_data_table",
                a_o: [
                    {
                        's_tag': "div",
                        'class': "o_row o_row__header",
                        a_o: [
                            {
                                'v-for': "o_property of o_model?.a_o_property",
                                's_tag': "div",
                                'class': "o_cell",
                                innerText: "{{ o_property.s_name }}",
                            },
                            {
                                's_tag': "div",
                                'class': "o_cell",
                                innerText: "actions",
                            },
                        ]
                    },
                    {
                        's_tag': "div",
                        'v-for': "o_instance in o_state[f_s_name_table__from_o_model(o_model)]",
                        'class': "o_row o_instance",
                        a_o: [
                            {
                                'v-for': "o_property of o_model?.a_o_property",
                                's_tag': "div",
                                'class': "o_cell",
                                a_o: [
                                    {
                                        's_tag': "div",
                                        'v-if': "o_instance__editing?.n_id !== o_instance.n_id || a_s_name_prop__auto.includes(o_property.s_name)",
                                        innerText: "{{ o_instance[o_property.s_name] }}",
                                    },
                                    {
                                        's_tag': "input",
                                        'v-if': "o_instance__editing?.n_id === o_instance.n_id && !a_s_name_prop__auto.includes(o_property.s_name)",
                                        'v-model': "o_instance__editing[o_property.s_name]",
                                        ':type': "o_property.s_type === 'number' ? 'number' : 'text'",
                                        ':step': "o_property.s_type === 'number' ? 'any' : undefined",
                                    },
                                ]
                            },
                            {
                                's_tag': "div",
                                'class': "o_cell td__actions",
                                a_o: [
                                    {
                                        's_tag': "div",
                                        'class': "interactable",
                                        'v-if': "o_instance__editing?.n_id !== o_instance.n_id",
                                        'v-on:click': "f_start_edit(o_instance)",
                                        'innerText': "edit",
                                    },
                                    {
                                        's_tag': "div",
                                        'class': "interactable",
                                        'v-if': "o_instance__editing?.n_id !== o_instance.n_id",
                                        'v-on:click': "f_delete_instance(o_instance)",
                                        'innerText': "delete",
                                    },
                                    {
                                        's_tag': "div",
                                        'class': "interactable",
                                        'v-if': "o_instance__editing?.n_id === o_instance.n_id",
                                        'v-on:click': "f_save_edit",
                                        'innerText': "save",
                                    },
                                    {
                                        's_tag': "div",
                                        'class': "interactable",
                                        'v-if': "o_instance__editing?.n_id === o_instance.n_id",
                                        'v-on:click': "f_cancel_edit",
                                        'innerText': "cancel",
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
        ]
    })).outerHTML,
    data: function() {
        return {
            o_state: o_state,
            o_model: null,
            o_instance__new: {},
            o_instance__editing: null,
            a_s_name_prop__auto,
        };
    },
    computed: {
        a_o_property__editable: function() {
            if (!this.o_model) return [];
            return this.o_model.a_o_property.filter(function(o_property) {
                return !a_s_name_prop__auto.includes(o_property.s_name);
            });
        },
    },
    methods:{
        f_s_name_table__from_o_model,

        f_select_model: function(o_model2) {
            this.o_model = o_model2;
            this.o_instance__new = {};
            this.o_instance__editing = null;
        },
        f_clear_table: async function() {
            let o_self = this;
            let s_name_table = f_s_name_table__from_o_model(o_self.o_model);
            if(!confirm(`Delete all data from ${s_name_table}?`)) return;
            let o_resp = await f_send_wsmsg_with_response(
                f_o_wsmsg(
                    o_wsmsg__f_delete_table_data.s_name,
                    [s_name_table]
                )
            );
            o_state[s_name_table] = [];
        },
        f_delete_instance: async function(o_instance) {
            let o_self = this;
            let s_name_table = f_s_name_table__from_o_model(o_self.o_model);
            let o_resp = await f_send_wsmsg_with_response(
                f_o_wsmsg(
                    o_wsmsg__f_v_crud__indb.s_name,
                    [s_db_delete, s_name_table, o_instance]
                )
            );
            if(o_resp.v_result){
                let n_idx = o_state[s_name_table].findIndex(function(o){ return o.n_id === o_instance.n_id; });
                if(n_idx !== -1) o_state[s_name_table].splice(n_idx, 1);
            }
        },
        f_create_instance: async function() {
            let o_self = this;
            let o_data = {};
            let s_name_table = f_s_name_table__from_o_model(o_self.o_model);
            for (let o_property of o_self.a_o_property__editable) {
                let v_val = o_self.o_instance__new[o_property.s_name];
                if (o_property.s_type === 'number') {
                    v_val = Number(v_val);
                }
                o_data[o_property.s_name] = v_val;
            }
            let o_resp = await f_send_wsmsg_with_response(
                f_o_wsmsg(
                    o_wsmsg__f_v_crud__indb.s_name,
                    [s_db_create, s_name_table, o_data]
                )
            );
            // console.log(o_resp)
            debugger
            // o_state[s_name_table].push(o_resp.v_result);
        },
        f_start_edit: function(o_instance) {
            this.o_instance__editing = { ...o_instance };
        },
        f_cancel_edit: function() {
            this.o_instance__editing = null;
        },
        f_save_edit: async function() {
            let o_self = this;
            let s_name_table = f_s_name_table__from_o_model(o_self.o_model);
            let o_data__id = { [s_name_prop_id]: o_self.o_instance__editing[s_name_prop_id] };
            let o_data__update = {};
            for (let o_property of o_self.a_o_property__editable) {
                let v_val = o_self.o_instance__editing[o_property.s_name];
                if (o_property.s_type === 'number') v_val = Number(v_val);
                o_data__update[o_property.s_name] = v_val;
            }
            let o_resp = await f_send_wsmsg_with_response(
                f_o_wsmsg(
                    o_wsmsg__f_v_crud__indb.s_name,
                    [s_db_update, s_name_table, o_data__id, o_data__update]
                )
            );
            if(o_resp.v_result){
                let n_idx = o_state[s_name_table].findIndex(function(o) { return o.n_id === o_resp.v_result.n_id; });
                if(n_idx !== -1) o_state[s_name_table][n_idx] = o_resp.v_result;
            }
            o_self.o_instance__editing = null;
        },
    },
    created: function() {
    },
    beforeUnmount: function() {
    },
};

export { o_component__data };
