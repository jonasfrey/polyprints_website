# CRUD template

Deno · SQLite · Vue 3 · WebSocket

## Quick start

```
mkdir project_name && cd project_name
deno eval "import { f_init_project } from 'jsr:@apn/websersocketgui@{version}/init'; await f_init_project();"
deno task run
```

Open `http://localhost:8000`

## Tasks

- `deno task run` — start the server
- `deno task uninit` — delete database and reset project data


## project structure 
root 
    serverside
        basically all server side code goes here
    localhost
        all data that is accessable on the website client
    
# APN
This project is coded entirely with APN Abstract Prefix Notation. To get a better understanding you can read the paper https://zenodo.org/records/18743663

## Remember
This project exposes many functionalities of the 'server' which is essentaly the computer . The webapplication GUI 'only' serves as a front end for the application. However this can be extended in a way to make it a sturdy and secure webapplication. The fundamentals however are here to give full access to the computer. This is not unsecure, it is just a solid base. 
Remember: 
Just because a system is unclear and obfuscated, it does not mean it is secure. security through obscurity is not good. 


Have Fun !
