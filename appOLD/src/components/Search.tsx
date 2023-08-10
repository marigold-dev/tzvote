import { NetworkType } from "@airgap/beacon-sdk";
import { Contract, ContractsService } from "@dipdup/tzkt-api";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import {
  BarChart,
  Block,
  Circle,
  EmojiEvents,
  Face,
  RunningWithErrors,
} from "@mui/icons-material";
import BallotIcon from "@mui/icons-material/Ballot";
import {
  Autocomplete,
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { TezosToolkit, WalletContract } from "@taquito/taquito";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import * as moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import { useSnackbar } from "notistack";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  PermissionedSimplePollVotingContract,
  TezosTemplateVotingContract,
  VotingContract,
  VotingContractUtils,
  VOTING_TEMPLATE,
} from "../contractutils/TezosContractUtils";
import {
  STATUS,
  TransactionInvalidBeaconError,
} from "../contractutils/TezosUtils";
momentDurationFormatSetup(moment);

const Search = ({
  Tezos,
  userAddress,
  votingTemplateAddresses,
  bakerPower,
  beaconConnection,
}: {
  Tezos: TezosToolkit;
  userAddress: string;
  votingTemplateAddresses: Map<VOTING_TEMPLATE, string>;
  bakerPower: number;
  beaconConnection: boolean;
}): JSX.Element => {
  //SEARCH
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = useState<Array<string>>([]);
  const loading = open && options.length === 0;
  const [inputValue, setInputValue] = React.useState<string>("");
  const [searchValue, setSearchValue] = React.useState<string | null>(null);

  //LIST
  const [allContracts, setAllContracts] = useState<Array<VotingContract>>([]);
  const [contracts, setContracts] = useState<Array<VotingContract>>([]);

  //SELECTED CONTRACT
  const [selectedContract, setSelectedContract] =
    useState<VotingContract | null>(null);

  //TEZOS OPERATIONS
  const [tezosLoading, setTezosLoading] = React.useState(false);

  // MESSAGES
  const { enqueueSnackbar } = useSnackbar();

  const refreshData = () => {
    (async () => {
      let allTEZOSTEMPLATEContractFromTzkt: Array<Contract> =
        votingTemplateAddresses.get(VOTING_TEMPLATE.TEZOSTEMPLATE)
          ? await contractsService.getSame({
              address: votingTemplateAddresses.get(
                VOTING_TEMPLATE.TEZOSTEMPLATE
              )!,
              includeStorage: true,
              sort: { desc: "id" },
            })
          : new Array<Contract>();
      let allPERMISSIONEDSIMPLEPOLLContractFromTzkt: Array<Contract> =
        votingTemplateAddresses.get(VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL)
          ? await contractsService.getSame({
              address: votingTemplateAddresses.get(
                VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL
              )!,
              includeStorage: true,
              sort: { desc: "id" },
            })
          : new Array<Contract>();
      let allConvertertedTEZOSTEMPLATEContractContracts: Array<TezosTemplateVotingContract> =
        await Promise.all(
          allTEZOSTEMPLATEContractFromTzkt.map(
            async (tzktObject: Contract) =>
              await VotingContractUtils.convertFromTZKTTezosContractToTezosTemplateVotingContract(
                Tezos,
                tzktObject
              )
          )
        );
      let allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts: Array<PermissionedSimplePollVotingContract> =
        allPERMISSIONEDSIMPLEPOLLContractFromTzkt.map(
          (tzktObject: Contract) =>
            new PermissionedSimplePollVotingContract(
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              tzktObject
            )
        );
      setAllContracts([
        ...allConvertertedTEZOSTEMPLATEContractContracts,
        ...allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts,
      ]);
      setOptions(
        Array.from(
          new Set(
            [
              ...allConvertertedTEZOSTEMPLATEContractContracts,
              ...allConvertertedPERMISSIONEDSIMPLEPOLLContractContracts,
            ].map((c: VotingContract) => c.name)
          )
        )
      );
    })();
  };

  const filterOnNewInput = (filterValue: string | null) => {
    if (filterValue == null || filterValue === "") setContracts([]);
    else {
      let filteredContract = allContracts.filter((c: VotingContract) => {
        console.log(filterValue.replace(/[^a-zA-Z0-9]/gi, ".")); //avoid issue of special char on the regex
        return (
          c.name.search(
            new RegExp(filterValue.replace(/[^a-zA-Z0-9]/gi, "."), "gi")
          ) >= 0
        );
      });
      setContracts(filteredContract);
    }
  };

  //EFFECTS
  React.useEffect(refreshData, []); //init load
  React.useEffect(refreshData, [beaconConnection]); //connection events
  React.useEffect(() => filterOnNewInput(inputValue), [allContracts]); //if data refreshed, need to refresh the filtered list too

  const contractsService = new ContractsService({
    baseUrl:
      "https://api." +
      (process.env["REACT_APP_NETWORK"]
        ? NetworkType[
            process.env[
              "REACT_APP_NETWORK"
            ].toUpperCase() as keyof typeof NetworkType
          ]
        : NetworkType.GHOSTNET) +
      ".tzkt.io",
    version: "",
    withCredentials: false,
  });

  const dateSliderToString = (value: number, index: number) => {
    return new Date(value).toLocaleString();
  };

  const durationToString = (value: number): string => {
    return moment
      .duration(value, "milliseconds")
      .format("d [days] hh:mm:ss left");
  };

  /*************************************/
  // *********** BUTTON ACTION AREA ******
  /*************************************/

  //vote popup
  const [votePopup, setVotePopup] = React.useState<null | HTMLElement>(null);
  const showVote = (
    event: React.MouseEvent<HTMLButtonElement>,
    c: VotingContract | null
  ) => {
    setVotePopup(event.currentTarget);
    setSelectedContract(c);
  };
  const closeVote = () => {
    setVotePopup(null);
    setSelectedContract(null);
  };

  //vote button
  const [voteHelperText, setVoteHelperText] = React.useState("");
  const [voteValue, setVoteValue] = React.useState("");
  const handleVoteRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVoteValue(event.target.value);
    setVoteHelperText(" ");
  };
  const handleVoteSubmit = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setTezosLoading(true);

    let c: WalletContract = await Tezos.wallet.at("" + contract.tzkt!.address);
    if (voteValue !== "") {
      try {
        const pkh = await Tezos.wallet.pkh();
        const op = await c.methods.vote(voteValue, pkh).send();
        closeVote();
        await op.confirmation();

        //refresh info on list
        setTimeout(() => {
          console.log("the list will refresh soon");
          refreshData();
          filterOnNewInput(inputValue);
        }, 2000);

        enqueueSnackbar(
          "Your vote has been accepted (wait a bit the refresh)",
          { variant: "success", autoHideDuration: 10000 }
        );
      } catch (error: any) {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        enqueueSnackbar(tibe.data_message, {
          variant: "error",
          autoHideDuration: 10000,
        });
        closeVote();
      } finally {
        setTezosLoading(false);
      }
    } else {
      setVoteHelperText("Please select an option.");
    }
    setTezosLoading(false);
  };

  //membership popup
  const [AddVoterPopup, setAddVoterPopup] = React.useState<null | HTMLElement>(
    null
  );
  const [RemoveVoterPopup, setRemoveVoterPopup] =
    React.useState<null | HTMLElement>(null);
  const showAddVoter = (
    event: React.MouseEvent<HTMLButtonElement>,
    c: VotingContract | null
  ) => {
    setAddVoterPopup(event.currentTarget);
    setSelectedContract(c);
  };
  const showRemoveVoter = (
    event: React.MouseEvent<HTMLButtonElement>,
    c: VotingContract | null
  ) => {
    setRemoveVoterPopup(event.currentTarget);
    setSelectedContract(c);
  };
  const closeAddVoter = () => {
    setAddVoterPopup(null);
    setSelectedContract(null);
  };
  const closeRemoveVoter = () => {
    setRemoveVoterPopup(null);
    setSelectedContract(null);
  };
  //add,remove member button
  const [voterAddress, setVoterAddress] = React.useState<string>("");

  const handleAddVoter = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setTezosLoading(true);
    let c: WalletContract = await Tezos.wallet.at("" + contract.tzkt!.address);
    if (voterAddress !== "") {
      try {
        const op = await c.methods.addVoter(voterAddress).send();
        closeAddVoter();
        await op.confirmation();
        //refresh info on list
        setTimeout(() => {
          console.log("the list will refresh soon");
          refreshData();
          filterOnNewInput(inputValue);
        }, 2000);
        enqueueSnackbar("You have added a new voter (wait a bit the refresh)", {
          variant: "success",
          autoHideDuration: 10000,
        });
      } catch (error: any) {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        enqueueSnackbar(tibe.data_message, {
          variant: "error",
          autoHideDuration: 10000,
        });
        closeAddVoter();
      } finally {
        setTezosLoading(false);
      }
    } else {
      setVoteHelperText("Please, enter an address.");
    }
    setTezosLoading(false);
  };

  const handleRemoveVoter = async (
    event: FormEvent<HTMLFormElement>,
    contract: VotingContract
  ) => {
    event.preventDefault();
    setTezosLoading(true);
    let c: WalletContract = await Tezos.wallet.at(contract.tzkt!.address!);
    if (voterAddress !== "") {
      try {
        const op = await c.methods.removeVoter(voterAddress).send();
        closeRemoveVoter();
        await op.confirmation();
        //refresh info on list
        setTimeout(() => {
          console.log("the list will refresh soon");
          refreshData();
          filterOnNewInput(inputValue);
        }, 2000);
        enqueueSnackbar("You have removed a voter (wait a bit the refresh)", {
          variant: "success",
          autoHideDuration: 10000,
        });
      } catch (error: any) {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        enqueueSnackbar(tibe.data_message, {
          variant: "error",
          autoHideDuration: 10000,
        });
        closeRemoveVoter();
      } finally {
        setTezosLoading(false);
      }
    } else {
      setVoteHelperText("Please, enter an address.");
    }
    setTezosLoading(false);
  };

  const buttonChoices = (contract: VotingContract) => {
    let canVote = false;
    switch (contract.type) {
      case VOTING_TEMPLATE.TEZOSTEMPLATE:
        canVote = (contract as TezosTemplateVotingContract).userCanVoteNow(
          userAddress,
          bakerPower
        );
        break;
      case VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL:
        canVote = (
          contract as PermissionedSimplePollVotingContract
        ).userCanVoteNow(userAddress);
        break;
    }
    return (
      <Box display="flex">
        {canVote ? (
          <Button
            style={{ margin: "0.2em" }}
            aria-describedby={"votePopupId" + selectedContract?.tzkt!.address}
            variant="contained"
            onClick={(e) => showVote(e, contract)}
          >
            VOTE
          </Button>
        ) : (
          ""
        )}

        {selectedContract != null ? (
          <Popover
            id={"votePopupId" + selectedContract?.tzkt!.address}
            anchorEl={votePopup}
            open={Boolean(votePopup)}
            onClose={closeVote}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Paper elevation={3} sx={{ minWidth: "20em", minHeight: "10em" }}>
              <div style={{ padding: "1em" }}>
                <form onSubmit={(e) => handleVoteSubmit(e, selectedContract)}>
                  <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">
                      Options
                    </FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      name="radio-buttons-group"
                      value={voteValue}
                      onChange={handleVoteRadioChange}
                    >
                      {selectedContract.options.map((option: string) => (
                        <FormControlLabel
                          key={option}
                          value={option}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                    <FormHelperText style={{ color: "red" }}>
                      {voteHelperText}
                    </FormHelperText>
                    <Button
                      sx={{ mt: 1, mr: 1 }}
                      type="submit"
                      variant="outlined"
                    >
                      VOTE
                    </Button>
                  </FormControl>
                </form>
              </div>
            </Paper>
          </Popover>
        ) : (
          <div />
        )}

        {contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL &&
        (contract as PermissionedSimplePollVotingContract).owner ==
          userAddress ? (
          <div>
            <Button
              style={{ margin: "0.2em" }}
              aria-describedby={
                "addVoterPopupId" + selectedContract?.tzkt!.address
              }
              variant="contained"
              onClick={(e) => showAddVoter(e, contract)}
            >
              Add voter
            </Button>
            <Button
              style={{ margin: "0.2em" }}
              aria-describedby={
                "removeVoterPopupId" + selectedContract?.tzkt!.address
              }
              variant="contained"
              onClick={(e) => showRemoveVoter(e, contract)}
            >
              Remove voter
            </Button>
          </div>
        ) : (
          ""
        )}

        {selectedContract != null ? (
          <div>
            <Popover
              id={"addVoterPopupId" + selectedContract?.tzkt!.address}
              anchorEl={AddVoterPopup}
              open={Boolean(AddVoterPopup)}
              onClose={closeAddVoter}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Paper elevation={3} sx={{ minWidth: "20em", minHeight: "10em" }}>
                <div style={{ padding: "1em" }}>
                  <form onSubmit={(e) => handleAddVoter(e, selectedContract!)}>
                    <FormControl>
                      <FormLabel id="demo-radio-buttons-group-label">
                        Enter an address
                      </FormLabel>
                      <Input
                        type="text"
                        placeholder="tz..."
                        required
                        value={voterAddress}
                        onChange={(e) => setVoterAddress(e.target.value)}
                      />
                      <Button
                        sx={{ mt: 1, mr: 1 }}
                        type="submit"
                        variant="outlined"
                      >
                        Add voter
                      </Button>
                    </FormControl>
                  </form>
                </div>
              </Paper>
            </Popover>

            <Popover
              id={"removeVoterPopupId" + selectedContract?.tzkt!.address}
              anchorEl={RemoveVoterPopup}
              open={Boolean(RemoveVoterPopup)}
              onClose={closeRemoveVoter}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <Paper elevation={3} sx={{ minWidth: "20em", minHeight: "10em" }}>
                <div style={{ padding: "1em" }}>
                  <form
                    onSubmit={(e) => handleRemoveVoter(e, selectedContract)}
                  >
                    <FormControl>
                      <FormLabel id="demo-radio-buttons-group-label">
                        Enter an address
                      </FormLabel>
                      <Input
                        type="text"
                        placeholder="tz..."
                        required
                        value={voterAddress}
                        onChange={(e) => setVoterAddress(e.target.value)}
                      />

                      <Button
                        sx={{ mt: 1, mr: 1 }}
                        type="submit"
                        variant="outlined"
                      >
                        Remove voter
                      </Button>
                    </FormControl>
                  </form>
                </div>
              </Paper>
            </Popover>
          </div>
        ) : (
          ""
        )}

        {contract.type == VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL ? (
          <Tooltip
            enterTouchDelay={0}
            title={
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ margin: 0, padding: 0, color: "white" }}>
                        Registered users
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(
                      contract as PermissionedSimplePollVotingContract
                    ).registeredVoters.map((c) => (
                      <TableRow key={c}>
                        <TableCell
                          sx={{ margin: 0, padding: 0, color: "white" }}
                          component="th"
                          scope="row"
                        >
                          {c}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            }
          >
            <BallotIcon
              color="info"
              sx={{ height: "1.75em", width: "1.75em" }}
            />
          </Tooltip>
        ) : (
          ""
        )}
      </Box>
    );
  };

  /*************************************/
  /***  RESULT AREA *******************
   *************************************/

  //popupresults
  const [resultPopup, setResultPopup] = React.useState<null | HTMLElement>(
    null
  );
  const showResults = (
    event: React.MouseEvent<HTMLDivElement>,
    c: VotingContract
  ) => {
    setSelectedContract(c);
    setResultPopup(event.currentTarget);
  };
  const closeResults = () => {
    setSelectedContract(null);
    setResultPopup(null);
  };

  const getWinner = (contract: VotingContract): Array<string> => {
    var winnerList: Array<string> = [];
    var maxScore: number = 0;
    for (let [key, value] of contract.results) {
      if (value == maxScore) {
        winnerList.push(key);
      } else if (value > maxScore) {
        winnerList = [];
        winnerList.push(key);
      } else {
        //pass
      }
    }
    return winnerList;
  };

  const resultArea = (contract: VotingContract) => {
    const popover = (): ReactJSXElement => {
      if (selectedContract != null) {
        let data = Array.from(selectedContract.results.keys()).map((key) => {
          return { name: key, value: selectedContract.results.get(key) };
        });
        let getColorArray = (dataItems: Array<any>): Map<string, string> => {
          var result = new Map<string, string>();
          for (let dataitem of dataItems) {
            var letters = "0123456789ABCDEF".split("");
            var color = "#";
            for (var j = 0; j < 6; j += 1) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            result.set(dataitem.name, color);
          }
          return result;
        };
        const COLORS = getColorArray(data);

        const RADIAN = Math.PI / 180;
        const renderCustomizedLabel = ({
          cx,
          cy,
          midAngle,
          innerRadius,
          outerRadius,
          percent,
          index,
        }: any) => {
          const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          return (
            <text
              fontSize={"0.8em"}
              x={x}
              y={y}
              fill="white"
              textAnchor={x > cx ? "start" : "end"}
              dominantBaseline="central"
            >
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          );
        };

        return (
          <Popover
            id={"resultPopupId" + selectedContract?.tzkt!.address}
            sx={{
              pointerEvents: "none",
            }}
            anchorEl={resultPopup}
            open={Boolean(resultPopup)}
            onClose={closeResults}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Paper elevation={3} sx={{ minWidth: "90vw", minHeight: "50vh" }}>
              <Grid container height={100}>
                <Grid item xs={8}>
                  <div style={{ padding: "0.2em" }}>
                    <TableContainer component={Paper}>
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Options</TableCell>
                            <TableCell align="right">Result</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries<string>(
                            selectedContract?.options
                          ).map(([key, value]) => (
                            <TableRow
                              key={key}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Circle htmlColor={COLORS.get(value)} /> {value}
                              </TableCell>
                              <TableCell align="right">
                                {" "}
                                {getWinner(selectedContract).indexOf(value) >=
                                0 ? (
                                  <EmojiEvents />
                                ) : (
                                  ""
                                )}
                                {selectedContract?.results.get(value)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <Grid item xs={4}>
                    <div style={{ padding: "0.2em" }}>
                      <PieChart
                        width={window.innerWidth * 0.3}
                        height={window.innerHeight * 0.3}
                      >
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius="100%"
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {data.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS.get(entry.name)}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </div>
                  </Grid>

                  <Grid>
                    <div style={{ padding: "0.2em" }}>
                      <Chip
                        avatar={<Avatar>{selectedContract?.votes.size}</Avatar>}
                        label="Voters"
                      />
                    </div>

                    {selectedContract.type == VOTING_TEMPLATE.TEZOSTEMPLATE ? (
                      <div style={{ padding: "0.2em" }}>
                        <Chip
                          avatar={
                            <Avatar>
                              {Array.from(
                                selectedContract?.results.values()
                              ).reduce(
                                (value: number, acc: number) => value + acc,
                                0
                              )}
                            </Avatar>
                          }
                          label="Baker power"
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Popover>
        );
      } else return <div />;
    };

    // STATUS.ONGOING
    let status = contract.status;
    if (status == STATUS.ONGOING) {
      return (
        <div>
          <Chip
            aria-owns={
              open ? "resultPopupId" + contract.tzkt!.address : undefined
            }
            aria-haspopup="true"
            onMouseEnter={(e) => showResults(e, contract)}
            onMouseLeave={closeResults}
            icon={<RunningWithErrors />}
            color="success"
            label={status}
          />
          <Slider
            component="div"
            style={{ width: "90%" }}
            aria-label="Period"
            key={`slider-${contract.tzkt!.address}`}
            value={new Date().getTime()}
            getAriaValueText={dateSliderToString}
            valueLabelFormat={dateSliderToString}
            valueLabelDisplay="auto"
            min={contract.dateFrom.getTime()}
            max={contract.dateTo.getTime()}
          />
          <div>{durationToString(contract.dateTo.getTime() - Date.now())}</div>

          {popover()}
        </div>
      );
    } else {
      // STATUS.LOCKED
      const winnerList = getWinner(contract);
      if (winnerList.length > 0) {
        const result: string = "Winner is : " + winnerList.join(" , ");
        return (
          <div>
            <Chip
              icon={<BarChart />}
              aria-owns={
                open ? "resultPopupId" + contract.tzkt!.address : undefined
              }
              aria-haspopup="true"
              onMouseEnter={(e) => showResults(e, contract)}
              onMouseLeave={closeResults}
              style={{ margin: "0.2em" }}
              color="error"
              label={
                <span>
                  {status}
                  <br />

                  {contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE
                    ? "Period : " +
                      (contract as TezosTemplateVotingContract)
                        .votingPeriodIndex
                    : "From " +
                      (contract as PermissionedSimplePollVotingContract)
                        .dateFrom +
                      " to " +
                      (
                        contract as PermissionedSimplePollVotingContract
                      ).dateTo.toLocaleString()}
                </span>
              }
            />
            <Chip
              style={{ margin: "0.2em" }}
              icon={<EmojiEvents />}
              label={result}
            />
            {popover()}
          </div>
        );
      } else {
        return (
          <div>
            <Chip
              icon={<BarChart />}
              aria-owns={
                open ? "resultPopupId" + contract.tzkt!.address : undefined
              }
              aria-haspopup="true"
              onMouseEnter={(e) => showResults(e, contract)}
              onMouseLeave={closeResults}
              style={{ margin: "0.2em" }}
              color="warning"
              label={
                <span>
                  {status}
                  <br />

                  {contract.type == VOTING_TEMPLATE.TEZOSTEMPLATE
                    ? "Period : " +
                      (contract as TezosTemplateVotingContract)
                        .votingPeriodIndex
                    : "From " +
                      (contract as PermissionedSimplePollVotingContract)
                        .dateFrom +
                      " to " +
                      (
                        contract as PermissionedSimplePollVotingContract
                      ).dateTo.toLocaleString()}
                </span>
              }
            />
            <Chip
              style={{ margin: "0.2em" }}
              icon={<Block />}
              label="NO WINNER"
            />
          </div>
        );
      }
    }
  };

  /*************************************/
  /***  MAIN FRAME *******************
   *************************************/
  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
        open={tezosLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Autocomplete
        id="searchInput"
        freeSolo
        autoComplete
        filterSelectedOptions
        value={searchValue}
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        isOptionEqualToValue={(option, value) => option === value}
        getOptionLabel={(option) => option}
        options={options}
        loading={loading}
        loadingText="Type at least 2 characters for autocomplete"
        renderInput={(params) => (
          <TextField {...params} label="Search ... and press Enter" fullWidth />
        )}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          filterOnNewInput(newValue);
        }}
        renderOption={(props, option, { inputValue }) => {
          const matches = match(option, inputValue);
          const parts = parse(option, matches);
          return (
            <li {...props}>
              <div>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                    }}
                  >
                    {part.text}
                  </span>
                ))}
              </div>
            </li>
          );
        }}
      />

      {contracts.length == 0 ? (
        <div id="dialog-login">
          <header>Free voting Dapp</header>
          <div id="content-login">
            <div>
              Voting session journey
              <div>
                <hr />
                <div>
                  Login : Connect to your wallet to enable blockchain
                  interactions, or just skip and continue read only
                </div>
                <br />
                <div>
                  Search : See voting session details, vote and display results
                  on status icon
                </div>
                <br />
                <div>
                  Create : Create new voting sessions from templates{" "}
                  <Tooltip
                    enterTouchDelay={0}
                    title={VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.description}
                  >
                    <Chip
                      color="info"
                      label={VOTING_TEMPLATE.PERMISSIONEDSIMPLEPOLL.name}
                    />
                  </Tooltip>{" "}
                  or{" "}
                  <Tooltip
                    enterTouchDelay={0}
                    title={VOTING_TEMPLATE.TEZOSTEMPLATE.description}
                  >
                    <Chip
                      color="info"
                      label={VOTING_TEMPLATE.TEZOSTEMPLATE.name}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {contracts.map((contract, index) => (
        <Card
          key={contract.tzkt!.address}
          sx={{ display: "flex", marginTop: "0.2em" }}
        >
          <Box width="60%" sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: "1 0 auto", padding: "1vw" }}>
              <Typography component="div" variant="h6">
                <a
                  href={`https://${
                    process.env["REACT_APP_NETWORK"]
                      ? NetworkType[
                          process.env[
                            "REACT_APP_NETWORK"
                          ].toUpperCase() as keyof typeof NetworkType
                        ]
                      : NetworkType.GHOSTNET
                  }.tzkt.io/${contract.tzkt!.address}/info`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contract.name}
                </a>

                <Tooltip enterTouchDelay={0} title={contract.type.description}>
                  <Chip color="info" label={contract.type.name} />
                </Tooltip>
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.secondary"
                component="div"
              >
                <div>Created by </div>
                <Chip
                  style={{ maxWidth: "40vw" }}
                  icon={<Face />}
                  label={contract.tzkt!.creator?.address}
                  clickable
                  target="_blank"
                  component="a"
                  href={
                    `https://` +
                    (process.env["REACT_APP_NETWORK"]
                      ? NetworkType[
                          process.env[
                            "REACT_APP_NETWORK"
                          ].toUpperCase() as keyof typeof NetworkType
                        ]
                      : NetworkType.GHOSTNET) +
                    `.tzkt.io/${contract.tzkt!.creator?.address}/info`
                  }
                />
              </Typography>

              {buttonChoices(contract)}
            </CardContent>
          </Box>

          <Box width="40%" paddingTop="1em">
            {resultArea(contract)}
          </Box>
        </Card>
      ))}
    </div>
  );
};

export default Search;
