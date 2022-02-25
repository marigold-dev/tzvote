let cron_time = Get_envs.cron_time()
let protocol = Get_envs.protocol()
let tezos_client_path = Get_envs.tezos_client_path()

let job () =
  print_endline "Hello, world !";
  let _ = Sys.command "ls" in
  ()
;;

let rec cronjob () =
  let cron = Lwt_unix.sleep 1. in
  let jobLoop () =
    job ();
    cronjob ()
  in
  Lwt.bind cron jobLoop
;;

Lwt.async cronjob

(* WHILE TRUE *)
let () =
  let rec echo_loop () =
    let%lwt line = Lwt_io.(read_line stdin) in
    if line = "exit"
    then Lwt.return_unit
    else (
      let%lwt () = Lwt_io.(write_line stdout line) in
      echo_loop ())
  in
  Lwt_main.run (echo_loop ())
;;
