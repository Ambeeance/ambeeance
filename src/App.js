import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  CssBaseline,
  FormControl,
  FormGroup,
  FormLabel,
  FormControlLabel,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function App() {
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant={'h5'} component={'h1'}>
            Ambeeance
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <Toolbar />
        <form>
          <FormControl component="fieldset">
            <FormLabel component="legend">My App Settings</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch checked={checked} onChange={() => setChecked(!checked)} name="whizbang" />
                }
                label="Whizbang Enabled"
              />
            </FormGroup>
          </FormControl>
          <TextField label="App URL" defaultValue="http://localhost:4000" />
        </form>
      </main>
    </div>
  );
}

export default App;
