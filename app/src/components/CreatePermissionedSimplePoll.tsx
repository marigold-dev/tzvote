import { IonDatetime, IonPage, IonSpinner } from "@ionic/react";

import { MichelsonMap } from "@taquito/taquito";

import { useIonAlert } from "@ionic/react";
import React, { FormEvent, useState } from "react";
import { useHistory } from "react-router";
import { Tooltip } from "recharts";
import { PAGES, UserContext, UserContextType } from "../App";
import { TransactionInvalidBeaconError } from "../contractutils/TezosUtils";
import { Storage as PermissionedSimplePollVotingContract } from "../permissionedSimplePoll.types";
import { address, asMap, int, timestamp } from "../type-aliases";

const jsonContractTemplate = require("../contracttemplates/permissionedSimplePoll.tz.json");

export const CreatePermissionedSimplePoll: React.FC = () => {
  const { Tezos, userAddress, bakerDelegators } = React.useContext(
    UserContext
  ) as UserContextType;

  const { push } = useHistory();

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  // MESSAGES

  const [presentAlert] = useIonAlert();

  // CURRRENT CONTRACT

  const [contract, setContract] =
    useState<PermissionedSimplePollVotingContract>({
      name: "Enter question here ...",
      from_: new Date().toISOString() as timestamp,
      to: new Date().toISOString() as timestamp,
      options: [],
      registeredVoters: [],
      results: asMap<string, int>([]),
      votes: asMap<address, string>([]),
      owner: userAddress as address,
    });

  const [inputOption, setInputOption] = useState<string>("");
  const [inputVoter, setInputVoter] = useState<string>("");

  const createVoteContract = async (
    event: FormEvent<HTMLFormElement>,
    contract: PermissionedSimplePollVotingContract
  ) => {
    event.preventDefault();

    //block if no option
    if (contract.options == undefined || contract.options.length == 0) {
      console.log("At least one option is needed...");
      return;
    }

    //block if no option
    if (!contract.from_ || !contract.to) {
      console.log("All dates are required");
      return;
    }

    setLoading(true);

    Tezos.wallet
      .originate({
        code: jsonContractTemplate,
        storage: {
          name: contract.name,
          from_: contract.from_,
          to: contract.to,
          options: contract.options,
          owner: contract.owner,
          registeredVoters: contract.registeredVoters,
          results: MichelsonMap.fromLiteral(contract.results), //MichelsonMap<string, int>
          votes: MichelsonMap.fromLiteral(contract.votes), //MichelsonMap<address, string>
        },
      })
      .send()
      .then((originationOp) => {
        console.log(`Waiting for confirmation of origination...`);
        return originationOp.contract();
      })
      .then((contract) => {
        push(PAGES.SEARCH);
        presentAlert({
          header: "Success",
          message: `Origination completed for ${contract.address}.`,
        });
      })
      .catch((error) => {
        console.table(`Error: ${JSON.stringify(error, null, 2)}`);
        let tibe: TransactionInvalidBeaconError =
          new TransactionInvalidBeaconError(error);
        presentAlert({
          header: "Error",
          message: tibe.data_message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <IonPage>
      {loading ? (
        <IonSpinner color="inherit" />
      ) : (
        <>
          <form onSubmit={(e) => createVoteContract(e, contract)}>
            <FormControl fullWidth>
              <Grid container>
                <Grid item xs={12}>
                  <Box>
                    <TextField
                      fullWidth
                      required
                      id="name"
                      label="Question"
                      onChange={(e) => {
                        setContract({
                          ...contract,
                          name: e.target.value!,
                        } as PermissionedSimplePollVotingContract);
                      }}
                    />

                    <FormLabel
                      sx={{ paddingTop: "1em", paddingBottom: "1em" }}
                      component="div"
                      required
                      id="demo-radio-buttons-group-label"
                    >
                      Select dates
                    </FormLabel>

                    <IonDatetime
                      value={contract.from_}
                      onIonChange={(e) => {
                        setContract({
                          ...contract,
                          dateFrom: e.target.value!,
                        } as PermissionedSimplePollVotingContract);
                      }}
                    >
                      <span slot="time-label">Enter start date*</span>
                    </IonDatetime>

                    <Box component="div" sx={{ height: "1em" }} />

                    <IonDatetime
                      value={contract.to}
                      onIonChange={(e) => {
                        setContract({
                          ...contract,
                          dateTo: e.target.value!,
                        } as PermissionedSimplePollVotingContract);
                      }}
                    >
                      <span slot="time-label">Enter end date*</span>
                    </IonDatetime>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <FormLabel
                    error={contract.options.length == 0}
                    required
                    id="demo-radio-buttons-group-label"
                  >
                    Options
                  </FormLabel>

                  <Box alignContent={"center"}>
                    <TextField
                      value={inputOption}
                      label="type your option here"
                      onChange={(e) => setInputOption(e.target.value)}
                    ></TextField>
                    <Tooltip
                      open={contract.options.length == 0}
                      title="At least one option is needed"
                      placement="top-end"
                      aria-label="add"
                    >
                      <Button
                        sx={{ marginLeft: "1em" }}
                        variant="outlined"
                        onClick={() => {
                          setContract({
                            ...contract,
                            options: contract.options.concat(inputOption),
                          } as PermissionedSimplePollVotingContract);
                          setInputOption("");
                        }}
                      >
                        <Add style={{ padding: "0.4em 0em" }} />
                      </Button>
                    </Tooltip>
                  </Box>

                  <List inputMode="text">
                    {contract.options.map((option: string, index: number) => (
                      <ListItem key={index} disablePadding value={option}>
                        <ListItemButton>
                          <ListItemIcon>
                            <RadioButtonUncheckedIcon />
                          </ListItemIcon>
                          <FormLabel>{option}</FormLabel>
                          <Delete
                            onClick={() => {
                              contract.options.splice(index, 1);
                              setContract({
                                ...contract,
                                options: contract.options,
                              } as PermissionedSimplePollVotingContract);
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>

                  <FormLabel>Registered voters</FormLabel>
                  <Box alignContent={"center"}>
                    {bakerDelegators.length > 0 ? (
                      <Button
                        sx={{ marginRight: "1em", marginBottom: "0.2em" }}
                        variant="outlined"
                        onClick={() => {
                          setContract({
                            ...contract,
                            registeredVoters: bakerDelegators,
                          } as PermissionedSimplePollVotingContract);
                        }}
                      >
                        Add all delegators
                      </Button>
                    ) : (
                      ""
                    )}

                    <TextField
                      value={inputVoter}
                      label="Add voter here"
                      onChange={(e) => setInputVoter(e.target.value)}
                    ></TextField>
                    <Button
                      sx={{ marginLeft: "1em" }}
                      variant="outlined"
                      onClick={() => {
                        setContract({
                          ...contract,
                          registeredVoters: [
                            ...contract.registeredVoters,
                            inputVoter as address,
                          ],
                        } as PermissionedSimplePollVotingContract);
                        setInputVoter("");
                      }}
                    >
                      <Add style={{ padding: "0.4em 0em" }} />
                    </Button>
                  </Box>
                  <List inputMode="text">
                    {contract.registeredVoters.map(
                      (voter: string, index: number) => (
                        <ListItem key={voter} disablePadding value={voter}>
                          <ListItemButton>
                            <ListItemIcon>
                              <RadioButtonUncheckedIcon />
                            </ListItemIcon>
                            <FormLabel>{voter}</FormLabel>
                            <Delete
                              onClick={() => {
                                contract.registeredVoters.splice(index, 1);
                                setContract({
                                  ...contract,
                                  registeredVoters: contract.registeredVoters,
                                } as PermissionedSimplePollVotingContract);
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    )}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Box textAlign="center">
                    <Button
                      sx={{ mt: 1, mr: 1 }}
                      type="submit"
                      variant="contained"
                      disabled={
                        !contract.name ||
                        !contract.from_ ||
                        !contract.to ||
                        contract.options.length == 0
                      }
                    >
                      CREATE
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </FormControl>
          </form>
        </>
      )}
    </IonPage>
  );
};

export default CreatePermissionedSimplePoll;
