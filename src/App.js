import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  FormControl,
  FormGroup,
  FormLabel,
  FormControlLabel,
  Switch,
  TextField,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

function App() {
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  return (
    <div>
      <form className={classes.root}>
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
    </div>
  );
}

export default App;
