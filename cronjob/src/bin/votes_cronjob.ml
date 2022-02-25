let cron_time = Get_envs.cron_time()
let protocol = Get_envs.protocol()
let tezos_client_path = Get_envs.tezos_client_path()

let job () =
  print_endline "Hello, world !";
  let _ = Sys.command "ls" in
  ()
;;

let rec cronjob () =
  let cron = Lwt_unix.sleep 10. in
  let jobLoop () =
    job ();
    cronjob ()
  in
  Lwt.bind cron jobLoop
;;

let _ = Lwt_main.run (cronjob())  
