import React, { useState } from "react";
import {
  AppBar,
  createTheme,
  CssBaseline,
  Toolbar,
  Typography,
  ThemeProvider,
  Card,
  makeStyles,
  CardContent,
  Grid,
  CardHeader,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@material-ui/core";
import { blue, pink } from "@material-ui/core/colors";
import AccountTreeRoundedIcon from "@material-ui/icons/AccountTreeRounded";
import { Graph } from "react-d3-graph";
import UserDataService from "./services/UserDataService";

const theme = createTheme({
  palette: {
    primary: blue,
    secondary: pink,
  },
});

const useStyles = makeStyles((theme) => ({
  main: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
}));

const App = () => {
  const styles = useStyles();
  const [data, setData] = useState(UserDataService.getD3GraphData());
  const [source, setSource] = useState("0");
  const [target, setTarget] = useState("0");
  const [noNodes, setNoNodes] = useState("50");
  const [noEdges, setNoEdges] = useState("80");
  const { d3Config } = UserDataService;

  const onLoadSuggestions = () => {
    if (Number.isNaN(source)) {
      return;
    }

    UserDataService.loadSuggestions(Number(source));
    setData(UserDataService.getD3GraphData());
  };

  const onFindPath = () => {
    if (Number.isNaN(source) || Number.isNaN(target)) {
      return;
    }

    UserDataService.loadPath(Number(source), Number(target));
    setData(UserDataService.getD3GraphData());
  };

  const onFindNode = () => {
    if (Number.isNaN(source)) {
      return;
    }

    UserDataService.findNode(Number(source));
    setData(UserDataService.getD3GraphData());
  };

  const onFindEdge = () => {
    if (Number.isNaN(source) || Number.isNaN(target)) {
      return;
    }

    UserDataService.findEdge(Number(source), Number(target));
    setData(UserDataService.getD3GraphData());
  };

  const onDeleteNode = () => {
    if (Number.isNaN(source)) {
      return;
    }

    UserDataService.deleteNode(Number(source));
    setData(UserDataService.getD3GraphData());
  };

  const onDeleteEdge = () => {
    if (Number.isNaN(source) || Number.isNaN(target)) {
      return;
    }

    UserDataService.deleteEdge(Number(source), Number(target));
    setData(UserDataService.getD3GraphData());
  };

  const onReset = () => {
    UserDataService.reset();
    setData(UserDataService.getD3GraphData());
  };

  const onGenerateRamdon = () => {
    setSource("0");
    setTarget("0");

    UserDataService.generateRamdonGraph(Number(noNodes), Number(noEdges));
    setData(UserDataService.getD3GraphData());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <AccountTreeRoundedIcon style={{ marginRight: 10 }} />
          <Typography variant="h6" color="inherit" noWrap>
            Social Graph Homework
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={styles.main}>
        <Grid container spacing={2}>
          <Grid item xs={9}>
            <Card>
              <CardHeader title="Graph" />
              <CardContent>
                <div style={{ margin: "0 auto", height: 700, width: 1100 }}>
                  <Graph
                    id="graph-id"
                    data={data}
                    config={d3Config}
                    onClickNode={(nodeId) => setSource(nodeId)}
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card>
              <CardHeader title="Form" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel htmlFor="source-input">Source</InputLabel>
                      <OutlinedInput
                        id="source-input"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        labelWidth={60}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel htmlFor="target-input">Target</InputLabel>
                      <OutlinedInput
                        id="target-input"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        labelWidth={60}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onFindNode}
                    >
                      Find Source Node
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onFindEdge}
                    >
                      Find Edge
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onDeleteNode}
                    >
                      Delte Source Node
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onDeleteEdge}
                    >
                      Delete Edge
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onLoadSuggestions}
                    >
                      Find Suggestions
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={onFindPath}
                    >
                      Find Path
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="nodes-input"># Nodes</InputLabel>
                          <OutlinedInput
                            id="nodes-input"
                            value={noNodes}
                            onChange={(e) => setNoNodes(e.target.value)}
                            labelWidth={60}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel htmlFor="edges-input">
                            # Relations
                          </InputLabel>
                          <OutlinedInput
                            id="edges-input"
                            value={noEdges}
                            onChange={(e) => setNoEdges(e.target.value)}
                            labelWidth={60}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={onGenerateRamdon}
                    >
                      Generate Ramdon Graph
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={onReset}
                    >
                      Reset
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="default"
                      onClick={() => {
                        UserDataService.printJSON();
                      }}
                    >
                      print json
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </main>
    </ThemeProvider>
  );
};

export default App;
