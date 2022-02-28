type storage = {
  name : string;
  dateTo : timestamp;
  dateFrom : timestamp;
  options : string list;
  votes : (address, string) map; // votes by user
  results : (string, int) map; // results by option
}

//type storage = int

type parameter =
  Vote of string

type return = operation list * storage

//redefining find_opt function
let rec find_opt (type a) ((f, xs) : ((a -> bool) * a list)) : a option = 
    match xs with
      [] -> None
    | x :: xs -> if (f x) then Some x else find_opt (f, xs) 

let vote (store, _ : storage * string) : storage = 
//check if date now is between from/to dates
//if Tezos.now < store.dateFrom || Tezos.now > store.dateTo
//then (failwith ("Not yet the time to vote ") )
//else
//check if option exists
//let _ = match find_opt ((fun (s : string) -> s = option), store.options) with
//Some(o) -> o
//| None -> (failwith ("Option " ^ option ^ "does not exist") ) in
//check if sender has not yet voted
//let _ = match Map.find_opt Tezos.sender store.votes with
//Some v -> (failwith ("A vote with option " ^ v ^ "  already exists for user")) in
//update results cache
// & finally add the new vote
//{store with 
//store.results = match Map.find_opt option store.results with Some r -> Map.add option r+1 store.results | None -> Map.add option 1 store.results  
//store.votes = Map.update option Tezos.sender store.votes}
store  

(* Main access point that dispatches to the entrypoints according to
   the smart contract parameter. *)
let main (action, store : parameter * storage) : return =
 ([] : operation list),    // No operations
 (match action with
   Vote (opt) -> vote(store,opt)
 )