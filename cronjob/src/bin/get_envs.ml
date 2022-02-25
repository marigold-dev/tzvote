let cron_time () =
  match Sys.getenv_opt "CRON_TIME" with
  | Some env -> int_of_string env
  | None -> 30
;;

let protocol () =
  match Sys.getenv_opt "PROTOCOL" with
  | Some env -> env
  | None -> "MAINNET"
;;

let tezos_client_path () =
  match Sys.getenv_opt "TEZOS_CLIENT_PATH" with
  | Some env -> env
  | None -> "/usr/local/bin/tezos-node"
;;