import { IonPage, IonSpinner, useIonAlert } from "@ionic/react";
import { BigNumber } from "bignumber.js";

import React, { FormEvent, useState } from "react";
import { useHistory } from "react-router";
import { Tooltip } from "recharts";
import { PAGES, UserContext, UserContextType } from "../App";
import {
  TezosUtils,
  TransactionInvalidBeaconError,
} from "../contractutils/TezosUtils";
import { Storage as TezosTemplateVotingContract } from "../tezosTemplate3.types";
import { address, asMap, int, nat } from "../type-aliases";

const jsonContractTemplate = require("../contracttemplates/tezosTemplate3.tz.json");

export const CreateTezosTemplate: React.FC = () => {
  const { Tezos, userAddress } = React.useContext(
    UserContext
  ) as UserContextType;

  //TEZOS OPERATIONS
  const [loading, setLoading] = React.useState(false);

  // MESSAGES

  const [presentAlert] = useIonAlert();
  const { push } = useHistory();
  // CURRRENT CONTRACT

  const [contract, setContract] = useState<TezosTemplateVotingContract>({
    name: "",
    votingPeriodIndex: new BigNumber(0) as nat,
    options: [],
    results: asMap<string, int>([]),
    votes: asMap<address, string>([]),
    votingPeriodOracle: import.meta.env.VITE_ORACLE_ADDRESS! as address,
  });

  const [currentVotingPeriodIndex, setCurrentVotingPeriodIndex] = useState<nat>(
    new BigNumber(0) as nat
  );
  const [periodDates, setPeriodDates] = useState<Array<Date>>([]);
  const [inputOption, setInputOption] = useState<string>("");

  // INIT ONCE
  React.useEffect(() => {
    (async () => {
      contract.votingPeriodIndex = new BigNumber(
        await TezosUtils.getVotingPeriodIndex(Tezos)
      ) as nat;
      console.log("votingPeriodIndex", contract.votingPeriodIndex);

      setCurrentVotingPeriodIndex(contract.votingPeriodIndex);
      setPeriodDates(
        await TezosUtils.getCurrentAndNextAtBestVotingPeriodDates(Tezos, 5)
      );
      setContract(contract);
    })();
  }, []);

  const createVoteContract = async (
    event: FormEvent<HTMLFormElement>,
    contract: TezosTemplateVotingContract
  ) => {
    event.preventDefault();

    //block if no option
    if (contract.options == undefined || contract.options.length == 0) {
      console.log("At least one option is needed...");
      return;
    }

    setLoading(true);
    console.log(contract);

    Tezos.wallet
      .originate({
        code: jsonContractTemplate,
        storage: {
          name: contract.name,
          votingPeriodIndex: contract.votingPeriodIndex,
          options: contract.options,
          votes: contract.votes, //MichelsonMap<address, string>
          results: contract.results, //MichelsonMap<string, int>
          votingPeriodOracle: contract.votingPeriodOracle,
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
                      value={contract.name}
                      onChange={(e) => {
                        setContract({
                          ...contract,
                          name: e.target.value!,
                        } as TezosTemplateVotingContract);
                      }}
                    />

                    <div style={{ paddingTop: "2em" }}>
                      <FormLabel required id="demo-radio-buttons-group-label">
                        Select a period
                      </FormLabel>
                      <RadioGroup
                        row
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue="25"
                        name="radio-buttons-group"
                        value={contract.votingPeriodIndex}
                        onChange={(e) => {
                          setContract({
                            ...contract,
                            votingPeriodIndex: new BigNumber(e.target.value!),
                          } as TezosTemplateVotingContract);
                        }}
                      >
                        {[...Array(5)].map((_: undefined, index: number) => (
                          <FormControlLabel
                            key={currentVotingPeriodIndex
                              .plus(index)
                              .toNumber()}
                            labelPlacement="top"
                            value={currentVotingPeriodIndex.plus(index)}
                            control={<Radio required />}
                            label={
                              <React.Fragment>
                                <Paper
                                  style={{
                                    padding: "0.5em",
                                    fontSize: "0.8rem",
                                  }}
                                  elevation={3}
                                >
                                  Period{" "}
                                  {currentVotingPeriodIndex
                                    .plus(index)
                                    .toNumber()}
                                  <br />
                                  From{" "}
                                  {periodDates[index]
                                    ? periodDates[index].toLocaleDateString()
                                    : ""}
                                  <br />
                                  To{" "}
                                  {periodDates[index + 1]
                                    ? periodDates[
                                        index + 1
                                      ].toLocaleDateString()
                                    : ""}
                                  <br />
                                  (estimated){" "}
                                </Paper>
                              </React.Fragment>
                            }
                          />
                        ))}
                      </RadioGroup>
                    </div>
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
                          } as TezosTemplateVotingContract);
                          setInputOption("");
                        }}
                      >
                        <Add style={{ padding: "0.4em 0em" }} />
                      </Button>
                    </Tooltip>
                  </Box>

                  <List inputMode="text">
                    {contract.options.map((option: string, index: number) => (
                      <ListItem key={option} disablePadding value={option}>
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
                              } as TezosTemplateVotingContract);
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
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
                        !contract.votingPeriodIndex ||
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
